import ImageK from "@/app/_components/common/ImageK";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import {
	Button,
	Card,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@nextui-org/react";
import {
	IconBookmark,
	IconBookmarkFilled,
	IconHeart,
	IconHeartFilled,
} from "@tabler/icons-react";
import { message } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
	Copy01Icon,
	Delete02Icon,
	InsertRowDownIcon,
	MoreVerticalCircle01Icon,
	PencilEdit01Icon,
} from "hugeicons-react";
import { memo, useState } from "react";
const actionMenuOptions = [
	{ key: "copy", label: "Copy link", icon: <Copy01Icon size={20} /> },
	{ key: "edit", label: "Edit", icon: <PencilEdit01Icon size={20} /> },
	{
		key: "delete",
		label: "Delete",
		color: "danger" as const,
		icon: <Delete02Icon size={20} />,
	},
	{
		key: "insertAfter",
		label: "Insert after",
		icon: <InsertRowDownIcon size={20} />,
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

		const handleActionMenu = (key: any) => {
			switch (key) {
				case "delete":
					message.info("Deleting...");
					deleteStory.mutate({ id: item.id });
					break;
				case "edit":
					setSelectedStory(item);
					break;
				case "copy":
					// Implement copy link functionality
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

		const utils = api.useUtils();

		const deleteStory = api.story.delete.useMutation({
			onSuccess: async () => {
				message.success("Deleted successfully");
				await utils.story.invalidate();
			},
			onError: () => {
				message.error("Failed to delete story");
			},
		});

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
			<Card className={clsx("mt-4 w-full p-4")} key={item.id} id={`${item.id}`}>
				<div className="mb-4 flex items-center gap-2">
					<img
						src={item.coverImage.split("/").pop()}
						alt="Avatar"
						className="h-10 w-10 rounded-full"
					/>
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
				<div className="flex-1">
					<ImageK
						width={500}
						height={300}
						quality={80}
						className="w-full rounded-xl border border-[#e0e0e0] object-cover"
						src={item.coverImage.split("/").pop()}
						alt={item.name}
						onClick={() => {
							onOpen();
							setSelectedImages(item);
						}}
					/>
					<div className="mt-4 flex items-start justify-between">
						<div>
							<h3 className="font-bold">{item.name}</h3>
							<p className="mt-2 line-clamp-3 text-gray-400 text-sm">
								{item.description}
							</p>
						</div>
						<Dropdown>
							<DropdownTrigger>
								<Button variant="light" isIconOnly className="rounded-full">
									<MoreVerticalCircle01Icon />
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								aria-label="Story actions"
								onAction={handleActionMenu}
							>
								{actionMenuOptions.map((option) => (
									<DropdownItem
										key={option.key}
										className={option.color ? `text-${option.color}` : ""}
										color={option.color}
									>
										<span className="flex items-center gap-2">
											{option.icon}
											{option.label}
										</span>
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					</div>
					<div className="mt-4 flex items-start justify-between">
						<div>
							<Button
								variant="light"
								isIconOnly
								className="rounded-full"
								onClick={handleLikeStory}
							>
								<motion.div
									animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
									transition={{ duration: 0.5, times: [0, 0.5, 1] }}
								>
									{isLiked ? (
										<IconHeartFilled color="#FF6F61" stroke={1} />
									) : (
										<IconHeart />
									)}
								</motion.div>
							</Button>
							<Button
								variant="light"
								isIconOnly
								className="ml-2 rounded-full"
								onClick={handleBookmarkStory}
							>
								<motion.div
									animate={{ scale: isBookmarked ? [1, 1.2, 1] : 1 }}
									transition={{ duration: 0.5, times: [0, 0.5, 1] }}
								>
									{isBookmarked ? (
										<IconBookmarkFilled color="#FFD966" stroke={1} />
									) : (
										<IconBookmark />
									)}
								</motion.div>
							</Button>
						</div>
					</div>
				</div>
			</Card>
		);
	},
);

StoryCard.displayName = "StoryCard";
