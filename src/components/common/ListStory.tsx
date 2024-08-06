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
  useDisclosure,
} from "@nextui-org/react";
import DetailStoryModal from "../modals/DetailStoryModal";
import ImageK from "@/app/_components/common/ImageK";
import { useState } from "react";
import { MoreVerticalCircle01Icon } from "hugeicons-react";
import { message } from "antd";

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

export default function ListStory(props: ListStoryProps) {
  const { setSelectedStory } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedImages, setSelectedImages] = useState<Story>();

  const month = new Date()
    .toLocaleString("en-US", { month: "long" })
    .slice(0, 3);

  const [stories] = api.story.getAll.useSuspenseQuery();
  const utils = api.useUtils();
  const deleteStory = api.story.delete.useMutation({
    onSuccess: async () => {
      message.success("Delete successfully");
      await utils.story.invalidate();
    },
  });


  const handleActionMenu = (key: any, story: Story) => {
    const id = story.id;
    switch(key) {
      case "delete":
        message.info("Deleting...")
        deleteStory.mutate({ id });
        break;
      case "edit":
        setSelectedStory(story);
        break;
      default:
        break;
    }
  }

  return (
    <div>
      {stories.length ? (
        stories.map((item: Story) => (
          <Card
            className="mt-12 flex flex-row gap-8 p-4 first:mt-0"
            key={item.id}
            onClick={onOpen}
          >
            <div className="mx-4 flex flex-col items-center">
              <div className="font-medium text-[#9f9f9f]">{month}</div>
              <div className="font-bold">
                {new Date(item?.createdAt!).getDate()}
              </div>
              <div className="font-medium text-[#9f9f9f]">
                {new Date(item?.createdAt!).getFullYear()}
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
              {/* <FacebookMediaGrid images={item.images}/> */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mt-4 font-bold">{item.name}</h3>
                  <p className="mt-2 line-clamp-5">{item.description}</p>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" className="rounded-full bg-transparent" isIconOnly>
                      <MoreVerticalCircle01Icon />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Static Actions"
                    onAction={(key) => handleActionMenu(key, item)}
                  >
                    <DropdownItem key="copy">Copy link</DropdownItem>
                    <DropdownItem key="edit">Edit file</DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                    >
                      Delete file
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </Card>
        ))
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
