import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { UserValidation } from "@/validations/UserValidation";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
	create: protectedProcedure
		.input(UserValidation)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.auth?.userId;
			if (!userId) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			// Ensure we always reuse the authenticated Clerk user id as our primary key
			const existingUser = await ctx.db.query.users.findFirst({
				where: eq(users.id, userId),
			});

			if (existingUser) {
				return existingUser;
			}

			const [createdUser] = await ctx.db
				.insert(users)
				.values({
					id: userId,
					name: input.name ?? "",
					email: input.email ?? "",
					emailVerified: input.emailVerified ?? new Date(),
					avatar: input.avatar ?? "",
				})
				.returning();

			return createdUser;
		}),
});
