/* eslint-disable */

"use client";

import { api } from "@/trpc/react";
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  useDisclosure,
} from "@nextui-org/react";
import DetailStoryModal from "../modals/DetailStoryModal";
import ImageK from "@/app/_components/common/ImageK";
import { useState } from "react";
import { MoreVerticalCircle01Icon } from "hugeicons-react";
import { message } from "antd";
import { useSearchParams } from "next/navigation";
import { useRouterHelper } from "@/hooks/useRouterHelper";

interface Story {
  id: number;
  name: string;
  description: string | null;
  coverImage: string;
  images: string[];
  createdAt: Date | string | null;
}

interface ListStoryProps {
  setSelectedStory: (story: Story) => void;
}

const actionMenuOptions: {
  key: string;
  label: string;
  color?:
  | "danger"
  | "default"
  | "success"
  | "primary"
  | "secondary"
  | "warning";
}[] = [
    { key: "copy", label: "Copy link" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete", color: "danger" },
  ];

const DEFAULT_ORDER_BY = "newest";
const DEFAULT_PAGE = 1;
const DEFAULT_TOTAL_ITEMS = 5;

export default function ListStory(props: ListStoryProps) {
  const { setSelectedStory } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedImages, setSelectedImages] = useState<Story>();

  const searchParams = useSearchParams();
  const { push } = useRouterHelper();

  const orderBy = searchParams.get("orderBy") || DEFAULT_ORDER_BY;
  const page = +(searchParams.get("page") ?? DEFAULT_PAGE);
  const totalItems = +(searchParams.get("totalItems") ?? DEFAULT_TOTAL_ITEMS);

  const [stories, { isLoading }] = api.story.getAll.useSuspenseQuery({
    orderBy: orderBy === "newest" ? "desc" : "asc",
    page: page < 1 ? DEFAULT_PAGE : page,
    totalItems: totalItems < 1 ? DEFAULT_TOTAL_ITEMS : totalItems,
    sort: "createdAt",
  });

  // Type assertion (use with caution)
  const { storyList, totalPages } = stories as {
    storyList: {
      id: number;
      name: string;
      description: string | null;
      coverImage: string;
      images: string[];
      userId: string;
      createdAt: Date;
      updatedAt: Date | null;
    }[], totalPages: number, totalCount: number
  };

  const utils = api.useUtils();
  const deleteStory = api.story.delete.useMutation({
    onSuccess: async () => {
      message.success("Delete successfully");
      await utils.story.invalidate();
    },
  });

  const handleActionMenu = (key: any, story: Story) => {
    switch (key) {
      case "delete":
        message.info("Deleting...");
        deleteStory.mutate({ id: story.id });
        break;
      case "edit":
        setSelectedStory(story);
        break;
      default:
        break;
    }
  };

  const handleChangePagination = (page: number) => {
    push("page", page.toString());
  };

  const renderStoryCard = (item: Story) => {
    const formattedDate = new Date(item.createdAt!);
    const month = formattedDate
      .toLocaleString("en-US", { month: "long" })
      .slice(0, 3);

    return (
      <Card
        className="mt-12 flex flex-row gap-8 p-4 first:mt-0"
        key={item.id}
        onClick={onOpen}
      >
        <div className="mx-4 flex flex-col items-center">
          <div className="font-medium text-[#9f9f9f]">{month}</div>
          <div className="font-bold">{formattedDate.getDate()}</div>
          <div className="font-medium text-[#9f9f9f]">
            {formattedDate.getFullYear()}
          </div>
        </div>
        <div>
          <ImageK
            width={500}
            height={300}
            quality={80}
            className="rounded-2xl"
            src={item.coverImage.split("/").pop()}
            alt={item.name}
            onClick={() => {
              onOpen();
              setSelectedImages(item);
            }}
          />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mt-4 font-bold">{item.name}</h3>
              <p className="mt-2 line-clamp-5">{item.description}</p>
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="rounded-full bg-transparent"
                  isIconOnly
                >
                  <MoreVerticalCircle01Icon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Static Actions"
                onAction={(key) => handleActionMenu(key, item)}
              >
                {actionMenuOptions.map((option) => (
                  <DropdownItem
                    key={option.key}
                    className={option.color ? `text-${option.color}` : ""}
                    color={option.color}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {isLoading && (
        <div className="flex h-[50vh] items-center justify-center">
          <h1 className="text-2xl">Loading...</h1>
        </div>
      )}
      {storyList.length ? (
        <div>
          {storyList.map(renderStoryCard)}
          <Pagination className="mt-3" total={totalPages} page={page} initialPage={1} onChange={handleChangePagination} />
        </div>
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
