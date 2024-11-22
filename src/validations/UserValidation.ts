import { z } from "zod";

export const UserValidation = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	emailVerified: z.date(),
	avatar: z.string().min(1),
});
