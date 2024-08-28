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
} from "@dnd-kit/sortable";
import { Pagination, useDisclosure } from "@nextui-org/react";
import { message } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DetailStoryModal from "../modals/DetailStoryModal";
import { StoryCard } from "./Card";

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
}

interface ResponseStory {
	storyList: Story[];
	totalPages: number;
	totalCount: number;
}

const DEFAULT_ORDER_BY = "newest";
const DEFAULT_PAGE = 1;
const DEFAULT_TOTAL_ITEMS = 5;

export default function ListStory(props: ListStoryProps) {
	const { setSelectedStory } = props;
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [selectedImages, setSelectedImages] = useState<Story>();

	const utils = api.useUtils();
	const searchParams = useSearchParams();
	const { push } = useRouterHelper();

	const orderBy = searchParams.get("orderBy") || DEFAULT_ORDER_BY;
	const page = +(searchParams.get("page") ?? DEFAULT_PAGE);
	const totalItems = +(searchParams.get("totalItems") ?? DEFAULT_TOTAL_ITEMS);

	const [stories, { isLoading }] = api.story.getAll.useSuspenseQuery({
		orderBy: orderBy === "newest" ? "desc" : "asc",
		page: page < 1 ? DEFAULT_PAGE : page,
		totalItems: totalItems < 1 ? DEFAULT_TOTAL_ITEMS : totalItems,
		sort: "sort",
	});

	const {
		stories: storiesStore,
		totalPages,
		setTotalPages,
		setStories,
	} = useStoryStore();

	const storyIds = useMemo(
		() => storiesStore.map((story) => story.id),
		[storiesStore],
	);

	const updateStory = api.story.update.useMutation({
		onSuccess: async () => {
			message.success("Update successfully");
			await utils.story.invalidate();
		},
	});

	useEffect(() => {
		const { storyList, totalPages } = stories as ResponseStory;
		if (storyList && storyList.length > 0) {
			setStories(storyList);
			setTotalPages(totalPages);
		}
	}, [stories]);

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
				delay: 300,
				tolerance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// const handleDragStart = (event: DragStartEvent) => {};
	// const handleDragMove = (event: DragMoveEvent) => {};
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id && over && active.id !== over.id) {
			const newStoryList = arrayMove(
				storiesStore,
				storyIds.indexOf(+active.id),
				storyIds.indexOf(+over.id),
			).map((story, _idx) => {
				return {
					...story,
					sort: _idx,
				};
			});

			setStories(newStoryList);

			const overStory = storiesStore.find((s) => s.id === over.id);
			console.log(
				"🚀 ~ handleDragEnd ~ overStory:",
				storiesStore.find((s) => s.id === over.id),
			);
			const activeStory = storiesStore.find((s) => s.id === active.id);
			console.log(
				"🚀 ~ handleDragEnd ~ activeStory:",
				storiesStore.find((s) => s.id === active.id),
			);

			if (overStory && activeStory) {
				updateStory.mutate({
					...overStory,
					sort: activeStory.sort,
				});
				updateStory.mutate({
					...activeStory,
					sort: overStory.sort,
				});
			}
		}
	};

	return (
		<div>
			{isLoading && (
				<div className="flex h-[50vh] items-center justify-center">
					<h1 className="text-2xl">Loading...</h1>
				</div>
			)}
			{storiesStore?.length ? (
				<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
					<SortableContext items={storyIds}>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{storiesStore.map((item) => (
								<StoryCard
									key={item.id}
									item={item}
									setSelectedStory={setSelectedStory}
									onOpen={onOpen}
									setSelectedImages={setSelectedImages}
								/>
							))}
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
			) : (
				<div className="flex h-[50vh] items-center justify-center">
					<h1 className="text-2xl">No stories found</h1>
				</div>
			)}
			<DetailStoryModal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				story={selectedImages}
			/>
		</div>
	);
}
