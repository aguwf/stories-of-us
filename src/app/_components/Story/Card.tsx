import ImageK from "@/app/_components/common/ImageK";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import { Card } from "@nextui-org/react";
import { message } from "antd";
import { motion } from "framer-motion";
import { memo, useState } from "react";
import { Icon } from "../common/icon";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ActionMenuOption = {
  key: 'copy' | 'edit' | 'delete' | 'insertAfter';
  label: string;
  icon: React.ReactNode;
  color?: 'danger';
};

const actionMenuOptions: ActionMenuOption[] = [
  {
    key: "copy",
    label: "Copy link",
    icon: <Icon className="h-5 w-5" name="copy-outline" />,
  },
  {
    key: "edit",
    label: "Edit",
    icon: <Icon className="h-5 w-5" name="pen-outline" />,
  },
  {
    key: "delete",
    label: "Delete",
    color: "danger" as const,
    icon: <Icon className="h-5 w-5" name="trash-outline" />,
  },
  {
    key: "insertAfter",
    label: "Insert after",
    icon: <Icon className="h-5 w-5" name="insert-outline" />,
  },
];

interface StoryCardProps {
  item: StoryType;
  setSelectedStory: (story: StoryType) => void;
  onOpen: () => void;
  setSelectedImages: (story: StoryType) => void;
  sort: number;
  openModal: () => void;
  setCreateIndex: (index: number) => void;
}

export const StoryCard: React.FC<StoryCardProps> = memo(
  ({
    item,
    setSelectedStory,
    onOpen,
    setSelectedImages,
    sort,
    openModal,
    setCreateIndex,
  }) => {
    const formattedDate = new Date(item.createdAt || new Date());
    const month = formattedDate
      .toLocaleString("en-US", { month: "long" })
      .slice(0, 3);

    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const utils = api.useUtils();

    const deleteStory = api.story.delete.useMutation({
      onMutate: () => {
        setIsDeleting(true);
      },
      onSuccess: async () => {
        message.success("Story deleted successfully");
        await utils.story.invalidate();
      },
      onError: (error) => {
        message.error(error.message || "Failed to delete story");
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });

    const handleActionMenu = (key: ActionMenuOption['key']) => {
      switch (key) {
        case "delete":
          if (window.confirm("Are you sure you want to delete this story?")) {
            deleteStory.mutate({ id: item.id });
          }
          break;
        case "edit":
          setSelectedStory(item);
          onOpen();
          break;
        case "copy":
          void navigator.clipboard.writeText(`${window.location.origin}/story/${item.id}`)
            .then(() => message.success("Link copied to clipboard"))
            .catch(() => message.error("Failed to copy link"));
          break;
        case "insertAfter":
          handleAddStory(sort);
          break;
      }
    };

    const handleAddStory = (index: number) => {
      openModal();
      setCreateIndex(index);
    };

    const handleLikeStory = () => {
      setIsLiked(!isLiked);
      console.log("Like story button clicked");
      // Add your logic here to handle the like story functionality
    };

    const handleBookmarkStory = () => {
      setIsBookmarked(!isBookmarked);
      console.log("Bookmark story button clicked");
      // Add your logic here to handle the bookmark story functionality
    };

    return (
      <div className="mb-10">
        <ImageK
          width={500}
          height={800}
          quality={100}
          className="mx-auto rounded-xl border border-[#e0e0e0] object-contain h-[600px]"
          src={item.coverImage.split("/").pop()}
          alt={item.name}
          onClick={() => {
            onOpen();
            setSelectedImages(item);
          }}
        />
        <Card
          className={cn("-mt-40 first:mt-4 mx-auto p-4 overflow-visible w-11/12")}
          key={item.id}
          id={`${item.id}`}
        >
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-2">
              <Avatar>
                <AvatarImage src={item.coverImage.split("/").pop()} />
                <AvatarFallback>
                  <Icon className="h-6 w-6" name="user-outline" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Thais</span>
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
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p className="mt-2 line-clamp-3 text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger disabled={isDeleting}>
                  <Button variant="ghost" className="rounded-full">
                    <Icon
                      className="h-6 w-6 rotate-90"
                      name="menu-dots-outline"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-gray-200 rounded-lg">
                  {actionMenuOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.key}
                      className={option.color ? `text-${option.color}` : ""}
                      onClick={() => handleActionMenu(option.key)}
                      disabled={option.key === 'delete' && isDeleting}
                    >
                      <span className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                        {option.key === 'delete' && isDeleting && ' (Deleting...)'}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex items-center justify-start gap-1">
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={handleLikeStory}
              >
                <motion.div
                  animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                >
                  {isLiked ? (
                    <Icon className="h-6 w-6" name="heart-filled" />
                  ) : (
                    <Icon className="h-6 w-6" name="heart-outline" />
                  )}
                </motion.div>
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={handleBookmarkStory}
              >
                <motion.div
                  animate={{ scale: isBookmarked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                >
                  {isBookmarked ? (
                    <Icon className="h-6 w-6" name="bookmark-filled" />
                  ) : (
                    <Icon className="h-6 w-6" name="bookmark-outline" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);

StoryCard.displayName = "StoryCard";
