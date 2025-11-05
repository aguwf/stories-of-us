import { comments } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				storyId: z.number(),
				userId: z.number(),
				content: z.string(),
				reactions: z.record(z.string(), z.array(z.string())),
				replies: z.array(z.number()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const comment = await ctx.db.insert(comments).values({
				storyId: input.storyId,
				userId: input.userId,
				content: input.content,
				reactions: input.reactions,
				replies: input.replies,
			});

			return comment;
		}),
});
