import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { UserValidation } from "@/validations/UserValidation";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
	create: publicProcedure
		.input(UserValidation)
		.mutation(async ({ ctx, input }) => {
			// First check if user exists
			const existingUser = await ctx.db.query.users.findFirst({
				where: eq(users.email, input.email),
			});

			// If user exists, return the existing user
			if (existingUser) {
				return existingUser;
			}

			// If user doesn't exist, create new user
			await ctx.db.insert(users).values({
				name: input.name ?? "",
				email: input.email ?? "",
				emailVerified: new Date(),
				avatar: input.avatar ?? "",
			});

			return ctx.db.query.users.findFirst({
				where: eq(users.email, input.email),
			});
		}),
});
