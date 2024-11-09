export type StoryType = {
	id: number;
	name: string;
	description: string;
	coverImage: string;
	images: string[];
	sort: number;
	createdAt: Date | string | null;
};
