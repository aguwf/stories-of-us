import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { stories } from "@/server/db/schema";
import { StoryValidation } from "@/validations/StoryValidation";

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
});
