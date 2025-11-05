import type { StoryType } from "./story";

export interface MediaItem {
	type: "image" | "video";
	src: string;
}

export interface ImageVideoGridProps {
	items: MediaItem[];
	story?: StoryType;
}
