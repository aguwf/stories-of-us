import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { hearts, stories } from "@/server/db/schema";
import { StoryValidation } from "@/validations/StoryValidation";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

export const storyRouter = createTRPCRouter({
	create: publicProcedure
		.input(StoryValidation)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(stories).values({
				name: input.name ?? "",
				description: input.description ?? "",
				coverImage: input.coverImage ?? "",
				images: input.images ?? [],
				sort: input.sort ?? 0,
				userId: input.userId,
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
			const orderBy = input.sort
				? (stories: any, { desc, asc }: any) => [
						input.orderBy === "asc"
							? asc(stories[input.sort])
							: desc(stories[input.sort]),
					]
				: (stories: any, { desc, asc }: any) => [
						input.orderBy === "asc"
							? asc(stories.createdAt)
							: desc(stories.createdAt),
					];

			const [totalCount] = await ctx.db
				.select({ count: count() })
				.from(stories);

			if (!totalCount || totalCount.count === 0) {
				return [];
			}

			const totalPages = Math.ceil(totalCount.count / limit);

			const storyList = await ctx.db.query.stories.findMany({
				orderBy,
				offset,
				limit,
				with: {
					user: true,
					hearts: input.currentUserId
						? {
								where: (hearts, { eq }) =>
									eq(hearts.userId, input.currentUserId || ""),
							}
						: undefined,
				},
			});

			return {
				storyList: storyList.map(story => ({
					...story,
					isHearted: story.hearts && story.hearts.length > 0,
					heartCount: story.hearts?.length ?? 0,
					hearts: undefined,
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
		.input(
			z.object({
				id: z.number(),
				name: z.string().optional(),
				description: z.string().optional(),
				coverImage: z.string().optional(),
				images: z.string().array().optional(),
				sort: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const story = await ctx.db.query.stories.findFirst({
				where: eq(stories.id, input.id),
			});

			if (!story) {
				return null;
			}

			await ctx.db
				.update(stories)
				.set({
					name: input.name,
					description: input.description,
					coverImage: input.coverImage,
					images: input.images,
					sort: input.sort,
				})
				.where(eq(stories.id, input.id));

			return {
				...story,
			};
		}),

	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),

	delete: publicProcedure
		.input(z.object({ id: z.number() })) // Define the input type
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(stories).where(eq(stories.id, input.id));
		}),

	toggleHeart: protectedProcedure
		.input(z.object({ storyId: z.number(), userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existingHeart = await ctx.db.query.hearts.findFirst({
				where: hearts =>
					and(
						eq(hearts.storyId, input.storyId),
						eq(hearts.userId, input.userId)
					),
			});

			if (existingHeart) {
				await ctx.db.delete(hearts).where(eq(hearts.id, existingHeart.id));
				return false;
			}

			await ctx.db.insert(hearts).values({
				storyId: input.storyId,
				userId: input.userId,
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
		.input(z.object({ storyId: z.number(), userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const heart = await ctx.db.query.hearts.findFirst({
				where: hearts =>
					and(
						eq(hearts.storyId, input.storyId),
						eq(hearts.userId, input.userId)
					),
			});
			return !!heart;
		}),
});
