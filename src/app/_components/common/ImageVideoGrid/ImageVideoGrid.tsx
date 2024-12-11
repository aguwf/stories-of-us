"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Video from "./Video";
import MediaCarousel from "./MediaCarousel";
import ImageK from "../ImageK";
import CommentSection from "../CommentSection/CommentSection";

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
        // <Image
        //   src={item.src}
        //   alt={`Media item ${index + 1}`}
        //   fill
        //   className={commonClasses}
        // />
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
    <div className={`grid gap-1 ${gridClassName()} max-w-2xl mx-auto`}>
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
                  <Card className="w-full h-full overflow-hidden cursor-pointer border-none">
                    <CardContent className="p-0 h-full">
                      {renderMediaItem(item)}
                      {index === 3 && itemCount > 4 && (
                        <motion.div
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="text-white text-2xl font-bold">
                            +{itemCount - 4}
                          </span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="w-full p-0 h-full border-none overflow-auto">
                <div className="mt-16 px-4 flex items-center gap-2">
                  <Avatar className="border-1 border-gray-200">
                    <AvatarImage src={story?.user.avatar ?? ""} />
                    <AvatarFallback>
                      <Icon className="h-6 w-6" name="user-outline" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {story?.user.name}
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
                      <hr className="my-2 border-r border-gray-200 w-full rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-screen-md px-4">
                  <h3 className="font-bold">{story?.name}</h3>
                  <p className="mt-2">{story?.description}</p>
                </div>
                <MediaCarousel items={items} initialIndex={index} />
                <CommentSection
                  comments={[]} // Pass your comments data here
                  onAddComment={(content) => {
                    // Implement your comment adding logic here
                    console.log("New comment:", content);
                  }}
                />
              </DialogContent>
            </Dialog>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ImageVideoGrid;
