import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { locations, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
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
});
