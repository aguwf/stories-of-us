import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { stories } from "@/server/db/schema";
import { StoryValidation } from "@/validations/StoryValidation";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const storyRouter = createTRPCRouter({
  create: publicProcedure
    .input(StoryValidation)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(stories).values({
        name: input.name,
        description: input.description,
        coverImage: input.coverImage,
        images: input.images,
        userId: input.userId,
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const stories = await ctx.db.query.stories.findMany({
      orderBy: (stories, { desc }) => [desc(stories.createdAt)],
    });
    return stories;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  delete: publicProcedure
    .input(z.object({ id: z.number() })) // Define the input type
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(stories).where(eq(stories.id, input.id));
    }),
});
