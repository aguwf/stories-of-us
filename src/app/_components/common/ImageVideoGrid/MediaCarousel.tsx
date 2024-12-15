"use client";

import React, { useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Video from "./Video";
import Fade from "embla-carousel-fade";
import ImageK from "../ImageK";
import { cn } from "@/lib/utils";
import { type CarouselApi } from "@/components/ui/carousel";
import { Icon } from "../icon";

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
    const commonClasses = cn(
      "w-full h-full object-cover",
      isThumbnail ? "rounded-sm" : "rounded-lg"
    );

    const handleSaveImage = async (src: string) => {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error saving image:', error);
      }
    };

    if (item.type === "video") {
      return <Video src={item.src} className={commonClasses} />;
    } else {
      return (
        <div className="relative group">
          <ImageK
            width={isThumbnail ? 100 : 500}
            height={isThumbnail ? 100 : 800}
            quality={100}
            src={item.src.split("/").pop() || ""}
            alt="Media item"
            className={commonClasses}
          />
          {!isThumbnail && (
            <div className="absolute top-2 right-2 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70">
                    <Icon name="copy-outline" className="h-4 w-4 text-white" />
                    {/* <Icon name="more-vertical" className="h-4 w-4 text-white" /> */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="border-gray-200 rounded-lg" onClick={() => handleSaveImage(item.src)}>
                    <Icon name="bookmark-filled" className="h-4 w-4 mr-2" />
                    {/* <Icon name="download" className="h-4 w-4 mr-2" /> */}
                    Save Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
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
