import type { UserType } from "./user";

export type StoryType = {
	id: number;
	name: string;
	description: string | null;
	coverImage: string;
	images: string[];
	sort: number | null;
	createdAt: Date | string | null;
	user: UserType;
	isHearted: boolean;
	heartCount: number;
};
