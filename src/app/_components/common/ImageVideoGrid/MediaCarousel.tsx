"use client";

import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Fade from "embla-carousel-fade";
import React, { useCallback, useEffect } from "react";
import { Icon } from "../Icon";
import ImageK from "../ImageK";
import Video from "./Video";

interface MediaItem {
	type: "image" | "video";
	src: string;
}

interface MediaCarouselProps {
	items: MediaItem[];
	initialIndex: number;
	className?: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
	items,
	initialIndex,
	className,
}) => {
	const [mainApi, setMainApi] = React.useState<CarouselApi>();
	const [, setThumbnailApi] = React.useState<CarouselApi>();

	const plugin = React.useRef(
		Fade({
			active: true,
		}) as any
	);

	useEffect(() => {
		if (!mainApi) return;
		mainApi.scrollTo(initialIndex);
	}, [mainApi, initialIndex]);

	const renderMediaItem = (item: MediaItem, isThumbnail = false) => {
		const commonClasses = cn(
			"w-full h-full object-cover",
			isThumbnail ? "rounded-sm" : "rounded-lg"
		);

		const handleSaveImage = async (src: string) => {
			try {
				const response = await fetch(src);
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `image-${Date.now()}.jpg`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			} catch (error) {
				console.error("Error saving image:", error);
			}
		};

		if (item.type === "video") {
			return <Video src={item.src} className={commonClasses} />;
		}
		return (
			<div className={"relative group"} key={item.src}>
				<ImageK
					width={isThumbnail ? 76 : 400}
					height={isThumbnail ? 50 : 800}
					quality={100}
					src={item.src.split("/").pop() || ""}
					alt="Media item"
					className={commonClasses}
				/>
				{!isThumbnail && (
					<div className="absolute top-2 right-2 transition-opacity">
						<DropdownMenu>
							<DropdownMenuTrigger asChild={true}>
								<Button
									variant="ghost"
									size="icon"
									className="bg-black/50 hover:bg-black/70"
								>
									<Icon
										name="menu-dots-outline"
										className="w-4 h-4 text-white"
									/>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									className="rounded-lg border-gray-200"
									onClick={() => handleSaveImage(item.src)}
								>
									<Icon name="insert-outline" className="mr-2 w-4 h-4" />
									{/* <Icon name="download" className="mr-2 w-4 h-4" /> */}
									Save Image
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>
		);
	};

	const renderCarouselThumb = (item: MediaItem) => {
		return (
			<div className="aspect-square w-20 h-20 border-2 rounded-lg overflow-hidden select-none cursor-pointer hover:border-primary transition-colors">
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
		<div className="w-full">
			{/* Main Carousel */}
			<Carousel
				className={cn("relative w-full", className)}
				plugins={[plugin.current]}
				setApi={setMainApi}
				opts={{
					loop: true,
				}}
			>
				<CarouselContent>
					{items.map((item, index) => (
						<CarouselItem
							key={index}
							className="flex items-center justify-center"
						>
							<div className="w-full max-w-4xl mx-auto">
								{renderMediaItem(item)}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="left-4" />
				<CarouselNext className="right-4" />
			</Carousel>

			{/* Thumbnail Carousel */}
			{items.length > 1 && (
				<Carousel
					className="relative w-full mt-4 px-4"
					opts={{
						dragFree: true,
						containScroll: "trimSnaps",
						axis: "x",
						align: "start",
					}}
					setApi={setThumbnailApi}
				>
					<CarouselContent className="-ml-2">
						{items.map((item, index) => (
							<CarouselItem
								className="basis-1/5 md:basis-1/6 lg:basis-1/8 pl-2"
								key={index}
								onClick={() => onThumbClick(index)}
							>
								{renderCarouselThumb(item)}
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			)}
		</div>
	);
};

export default MediaCarousel;
