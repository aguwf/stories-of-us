import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import { Card } from "@nextui-org/react";
import { message } from "antd";
import { motion } from "framer-motion";
import { memo, useState, useMemo, useEffect } from "react";
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
import ImageVideoGrid from "../common/ImageVideoGrid/ImageVideoGrid";
import {useUserStore} from "@/app/_store/userStore";

type ActionMenuOption = {
  key: "copy" | "edit" | "delete" | "insertAfter";
  label: string;
  icon: React.ReactNode;
  color?: "danger";
};

const actionMenuOptions: ActionMenuOption[] = [
  {
    key: "copy",
    label: "Copy link",
    icon: <Icon className="w-5 h-5" name="copy-outline" />,
  },
  {
    key: "edit",
    label: "Edit",
    icon: <Icon className="w-5 h-5" name="pen-outline" />,
  },
  {
    key: "delete",
    label: "Delete",
    color: "danger" as const,
    icon: <Icon className="w-5 h-5" name="trash-outline" />,
  },
  {
    key: "insertAfter",
    label: "Insert after",
    icon: <Icon className="w-5 h-5" name="insert-outline" />,
  },
];

interface StoryCardProps {
  item: StoryType;
  setSelectedStory: (story: StoryType) => void;
  setSelectedImages: (story: StoryType) => void;
  sort: number;
  openModal: () => void;
  setCreateIndex: (index: number) => void;
}

// Define the gradient classes in your CSS or Tailwind config
const gradientClasses = {
  purple: "bg-gradient-to-b from-[#E4D6F5]/50 to-transparent",
  blue: "bg-gradient-to-b from-[#A1C9F2]/50 to-transparent",
  violet: "bg-gradient-to-b from-[#C5A3F2]/50 to-transparent",
  green: "bg-gradient-to-b from-[#C6F6D5]/50 to-transparent",
  orange: "bg-gradient-to-b from-[#FFD6A5]/50 to-transparent",
  red: "bg-gradient-to-b from-[#FFA9A9]/50 to-transparent",
  yellow: "bg-gradient-to-b from-[#FFFACD]/50 to-transparent",
  teal: "bg-gradient-to-b from-[#A7F3D0]/50 to-transparent",
  pink: "bg-gradient-to-b from-[#F9A8D4]/50 to-transparent",
  indigo: "bg-gradient-to-b from-[#A5F3FC]/50 to-transparent",
  cyan: "bg-gradient-to-b from-[#A5F3FC]/50 to-transparent",
  lime: "bg-gradient-to-b from-[#D8F5A2]/50 to-transparent",
  emerald: "bg-gradient-to-b from-[#6EE7B7]/50 to-transparent",
  amber: "bg-gradient-to-b from-[#F6E05E]/50 to-transparent",
  brown: "bg-gradient-to-b from-[#F5DEB3]/50 to-transparent",
  gold: "bg-gradient-to-b from-[#FFD700]/50 to-transparent",
  bronze: "bg-gradient-to-b from-[#CD7F32]/50 to-transparent",
  copper: "bg-gradient-to-b from-[#FFC400]/50 to-transparent",
  mint: "bg-gradient-to-b from-[#ACFFAC]/50 to-transparent",
  lavender: "bg-gradient-to-b from-[#C7B8EA]/50 to-transparent",
  peach: "bg-gradient-to-b from-[#FFD7BE]/50 to-transparent",
  magenta: "bg-gradient-to-b from-[#FF00FF]/50 to-transparent",
  turquoise: "bg-gradient-to-b from-[#00BFFF]/50 to-transparent",
  coral: "bg-gradient-to-b from-[#FFC67D]/50 to-transparent",
  salmon: "bg-gradient-to-b from-[#FFA07A]/50 to-transparent",
  limegreen: "bg-gradient-to-b from-[#32CD32]/50 to-transparent",
  forestgreen: "bg-gradient-to-b from-[#228B22]/50 to-transparent",
  darkgreen: "bg-gradient-to-b from-[#008080]/50 to-transparent",
  lightgreen: "bg-gradient-to-b from-[#90EE90]/50 to-transparent",
  palegreen: "bg-gradient-to-b from-[#98FB98]/50 to-transparent",
  seagreen: "bg-gradient-to-b from-[#20B2AA]/50 to-transparent",
  darkseagreen: "bg-gradient-to-b from-[#8FBC8F]/50 to-transparent",
  mediumseagreen: "bg-gradient-to-b from-[#3CB371]/50 to-transparent",
  lightseagreen: "bg-gradient-to-b from-[#20B2AA]/50 to-transparent",
  paleseagreen: "bg-gradient-to-b from-[#AFEEEE]/50 to-transparent",
  sienna: "bg-gradient-to-b from-[#A0522D]/50 to-transparent",
  skyblue: "bg-gradient-to-b from-[#87CEEB]/50 to-transparent",
  slateblue: "bg-gradient-to-b from-[#6A5ACD]/50 to-transparent",
  slategray: "bg-gradient-to-b from-[#708090]/50 to-transparent",
  springgreen: "bg-gradient-to-b from-[#00FF7F]/50 to-transparent",
  steelblue: "bg-gradient-to-b from-[#4682B4]/50 to-transparent",
  tan: "bg-gradient-to-b from-[#D2B48C]/50 to-transparent",
  thistle: "bg-gradient-to-b from-[#D8BFD8]/50 to-transparent",
  tomato: "bg-gradient-to-b from-[#FF6347]/50 to-transparent",
};

export const StoryCard: React.FC<StoryCardProps> = memo(
  ({
    item,
    setSelectedStory,
    sort,
    openModal,
    setCreateIndex,
  }) => {
    const { user } = useUserStore();
    const userId = user?.id;
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

    const handleActionMenu = (key: ActionMenuOption["key"]) => {
      switch (key) {
        case "delete":
          if (window.confirm("Are you sure you want to delete this story?")) {
            deleteStory.mutate({ id: item.id });
          }
          break;
        case "edit":
          setSelectedStory(item);
          break;
        case "copy":
          void navigator.clipboard
            .writeText(`${window.location.origin}/story/${item.id}`)
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

    const toggleHeart = api.story.toggleHeart.useMutation({
      onMutate: () => {
        setIsLiked(!isLiked);
      },
      onSuccess: async () => {
        await utils.story.invalidate();
      },
      onError: (error) => {
        setIsLiked(!isLiked);
        message.error(error.message || "Failed to update heart");
      },
    });

    const handleLikeStory = () => {
      toggleHeart.mutate({ storyId: item.id, userId: userId ?? "" });
    };

    const handleBookmarkStory = () => {
      setIsBookmarked(!isBookmarked);
      console.log("Bookmark story button clicked");
      // Add your logic here to handle the bookmark story functionality
    };

    const gradientClass = useMemo(() => {
      const classes = Object.values(gradientClasses);
      return classes[Math.floor(Math.random() * classes.length)];
    }, []);

    useEffect(() => {
      if (item) {
        setIsLiked(item.isHearted);
      }
    }, [item]);

    return (
      <div className="mb-10">
        <div className="relative">
          <div
            className={`flex justify-between items-start p-6 pb-8 rounded-xl ${gradientClass}`}
          >
            <div className="flex gap-2 items-center">
              <Avatar className="border-gray-200 border-1">
                <AvatarImage src={item?.user?.avatar || ""} />
                <AvatarFallback>
                  <Icon className="w-6 h-6" name="user-outline" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{item?.user?.name || ""}</span>
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
            <div className="flex gap-3 justify-start items-center">
              <Button
                variant="ghost"
                className="px-1 py-0 rounded-full"
                onClick={handleLikeStory}
              >
                <motion.div
                  animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                >
                  {isLiked ? (
                    <Icon className="!h-6 !w-6" name="heart-filled" />
                  ) : (
                    <Icon className="!h-6 !w-6" name="heart-outline" />
                  )}
                </motion.div>
              </Button>
              <Button
                variant="ghost"
                className="px-1 py-0 rounded-full"
                onClick={handleBookmarkStory}
              >
                <motion.div
                  animate={{ scale: isBookmarked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                >
                  {isBookmarked ? (
                    <Icon className="!h-6 !w-6" name="bookmark-filled" />
                  ) : (
                    <Icon className="!h-6 !w-6" name="bookmark-outline" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>
          <ImageVideoGrid
            items={item.images.map((image) => ({ type: 'image', src: image }))}
            // videos={item.videos}
            story={item}
          />
        </div>
        <Card
          className={cn(
            "-mt-16 first:mt-4 mx-auto p-4 overflow-visible w-[88%]"
          )}
          key={item.id}
          id={`${item.id}`}
        >
          <div className="flex flex-1 justify-between">
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="mt-2 text-sm text-gray-400 line-clamp-3">
                {item.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger disabled={isDeleting}>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full focus-visible:!shadow-none focus:outline-none"
                >
                </Button> */}
                  <Icon
                    className="w-6 h-6 rotate-90"
                    name="menu-dots-outline"
                  />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-lg border-gray-200">
                {actionMenuOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.key}
                    className={option.color ? `text-${option.color}` : ""}
                    onClick={() => handleActionMenu(option.key)}
                    disabled={option.key === "delete" && isDeleting}
                  >
                    <span className="flex gap-2 items-center">
                      {option.icon}
                      {option.label}
                      {option.key === "delete" &&
                        isDeleting &&
                        " (Deleting...)"}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2 items-center">
              <Icon className="w-4 h-4" name="heart-filled" />
              <span className="text-sm text-gray-400">
                {item.heartCount} hearts
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Icon className="w-4 h-4" name="eye-outline" />
              <span className="text-sm text-gray-400">
                0 seen
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Icon className="w-4 h-4" name="square-share-line-outline" />
              <span className="text-sm text-gray-400">
                0 shared
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);

StoryCard.displayName = "StoryCard";
