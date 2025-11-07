import { z } from "zod";

export const StoryValidation = z.object({
	name: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	coverImage: z.string().min(1).optional(),
	images: z.array(z.string().min(1)),
	userId: z.string().min(1),
	sort: z.number().optional(),
});

export const StoryFormValidation = z.object({
	name: z.string().min(1, "Title is required"),
	description: z.string(),
});

export const EditStoryValidation = z.object({
	id: z.coerce.number(),
	title: z.string().min(1),
	description: z.string().min(1),
	coverImage: z.string().min(1),
	images: z.array(z.string().min(1)).optional(),
	userId: z.string().min(1),
});

export const DeleteStoryValidation = z.object({
	id: z.coerce.number(),
});
