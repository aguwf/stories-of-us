"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MediaItem, StoryType } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useState } from "react";
import { MediaDialog } from "./MediaDialog/MediaDialog";
import { MediaItem as MediaItemComponent } from "./MediaItem/MediaItem";

interface ImageVideoGridProps {
	items: MediaItem[];
	story?: StoryType;
	className?: string;
}

const ImageVideoGrid: React.FC<ImageVideoGridProps> = ({
	items,
	story,
	className,
}) => {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const itemCount = items.length;

	const gridClassName = () => {
		switch (itemCount) {
			case 1:
				return "grid-cols-1";
			case 2:
				return "grid-cols-2";
			case 3:
				return "grid-cols-2 sm:grid-cols-3";
			default:
				return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
		}
	};

	return (
		<div
			className={`grid gap-1 mx-auto max-w-2xl ${gridClassName()} ${className}`}
		>
			<AnimatePresence>
				{items.slice(0, 4).map((item, index) => {
					return (
						<MediaDialog
							key={item.src}
							index={index}
							items={items}
							story={story}
							selectedIndex={selectedIndex}
							onOpenChange={open => !open && setSelectedIndex(null)}
						>
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
								onClick={() => setSelectedIndex(index)}
							>
								<Card className="overflow-hidden w-full h-full border-none cursor-pointer">
									<CardContent className="p-0 h-full">
										<MediaItemComponent
											item={item}
											className="w-full h-full object-cover rounded-md"
										/>
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
						</MediaDialog>
					);
				})}
			</AnimatePresence>
		</div>
	);
};

export default ImageVideoGrid;
