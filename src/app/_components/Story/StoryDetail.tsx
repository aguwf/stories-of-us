"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StoryType } from "@/types";
import { gradientClasses } from "@/utils/constants";
import { useMemo, useEffect, useState } from "react";
import ImageVideoGrid from "../common/ImageVideoGrid/ImageVideoGrid";
import StoryCardContent from "./Card/StoryCardContent";
import StoryCardUserInfo, {
  type FormattedDateInfo,
} from "./Card/StoryCardUserInfo";
import StoryCardStats from "./Card/StoryCardStats";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface StoryDetailProps {
  story: StoryType;
}

const formatDate = (date: Date | string | null): FormattedDateInfo => {
  const formattedDate = new Date(date || new Date());
  const month = formattedDate
    .toLocaleString("en-US", { month: "long" })
    .slice(0, 3);

  return {
    month,
    day: formattedDate.getDate(),
    year: formattedDate.getFullYear(),
  };
};

const getRandomGradient = (): string => {
  const classes = Object.values(gradientClasses);
  return (
    classes[Math.floor(Math.random() * classes.length)] || classes[0] || ""
  );
};

const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "ogg", "mkv"];

const getMediaType = (src: string): "image" | "video" => {
  const extension = src.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.includes(extension) ? "video" : "image";
};

export default function StoryDetail({ story }: StoryDetailProps) {
  const dateInfo = useMemo(() => formatDate(story.createdAt), [story.createdAt]);

  // Handle hydration mismatch for random gradient
  const [gradient, setGradient] = useState<string>("");

  useEffect(() => {
    setGradient(getRandomGradient());
  }, []);

  const mediaItems = useMemo(
    () =>
      story.images.map((image) => ({
        type: getMediaType(image),
        src: image,
      })),
    [story.images]
  );
  const searchParams = useSearchParams();


  return (
    <Card className="relative overflow-hidden w-full">
      <CardHeader
        className={cn(
          "relative p-6 rounded-tl-xl rounded-tr-xl",
          gradient || gradientClasses.gradient_blue // Default until mounted
        )}
      >
        <div className="flex justify-between items-start">
          <StoryCardUserInfo
            userName={story?.user?.name || "Unknown User"}
            userAvatar={story?.user?.avatar || ""}
            dateInfo={dateInfo}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <StoryCardContent
          title={story.name}
          description={story.description}
        />

        {story.location && (
            <div className="mt-4 flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 mr-1" />
                {story.locationLat && story.locationLng ? (
                    <Link href={`/maps?lat=${story.locationLat}&lng=${story.locationLng}&store=${encodeURIComponent(story.location)}`}>
                         {story.location}
                    </Link>
                ) : (
                    <span>{story.location}</span>
                )}
            </div>
        )}

        <ImageVideoGrid items={mediaItems} story={story} className="mt-4" />

        <div className="mt-6 border-t pt-4">
            <StoryCardStats
                heartCount={story.heartCount || 0}
                viewCount={0}
                shareCount={0}
            />
        </div>
      </CardContent>
    </Card>
  );
}
