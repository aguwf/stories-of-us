import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { locationEdits, locations, users } from "@/server/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

const ReviewDetailsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(0).max(5),
  comment: z.string().optional().default(""),
  photos: z.array(z.string()).optional(),
  createdAt: z.string(),
});

const ReviewSummarySchema = z.object({
  avgRating: z.number().nullable(),
  reviewCount: z.number(),
  photoCount: z.number(),
});

const LocationDetailsSchema = z
  .object({
    openingHours: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    tags: z.array(z.string()).optional(),
    price: z.number().int().min(1).max(4).optional(),
    amenities: z.array(z.string()).optional(),
    popularity: z.number().min(0).max(100).optional(),
    reviews: z.array(ReviewDetailsSchema).optional(),
    reviewSummary: ReviewSummarySchema.optional(),
    userReview: ReviewDetailsSchema.optional(),
    reviewPhotos: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    moderationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  })
  .strict();

const LocationValidation = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  images: z.array(z.string()).optional(),
  details: z.union([LocationDetailsSchema, z.string()]).optional().nullable(),
});

type EnsureUserCtx = {
  auth?: { userId: string | null };
  db: typeof import("@/server/db").db;
};

const parseLocationDetails = (
  details: z.infer<typeof LocationValidation>["details"]
) => {
  if (details === undefined || details === null) {
    return null;
  }

  try {
    const normalized =
      typeof details === "string" ? JSON.parse(details) : details;

    return LocationDetailsSchema.parse(normalized);
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid location details payload",
      cause: error,
    });
  }
};

const ensureUserExists = async (ctx: EnsureUserCtx) => {
  const userId = ctx.auth?.userId;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const existingUser = await ctx.db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    ) ?? clerkUser.emailAddresses[0];

  const email = primaryEmail?.emailAddress ?? `${userId}@unknown.local`;
  const name = clerkUser.fullName ?? clerkUser.username ?? email;
  const avatar = clerkUser.imageUrl ?? "";
  const emailVerified =
    primaryEmail?.verification?.status === "verified" ? new Date() : new Date();

  await ctx.db
    .insert(users)
    .values({
      id: userId,
      name,
      email,
      emailVerified,
      avatar,
    })
    .onConflictDoNothing();

  return ctx.db.query.users.findFirst({
    where: eq(users.id, userId),
  });
};

export const DUPLICATE_DEFAULT_RADIUS_METERS = 100;

export const normalizeName = (name: string) => name.trim().toLowerCase();

export const computeBoundingBox = (
  lat: number,
  lng: number,
  radiusMeters: number
) => {
  const latRadius = radiusMeters / 111_320;
  const lngRadius = radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latRadius,
    maxLat: lat + latRadius,
    minLng: lng - lngRadius,
    maxLng: lng + lngRadius,
  };
};

const findDuplicates = async (ctx: EnsureUserCtx & { auth?: { userId: string | null } }, params: {
  name: string;
  lat: number;
  lng: number;
  excludeId?: number;
  proximityMeters?: number;
}) => {
  const radius = params.proximityMeters ?? DUPLICATE_DEFAULT_RADIUS_METERS;
  const { minLat, maxLat, minLng, maxLng } = computeBoundingBox(
    params.lat,
    params.lng,
    radius
  );
  const normalizedName = normalizeName(params.name);

  const rows = await ctx.db.execute(
    sql`
      SELECT id, name, address, lat, lng, status
      FROM "stories-of-us_location"
      WHERE lat BETWEEN ${minLat} AND ${maxLat}
        AND lng BETWEEN ${minLng} AND ${maxLng}
        AND LOWER(TRIM(name)) = ${normalizedName}
        ${params.excludeId ? sql`AND id != ${params.excludeId}` : sql``}
    `
  );

  return rows.rows as Array<{
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    status: string;
  }>;
};

export const LocationSubmissionPayload = LocationValidation;

const LocationSubmissionInput = z.object({
  locationId: z.number().optional(),
  payload: LocationSubmissionPayload,
  reason: z.string().optional(),
});

const DuplicateCheckSchema = z.object({
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  excludeId: z.number().optional(),
  proximityMeters: z.number().min(1).max(5000).optional(),
});

export const locationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(LocationValidation)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ensureUserExists(ctx);
      const details = parseLocationDetails(input.details);

      const duplicates = await findDuplicates(ctx, {
        name: input.name,
        lat: input.lat,
        lng: input.lng,
      });

      if (duplicates.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A similar location already exists nearby",
          cause: duplicates,
        });
      }

      await ctx.db.insert(locations).values({
        name: input.name,
        address: input.address,
        description: input.description ?? null,
        lat: input.lat,
        lng: input.lng,
        images: input.images ?? [],
        details,
        status: "pending",
        createdBy: userId,
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.locations.findMany({
      where: eq(locations.status, "approved"),
      with: {
        creator: true,
      },
    });
  }),

  getPending: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.locations.findMany({
      where: eq(locations.status, "pending"),
      with: {
        creator: true,
      },
    });
  }),

  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(locations)
        .set({ status: "approved" })
        .where(eq(locations.id, input.id));
    }),

  reject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(locations)
        .set({ status: "rejected" })
        .where(eq(locations.id, input.id));
    }),

  checkDuplicates: publicProcedure
    .input(DuplicateCheckSchema)
    .query(async ({ ctx, input }) => {
      return findDuplicates(ctx, input);
    }),

  submitEdit: protectedProcedure
    .input(LocationSubmissionInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await ensureUserExists(ctx);

      if (input.locationId) {
        const existing = await ctx.db.query.locations.findFirst({
          where: eq(locations.id, input.locationId),
        });
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Location not found" });
        }
      }

      const details = parseLocationDetails(input.payload.details);
      const duplicates = await findDuplicates(ctx, {
        name: input.payload.name,
        lat: input.payload.lat,
        lng: input.payload.lng,
        excludeId: input.locationId,
      });

      const [row] = await ctx.db
        .insert(locationEdits)
        .values({
          locationId: input.locationId ?? null,
          type: input.locationId ? "edit" : "new",
          payload: {
            ...input.payload,
            details,
          },
          status: "pending",
          reason: input.reason,
          createdBy: userId,
        })
        .returning({ id: locationEdits.id });

      return {
        id: row?.id,
        duplicates,
      };
    }),

  getSubmissions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth?.userId;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    return ctx.db.query.locationEdits.findMany({
      where: eq(locationEdits.createdBy, userId),
      with: {
        location: true,
      },
      orderBy: (edit, { desc }) => [desc(edit.createdAt)],
    });
  }),

  getQueue: adminProcedure
    .input(
      z
        .object({
          status: z.array(z.enum(["pending", "approved", "rejected"])).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const statusFilter = input?.status;

      return ctx.db.query.locationEdits.findMany({
        where:
          statusFilter && statusFilter.length
            ? inArray(locationEdits.status, statusFilter)
            : undefined,
        with: {
          location: true,
          creator: true,
        },
        orderBy: (edit, { desc }) => [desc(edit.createdAt)],
      });
    }),

  reviewSubmission: adminProcedure
    .input(
      z.object({
        id: z.number(),
        action: z.enum(["approve", "reject"]),
        note: z.string().optional(),
        markDuplicateOf: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.db.query.locationEdits.findFirst({
        where: eq(locationEdits.id, input.id),
      });

      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      if (submission.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Submission is already resolved",
        });
      }

      const payload = LocationSubmissionPayload.parse(submission.payload);
      const parsedDetails = parseLocationDetails(payload.details);
      const decisionBy = ctx.auth?.userId ?? null;

      return ctx.db.transaction(async (tx) => {
        if (input.action === "approve") {
          if (submission.type === "new") {
            const [created] = await tx
              .insert(locations)
              .values({
                name: payload.name,
                address: payload.address,
                description: payload.description ?? null,
                lat: payload.lat,
                lng: payload.lng,
                images: payload.images ?? [],
                details: parsedDetails,
                status: "approved",
                createdBy: submission.createdBy,
              })
              .returning({ id: locations.id });

            await tx
              .update(locationEdits)
              .set({
                status: "approved",
                decisionBy,
                decisionNote: input.note,
                duplicateOf: input.markDuplicateOf,
                locationId: created?.id,
                updatedAt: new Date(),
              })
              .where(eq(locationEdits.id, submission.id));
          } else {
            if (!submission.locationId) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Edit submission missing target location",
              });
            }

            await tx
              .update(locations)
              .set({
                name: payload.name,
                address: payload.address,
                description: payload.description ?? null,
                lat: payload.lat,
                lng: payload.lng,
                images: payload.images ?? [],
                details: parsedDetails,
                status: "approved",
              })
              .where(eq(locations.id, submission.locationId));

            await tx
              .update(locationEdits)
              .set({
                status: "approved",
                decisionBy,
                decisionNote: input.note,
                duplicateOf: input.markDuplicateOf,
                updatedAt: new Date(),
              })
              .where(eq(locationEdits.id, submission.id));
          }
        } else {
          await tx
            .update(locationEdits)
            .set({
              status: "rejected",
              decisionBy,
              decisionNote: input.note,
              duplicateOf: input.markDuplicateOf,
              updatedAt: new Date(),
            })
            .where(eq(locationEdits.id, submission.id));
        }
      });
    }),
});
