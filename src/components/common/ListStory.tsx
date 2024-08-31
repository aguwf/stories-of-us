"use client";

import { useStoryStore } from "@/app/_store/storyStore";
import { useRouterHelper } from "@/hooks/useRouterHelper";
import { api } from "@/trpc/react";
import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Pagination, useDisclosure } from "@nextui-org/react";
import { message } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DetailStoryModal from "../modals/DetailStoryModal";
import { StoryCard } from "./Card";
import { PlusSignIcon } from "hugeicons-react";

export interface Story {
	id: number;
	name: string;
	description: string;
	coverImage: string;
	images: string[];
	sort: number;
	createdAt: Date | string | null;
}

interface ListStoryProps {
	setSelectedStory: (story: Story) => void;
	openModal: () => void; // Add this line
	setCreateIndex: (index: number) => void;
	setMaxIndex: (index: number) => void;
}

interface ResponseStory {
	storyList: Story[];
	totalPages: number;
	totalCount: number;
}

const DEFAULT_ORDER_BY = "newest";
const DEFAULT_PAGE = 1;
const DEFAULT_TOTAL_ITEMS = 5;

export default function ListStory({ setSelectedStory, openModal, setCreateIndex, setMaxIndex }: ListStoryProps) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [selectedImages, setSelectedImages] = useState<Story | undefined>();

	const utils = api.useUtils();
	const searchParams = useSearchParams();
	const { push } = useRouterHelper();

	const orderBy = searchParams.get("orderBy") || DEFAULT_ORDER_BY;
	const page = Math.max(+(searchParams.get("page") ?? DEFAULT_PAGE), 1);
	const totalItems = Math.max(+(searchParams.get("totalItems") ?? DEFAULT_TOTAL_ITEMS), 1);

	const [stories, { isLoading }] = api.story.getAll.useSuspenseQuery({
		orderBy: orderBy === "newest" ? "desc" : "asc",
		page,
		totalItems,
		sort: "sort",
	});

	const {
		stories: storiesStore,
		totalPages,
		setTotalPages,
		setStories,
	} = useStoryStore();

	const storyIds = useMemo(() => storiesStore.map((story) => story.id), [storiesStore]);

	const updateStory = api.story.update.useMutation({
		onSuccess: async () => {
			message.success("Update successfully");
			await utils.story.invalidate();
		},
	});

	useEffect(() => {
		const { storyList, totalPages } = stories as ResponseStory;
		if (storyList?.length > 0) {
			setStories(storyList);
			setTotalPages(totalPages);
		}
	}, [stories, setStories, setTotalPages]);

	useEffect(() => {
		if (storiesStore.length > 0) {
			const maxSort = Math.max(...storiesStore.map(story => story.sort));
			setMaxIndex(maxSort);
		}
	}, [storiesStore, setMaxIndex]);

	const handleChangePagination = (page: number) => {
		push("page", page.toString());
	};

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 100,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id && over && active.id !== over.id) {
			const oldIndex = storyIds.indexOf(+active.id);
			const newIndex = storyIds.indexOf(+over.id);
			const newStoryList = arrayMove(storiesStore, oldIndex, newIndex)
				.map((story, index) => ({ ...story, sort: index }));

			setStories(newStoryList);

			updateStory.mutate({
				id: +active.id,
				sort: storiesStore[newIndex]?.sort ?? 0
			});

			updateStory.mutate({
				id: +over.id,
				sort: storiesStore[oldIndex]?.sort ?? 0
			});
		}
	};

	const handleAddStory = (index: number) => {
		// Implement the logic to add a new story at the specified index
		openModal();
		setCreateIndex(index);
	};

	if (isLoading) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<h1 className="text-2xl">Loading...</h1>
			</div>
		);
	}

	if (!storiesStore?.length) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<h1 className="text-2xl">No stories found</h1>
			</div>
		);
	}

	return (
		<div>
			<DndContext
				sensors={sensors}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={storyIds} strategy={verticalListSortingStrategy}>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{storiesStore.map((item, index) => {
							const nextItem = storiesStore[index + 1];
							const nextSort = nextItem ? (nextItem.sort + 1) : item.sort + 1;
							const sort = (item.sort + nextSort) / 2;
							const isLastItem = index === storiesStore.length - 1;
							return (
								<div key={item.id}>
									<StoryCard
										item={item}
										setSelectedStory={setSelectedStory}
										onOpen={onOpen}
										setSelectedImages={setSelectedImages}
									/>
									{!isLastItem && (
										<Button
											isIconOnly
											color="primary"
											aria-label="Add story"
											className="h-12 w-full mt-2"
											onClick={() => handleAddStory(sort)}
										>
											<PlusSignIcon className="h-6 w-6" />
										</Button>
									)}
								</div>
							)
						})}
					</div>
				</SortableContext>
				<Pagination
					className="mt-3"
					total={totalPages}
					page={page}
					initialPage={1}
					onChange={handleChangePagination}
				/>
			</DndContext>
			<DetailStoryModal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				story={selectedImages}
			/>
		</div>
	);
}
