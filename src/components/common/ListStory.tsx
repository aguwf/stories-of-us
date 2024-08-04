"use client";

import { api } from "@/trpc/react";
import { Card, useDisclosure } from "@nextui-org/react";
import DetailStoryModal from "../modals/DetailStoryModal";
import Image from "next/image";
import ImageK from "@/app/_components/common/ImageK";
import { useState } from "react";

interface Story {
  id: number;
  name: string;
  description: string | null;
  coverImage: string;
  images: string[];
  createdAt: Date | string | null;
}

export default function ListStory() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const month = new Date()
    .toLocaleString("en-US", { month: "long" })
    .slice(0, 3);
  const [stories] = api.story.getAll.useSuspenseQuery();

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
                  setSelectedImages(item.images);
                }}
              />
              {/* <FacebookMediaGrid images={item.images}/> */}
              <h3 className="mt-4 font-bold">{item.name}</h3>
              <p className="mt-2 line-clamp-5">{item.description}</p>
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
        images={selectedImages}
      />
    </div>
  );
}
