import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { stories } from "@/server/db/schema";
import { StoryValidation } from "@/validations/StoryValidation";
import { count, eq } from "drizzle-orm";
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
			}),
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
			});

			return {
				storyList,
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
			}),
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
});
