"use client";

import { useStoryStore } from "@/app/_store/storyStore";
import { useRouterHelper } from "@/hooks/useRouterHelper";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import {
  DragDropContext,
  Draggable,
  type DraggableStyle,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { Pagination } from "@nextui-org/react";
import { message } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// import DetailStoryModal from "../modals/DetailStoryModal";
import { StoryCard } from "./Card";
import {useUserStore} from "@/app/_store/userStore";

interface ListStoryProps {
  setSelectedStory: (story: StoryType | null) => void;
  openModal: () => void;
  setCreateIndex: (index: number | null) => void;
  setMaxIndex: (index: number) => void;
}

// interface ResponseStory {
//   storyList: StoryType[];
//   totalPages: number;
//   totalCount: number;
// }

const DEFAULT_ORDER_BY = "newest";
const DEFAULT_PAGE = 1;
const DEFAULT_TOTAL_ITEMS = 5;

const reorder = <TList extends unknown[]>(
  list: TList,
  startIndex: number,
  endIndex: number
): TList => {
  const result = Array.from(list) as TList;
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggableStyle = {}
) => ({
  userSelect: "none" as const,
  ...draggableStyle,
  opacity: isDragging ? 0.5 : 1,
});

export default function ListStory({
  setSelectedStory,
  openModal,
  setCreateIndex,
  setMaxIndex,
}: ListStoryProps) {
  // @ts-ignore
  const [selectedImages, setSelectedImages] = useState<StoryType | undefined>();

  const utils = api.useUtils();
  const searchParams = useSearchParams();
  const { push } = useRouterHelper();

  const orderBy = searchParams.get("orderBy") || DEFAULT_ORDER_BY;
  const page = Math.max(+(searchParams.get("page") ?? DEFAULT_PAGE), 1);
  const totalItems = Math.max(
    +(searchParams.get("totalItems") ?? DEFAULT_TOTAL_ITEMS),
    1
  );

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

  const updateStory = api.story.update.useMutation({
    onSuccess: async () => {
      // Reset state
      setSelectedStory(null);
      setCreateIndex(null);
      message.success("Update successfully");
      await utils.story.invalidate();
    },
  });

  const { user } = useUserStore();
  const userId = user?.id;

  useEffect(() => {
    if ('storyList' in stories) {  // Type guard
      const { storyList, totalPages } = stories;
      if (storyList?.length > 0) {
        // Pre-fetch heart data for all stories
        storyList.forEach(async(story) => {
          await utils.story.getHeartCount.prefetch({ storyId: story.id });
          if (userId) {
            await utils.story.hasUserHearted.prefetch({
              storyId: story.id, 
              userId 
            });
          }
        });
        
        setStories(storyList);
        setTotalPages(totalPages);
      }
    }
  }, [stories, setStories, setTotalPages, utils.story, userId]);

  useEffect(() => {
    if (storiesStore.length > 0) {
      const maxSort = Math.max(...storiesStore.map((story) => story.sort ?? 0));
      setMaxIndex(maxSort);
    }
  }, [storiesStore, setMaxIndex]);

  const handleChangePagination = (page: number) => {
    push("page", page.toString());
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const newStoryList = reorder(
      storiesStore,
      source.index,
      destination.index
    ).map((story, index) => ({ ...story, sort: index }));

    setStories(newStoryList);

    updateStory.mutate({
      id: storiesStore[source.index]?.id ?? 0,
      sort: newStoryList[destination.index]?.sort ?? 0,
    });
    updateStory.mutate({
      id: storiesStore[destination.index]?.id ?? 0,
      sort: newStoryList[source.index]?.sort ?? 0,
    });
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
    <div className="mt-7">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="story-list">
          {(droppableProvided) => (
            <div ref={droppableProvided.innerRef}>
              {storiesStore.map((item, index) => {
                const nextItem = storiesStore[index + 1];
                const nextSort = nextItem ? nextItem.sort ?? 0 + 1 : item.sort ?? 0 + 1;
                const sort = (item.sort ?? 0 + nextSort) / 2;
                // const isLastItem = index === storiesStore.length - 1;
                return (
                  <Draggable
                    key={item.id}
                    draggableId={item.id.toString()}
                    index={index}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={getItemStyle(
                          draggableSnapshot.isDragging,
                          draggableProvided.draggableProps.style
                        )}
                      >
                        <StoryCard
                          item={item}
                          setSelectedStory={setSelectedStory}
                          setSelectedImages={setSelectedImages}
                          sort={sort}
                          setCreateIndex={setCreateIndex}
                          openModal={openModal}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
        <Pagination
          className="mt-3"
          total={totalPages}
          page={page}
          initialPage={1}
          onChange={handleChangePagination}
        />
      </DragDropContext>
      {/* <DetailStoryModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        story={selectedImages}
      /> */}
    </div>
  );
}
