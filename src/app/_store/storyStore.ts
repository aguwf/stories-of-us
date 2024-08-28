// biome-ignore lint/style/useImportType: <explanation>
import { Story } from "@/components/common/ListStory";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// State types
interface States {
	stories: Story[];
	totalPages: number;
}

interface Actions {
	setStories: (stories: Story[]) => void;
	addStory: (story: Story) => void;
	removeStory: (story: Story) => void;
	updateStory: (story: Story) => void;
	setTotalPages: (totalPages: number) => void;
}

// useBearStore
export const useStoryStore = create(
	persist<States & Actions>(
		(set) => ({
			stories: [],
			totalPages: 0,
			setTotalPages: (totalPages) => set({ totalPages }),
			setStories: (stories) => set({ stories }),
			addStory: (story) =>
				set((state) => ({ stories: [...state.stories, story] })),
			removeStory: (story) =>
				set((state) => ({
					stories: state.stories.filter((s) => s.id !== story.id),
				})),
			updateStory: (story) =>
				set((state) => ({
					stories: state.stories.map((s) => (s.id === story.id ? story : s)),
				})),
		}),
		{
			name: "story-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
