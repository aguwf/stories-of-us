"use client";

import React, { useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Video from "./Video";
import Fade from "embla-carousel-fade";
import ImageK from "../ImageK";
import { cn } from "@/lib/utils";
import { type CarouselApi } from "@/components/ui/carousel";

interface MediaItem {
  type: "image" | "video";
  src: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  initialIndex: number;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ items }) => {
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = React.useState<CarouselApi>();
  const [isAtStart, setIsAtStart] = React.useState(true);
  const [isAtEnd, setIsAtEnd] = React.useState(false);
  const [hasScroll, setHasScroll] = React.useState(false);
  
  const plugin = React.useRef(
    Fade({
      active: true,
    }) as any
  );

  useEffect(() => {
    if (!thumbnailApi) return;

    setHasScroll(thumbnailApi.scrollSnapList().length > 5);

    thumbnailApi.on("select", () => {
      setIsAtStart(thumbnailApi.selectedScrollSnap() === 0);
      setIsAtEnd(thumbnailApi.selectedScrollSnap() === thumbnailApi.scrollSnapList().length - 1);
    });
  }, [thumbnailApi]);

  const renderMediaItem = (item: MediaItem, isThumbnail: boolean = false) => {
    if (item.type === "video") {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <Video src={item.src} className="max-w-full max-h-full" />
        </div>
      );
    } else {
      return (
        <div
          className={cn(
            "relative w-screen h-[50vh] flex items-center justify-center bg-black",
            isThumbnail && "h-full w-full"
          )}
        >
          <ImageK
            width={isThumbnail ? 100 : 500}
            height={isThumbnail ? 100 : 800}
            quality={100}
            src={item.src.split("/").pop() || ""}
            alt={`Media item`}
            sizes="100vw"
            className="object-contain w-full h-full"
          />
        </div>
      );
    }
  };

  const renderCarouselThumb = (item: MediaItem) => {
    return (
      <div className="h-[15.5vw] border rounded-xl overflow-hidden mt-2 select-none cursor-pointer">
        {renderMediaItem(item, true)}
      </div>
    );
  };

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi]
  );

  return (
    <div>
      {/* Embla Carousel */}
      <Carousel
        className="relative w-screen"
        plugins={[plugin.current]}
        setApi={setMainApi}
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>{renderMediaItem(item)}</CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {/* Carousel Dots */}
      <Carousel
        className="w-screen px-4 relative"
        opts={{
          dragFree: true,
        }}
        setApi={setThumbnailApi}
      >
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/10 from-40% to-transparent to-90% z-10 transition-opacity duration-300",
            (!hasScroll || isAtEnd) && "opacity-0"
          )}
        />
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/10 from-40% to-transparent to-90% z-10 transition-opacity duration-300",
            (!hasScroll || isAtStart) && "opacity-0"
          )}
        />
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem
              className="basis-1/5"
              key={index}
              onClick={() => onThumbClick(index)}
            >
              {renderCarouselThumb(item)}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default MediaCarousel;
