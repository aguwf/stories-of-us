import type { StoryType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface StorySlice {
	stories: StoryType[];
	totalPages: number;
	setStories: (stories: StoryType[]) => void;
	addStory: (story: StoryType) => void;
	removeStory: (story: StoryType) => void;
	updateStory: (story: StoryType) => void;
	setTotalPages: (totalPages: number) => void;
}

const createStorySlice = (
	set: (fn: (state: StorySlice) => void) => void,
): StorySlice => ({
	stories: [],
	totalPages: 0,
	setTotalPages: (totalPages) =>
		set((state) => {
			state.totalPages = totalPages;
		}),
	setStories: (stories) =>
		set((state) => {
			state.stories = stories;
		}),
	addStory: (story) =>
		set((state) => {
			state.stories.push(story);
		}),
	removeStory: (story) =>
		set((state) => {
			state.stories = state.stories.filter((s) => s.id !== story.id);
		}),
	updateStory: (story) =>
		set((state) => {
			const index = state.stories.findIndex((s) => s.id === story.id);
			if (index !== -1) {
				state.stories[index] = story;
			}
		}),
});

export const useStoryStore = create<StorySlice>()(
	persist(
		immer((set) => ({
			...createStorySlice(set),
		})),
		{
			name: "story-store",
			version: 1,
			partialize: (state) => ({
				stories: state.stories,
				totalPages: state.totalPages,
			}),
		},
	),
);
