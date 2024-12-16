"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Video from "./Video";
import MediaCarousel from "./MediaCarousel";
import ImageK from "../ImageK";
// import CommentSection from "../CommentSection/CommentSection";

import { StoryType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "../icon";
interface MediaItem {
  type: "image" | "video";
  src: string;
}

interface ImageVideoGridProps {
  items: MediaItem[];
  story?: StoryType;
}

const ImageVideoGrid: React.FC<ImageVideoGridProps> = ({ items, story }) => {
  // const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const formattedDate = new Date(story?.createdAt || new Date());
  const month = formattedDate
    .toLocaleString("en-US", { month: "long" })
    .slice(0, 3);

  const itemCount = items.length;

  const renderMediaItem = (item: MediaItem) => {
    // const isLast = index === 3 && itemCount > 4;
    const commonClasses = "w-full h-full object-cover rounded-md";

    if (item.type === "video") {
      return <Video src={item.src} className={commonClasses} />;
    } else {
      return (
        <ImageK
          width={500}
          height={800}
          quality={100}
          className={commonClasses}
          src={item.src.split("/").pop() || ""}
          alt={`Media item`}
        />
      );
    }
  };

  const gridClassName = () => {
    switch (itemCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 4:
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
    }
  };

  return (
    <div className={`grid gap-1 mx-auto max-w-2xl ${gridClassName()}`}>
      <AnimatePresence>
        {items.slice(0, 4).map((item, index) => {
          return (
            <Dialog
              key={index}
              // onOpenChange={(open) => !open && setSelectedIndex(null)}
            >
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative aspect-square ${
                    itemCount === 3 && index === 0
                      ? "sm:col-span-2 sm:row-span-2"
                      : ""
                  }`}
                  // onClick={() => setSelectedIndex(index)}
                >
                  <Card className="overflow-hidden w-full h-full border-none cursor-pointer">
                    <CardContent className="p-0 h-full">
                      {renderMediaItem(item)}
                      {index === 3 && itemCount > 4 && (
                        <motion.div
                          className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-50 rounded-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="text-2xl font-bold text-white">
                            +{itemCount - 4}
                          </span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="overflow-auto p-0 w-full h-full border-none">
                <div className="flex gap-2 items-center px-4 mt-16">
                  <Avatar className="border-gray-200 border-1">
                    <AvatarImage src={story?.user?.avatar ?? ""} />
                    <AvatarFallback>
                      <Icon className="w-6 h-6" name="user-outline" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {story?.user?.name}
                    </span>
                    <div className="flex gap-1">
                      <span className="font-medium text-[#9f9f9f] text-sm">
                        {month}
                      </span>
                      <span className="font-medium text-[#9f9f9f] text-sm">
                        {formattedDate.getDate()}
                      </span>
                      <span className="font-medium text-[#9f9f9f] text-sm">
                        {formattedDate.getFullYear()}
                      </span>
                      <hr className="my-2 w-full border-r border-gray-200 rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="px-4 mx-auto w-full max-w-screen-md">
                  <h3 className="font-bold">{story?.name}</h3>
                  <p className="mt-2">{story?.description}</p>
                </div>
                <MediaCarousel items={items} initialIndex={index} />
                {/* <CommentSection
                  comments={[]} // Pass your comments data here
                  onAddComment={(content) => {
                    // Implement your comment adding logic here
                    console.log("New comment:", content);
                  }}
                /> */}
              </DialogContent>
            </Dialog>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ImageVideoGrid;
