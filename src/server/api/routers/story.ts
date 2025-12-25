import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { bookmarks, hearts, stories, users } from "@/server/db/schema";
import { StoryValidation } from "@/validations/StoryValidation";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

type EnsureUserCtx = {
  auth?: { userId: string | null };
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  db: typeof import("@/server/db").db;
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

  const clerkClientVar = await clerkClient()
  const clerkUser = await clerkClientVar.users.getUser(userId);
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

export const storyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(StoryValidation)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ensureUserExists(ctx);

      await ctx.db.insert(stories).values({
        name: input.name ?? "",
        description: input.description ?? "",
        coverImage: input.coverImage ?? input.images[0] ?? "",
        images: input.images ?? [],
        sort: input.sort ?? 0,
        userId,
        location: input.location,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        feeling: input.feeling,
        activity: input.activity,
        privacy: input.privacy ?? "public",
        backgroundStyle: input.backgroundStyle,
        mentionedUsers: input.mentionedUsers ?? [],
        scheduledPublishTime: input.scheduledPublishTime,
        postFormat: input.postFormat ?? "standard",
      });
    }),

  getAll: publicProcedure
    .input(
      z.object({
        page: z.number(),
        totalItems: z.number(),
        sort: z.enum(["createdAt", "name", "sort"]),
        orderBy: z.enum(["asc", "desc"]),
        currentUserId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.totalItems;
      const limit = input.totalItems;
      const sortColumn =
        input.sort === "name"
          ? stories.name
          : input.sort === "sort"
            ? stories.sort
            : stories.createdAt;

      const orderBy =
        input.orderBy === "asc" ? asc(sortColumn) : desc(sortColumn);

      const [totalCount] = await ctx.db
        .select({ count: count() })
        .from(stories);

      if (!totalCount || totalCount.count === 0) {
        return {
          storyList: [],
          totalPages: 0,
          totalCount: 0,
        };
      }

      const totalPages = Math.ceil(totalCount.count / limit);
      const storyList = await ctx.db.query.stories.findMany({
        where: eq(stories.status, "approved"),
        orderBy,
        offset,
        limit,
        with: {
          user: true,
          hearts: true,
          bookmarks: true,
        },
      });

      return {
        storyList: storyList.map((story) => ({
          ...story,
          isHearted: input.currentUserId
            ? story.hearts?.some(
                (heart) => heart.userId === input.currentUserId
              )
            : false,
          isBookmarked: input.currentUserId
            ? story.bookmarks?.some(
                (bookmark) => bookmark.userId === input.currentUserId
              )
            : false,
          heartCount: story.hearts?.length ?? 0,
          hearts: undefined,
          bookmarks: undefined,
        })),
        totalPages,
        totalCount: totalCount.count,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const story = await ctx.db.query.stories.findFirst({
        where: eq(stories.id, input.id),
      });

      if (!story) {
        return null;
      }

      return {
        ...story,
      };
    }),

  update: protectedProcedure
    .input(StoryValidation.partial().extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const story = await ctx.db.query.stories.findFirst({
        where: eq(stories.id, input.id),
      });

      if (!story) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (story.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updatePayload: Record<string, unknown> = {};
      if (input.name !== undefined) updatePayload.name = input.name;
      if (input.description !== undefined)
        updatePayload.description = input.description;
      if (input.coverImage !== undefined)
        updatePayload.coverImage = input.coverImage;
      if (input.images !== undefined) updatePayload.images = input.images;
      if (input.sort !== undefined) updatePayload.sort = input.sort;
      if (input.location !== undefined) updatePayload.location = input.location;
      if (input.locationLat !== undefined)
        updatePayload.locationLat = input.locationLat;
      if (input.locationLng !== undefined)
        updatePayload.locationLng = input.locationLng;
      if (input.feeling !== undefined) updatePayload.feeling = input.feeling;
      if (input.activity !== undefined) updatePayload.activity = input.activity;
      if (input.privacy !== undefined) updatePayload.privacy = input.privacy;
      if (input.backgroundStyle !== undefined)
        updatePayload.backgroundStyle = input.backgroundStyle;
      if (input.mentionedUsers !== undefined)
        updatePayload.mentionedUsers = input.mentionedUsers;
      if (input.scheduledPublishTime !== undefined)
        updatePayload.scheduledPublishTime = input.scheduledPublishTime;
      if (input.postFormat !== undefined)
        updatePayload.postFormat = input.postFormat;

      await ctx.db
        .update(stories)
        .set(updatePayload)
        .where(eq(stories.id, input.id));

      return {
        ...story,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() })) // Define the input type
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const story = await ctx.db.query.stories.findFirst({
        where: eq(stories.id, input.id),
      });

      if (!story) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (story.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.delete(stories).where(eq(stories.id, input.id));
    }),

  toggleHeart: protectedProcedure
    .input(z.object({ storyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ensureUserExists(ctx);

      const existingHeart = await ctx.db.query.hearts.findFirst({
        where: (hearts) =>
          and(eq(hearts.storyId, input.storyId), eq(hearts.userId, userId)),
      });

      if (existingHeart) {
        await ctx.db.delete(hearts).where(eq(hearts.id, existingHeart.id));
        return false;
      }

      await ctx.db.insert(hearts).values({
        storyId: input.storyId,
        userId,
      });
      return true;
    }),

  toggleBookmark: protectedProcedure
    .input(z.object({ storyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ensureUserExists(ctx);

      const existingBookmark = await ctx.db.query.bookmarks.findFirst({
        where: (bookmarks) =>
          and(eq(bookmarks.storyId, input.storyId), eq(bookmarks.userId, userId)),
      });

      if (existingBookmark) {
        await ctx.db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
        return false;
      }

      await ctx.db.insert(bookmarks).values({
        storyId: input.storyId,
        userId,
      });
      return true;
    }),

  getHeartCount: publicProcedure
    .input(z.object({ storyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({ count: count() })
        .from(hearts)
        .where(eq(hearts.storyId, input.storyId));
      return result?.count ?? 0;
    }),

  hasUserHearted: protectedProcedure
    .input(z.object({ storyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth?.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const heart = await ctx.db.query.hearts.findFirst({
        where: (hearts) =>
          and(eq(hearts.storyId, input.storyId), eq(hearts.userId, userId)),
      });
      return !!heart;
    }),

  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(stories)
        .set({ status: "approved" })
        .where(eq(stories.id, input.id));
    }),

  reject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(stories)
        .set({ status: "rejected" })
        .where(eq(stories.id, input.id));
    }),

  getPending: adminProcedure.query(({ ctx }) =>
    ctx.db.query.stories.findMany({
      where: eq(stories.status, "pending"),
      with: {
        user: true,
      },
    })
  ),
});
