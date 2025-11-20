import { z } from "zod";

export const StoryValidation = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  coverImage: z.string().min(1).optional(),
  images: z.array(z.string().min(1)),
  userId: z.string().min(1),
  sort: z.number().optional(),
  location: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  feeling: z.string().optional(),
  activity: z.string().optional(),
  privacy: z.enum(["public", "friends", "onlyme"]).default("public"),
  backgroundStyle: z.string().optional(),
  mentionedUsers: z.array(z.string()).optional(),
  scheduledPublishTime: z.date().optional(),
  postFormat: z.enum(["standard", "background", "poll"]).default("standard"),
});

export const StoryFormValidation = z.object({
  name: z.string().min(1, "Title is required"),
  description: z.string(),
  location: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  feeling: z.string().optional(),
  activity: z.string().optional(),
  privacy: z.enum(["public", "friends", "onlyme"]).default("public"),
  backgroundStyle: z.string().optional(),
  mentionedUsers: z.array(z.string()).optional(),
  scheduledPublishTime: z.date().optional(),
  postFormat: z.enum(["standard", "background", "poll"]).default("standard"),
});

export const EditStoryValidation = z.object({
  id: z.coerce.number(),
  title: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().min(1),
  images: z.array(z.string().min(1)).optional(),
  userId: z.string().min(1),
  location: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  feeling: z.string().optional(),
  activity: z.string().optional(),
  privacy: z.enum(["public", "friends", "onlyme"]).optional(),
  backgroundStyle: z.string().optional(),
  mentionedUsers: z.array(z.string()).optional(),
  scheduledPublishTime: z.date().optional(),
  postFormat: z.enum(["standard", "background", "poll"]).optional(),
});

export const DeleteStoryValidation = z.object({
  id: z.coerce.number(),
});
