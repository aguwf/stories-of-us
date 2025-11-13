import { useUserStore } from "@/app/_store/userStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import {
	DELETE_CONFIRMATION_MESSAGE,
	ICON_SIZE_MEDIUM,
	gradientClasses,
} from "@/utils/constants";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Icon } from "../common/Icon";
import ImageVideoGrid from "../common/ImageVideoGrid/ImageVideoGrid";
import StoryCardActionMenu, {
	type ActionMenuKey,
	type ActionMenuOption,
} from "./Card/StoryCardActionMenu";
import StoryCardActions from "./Card/StoryCardActions";
import StoryCardContent from "./Card/StoryCardContent";
import StoryCardStats from "./Card/StoryCardStats";
import StoryCardUserInfo, {
	type FormattedDateInfo,
} from "./Card/StoryCardUserInfo";

const actionMenuOptions: ActionMenuOption[] = [
	{
		key: "copy",
		label: "Copy link",
		icon: <Icon className={ICON_SIZE_MEDIUM} name="copy-outline" />,
	},
	{
		key: "edit",
		label: "Edit",
		icon: <Icon className={ICON_SIZE_MEDIUM} name="pen-outline" />,
	},
	{
		key: "delete",
		label: "Delete",
		color: "danger" as const,
		icon: <Icon className={ICON_SIZE_MEDIUM} name="trash-outline" />,
	},
	{
		key: "insertAfter",
		label: "Insert after",
		icon: <Icon className={ICON_SIZE_MEDIUM} name="insert-outline" />,
	},
];

interface StoryCardProps {
	item: StoryType;
	setSelectedStory: (story: StoryType) => void;
	sort: number;
	openModal: () => void;
	setCreateIndex: (index: number) => void;
}

// Helper Functions
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

const copyToClipboard = async (text: string): Promise<void> => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Link copied to clipboard");
	} catch {
		toast.error("Failed to copy link");
	}
};

const confirmDelete = (): boolean => {
	return window.confirm(DELETE_CONFIRMATION_MESSAGE);
};

// Main Component
export const StoryCard: React.FC<StoryCardProps> = memo(
	({ item, setSelectedStory, sort, openModal, setCreateIndex }) => {
		// Hooks
		const { user } = useUserStore();
		const utils = api.useUtils();

		// State
		const [isLiked, setIsLiked] = useState(item.isHearted);
		const [isBookmarked, setIsBookmarked] = useState(false);
		const [isDeleting, setIsDeleting] = useState(false);

		// Memoized values
		const userId = useMemo(() => user?.id, [user?.id]);
		const dateInfo = useMemo(
			() => formatDate(item.createdAt),
			[item.createdAt]
		);
		const gradientClass = useMemo(() => getRandomGradient(), []);
		const mediaItems = useMemo(
			() =>
				item.images.map(image => ({
					type: "image" as const,
					src: image,
				})),
			[item.images]
		);

		// API Mutations
		const deleteStory = api.story.delete.useMutation({
			onMutate: () => {
				setIsDeleting(true);
			},
			onSuccess: async () => {
				toast.success("Story deleted successfully");
				await utils.story.invalidate();
			},
			onError: error => {
				toast.error(error.message || "Failed to delete story");
			},
			onSettled: () => {
				setIsDeleting(false);
			},
		});

		const toggleHeart = api.story.toggleHeart.useMutation({
			onMutate: () => {
				setIsLiked(prev => !prev);
			},
			onSuccess: async () => {
				await utils.story.invalidate();
			},
			onError: error => {
				setIsLiked(prev => !prev);
				toast.error(error.message || "Failed to update heart");
			},
		});

		// Event Handlers
		const handleDelete = useCallback(() => {
			if (confirmDelete()) {
				deleteStory.mutate({ id: item.id });
			}
		}, [deleteStory, item.id]);

		const handleEdit = useCallback(() => {
			setSelectedStory(item);
		}, [setSelectedStory, item]);

		const handleCopyLink = useCallback(() => {
			const link = `${window.location.origin}/story/${item.id}`;
			void copyToClipboard(link);
		}, [item.id]);

		const handleInsertAfter = useCallback(() => {
			openModal();
			setCreateIndex(sort);
		}, [openModal, setCreateIndex, sort]);

		const handleActionMenu = useCallback(
			(key: ActionMenuKey) => {
				const actions: Record<ActionMenuKey, () => void> = {
					delete: handleDelete,
					edit: handleEdit,
					copy: handleCopyLink,
					insertAfter: handleInsertAfter,
				};

				actions[key]?.();
			},
			[handleDelete, handleEdit, handleCopyLink, handleInsertAfter]
		);

		const handleLikeStory = useCallback(() => {
			if (!userId) {
				toast.error("Please sign in to like stories");
				return;
			}
			toggleHeart.mutate({ storyId: item.id, userId });
		}, [toggleHeart, item.id, userId]);

		const handleBookmarkStory = useCallback(() => {
			setIsBookmarked(prev => !prev);
			// TODO: Implement bookmark functionality
			toast.info("Bookmark feature coming soon");
		}, []);

		// Sync liked state with item prop
		useEffect(() => {
			setIsLiked(item.isHearted);
		}, [item.isHearted]);

		return (
			<div className="mb-10">
				<Card className="relative">
					<CardHeader
						className={cn(
							"relative p-6 rounded-tl-xl rounded-tr-xl",
							gradientClass
						)}
					>
						<div className="flex justify-between items-start">
							<StoryCardUserInfo
								userName={item?.user?.name}
								userAvatar={item?.user?.avatar || ""}
								dateInfo={dateInfo}
							/>
							<StoryCardActionMenu
								options={actionMenuOptions}
								onActionSelect={handleActionMenu}
								isDeleting={isDeleting}
							/>
						</div>
					</CardHeader>
					<CardContent className="p-6">
						<StoryCardContent
							title={item.name}
							description={item.description}
						/>
						<ImageVideoGrid items={mediaItems} story={item} className="mt-4" />
						<StoryCardActions
							isLiked={isLiked}
							isBookmarked={isBookmarked}
							onLike={handleLikeStory}
							onBookmark={handleBookmarkStory}
						/>
						<StoryCardStats
							heartCount={item?.heartCount}
							viewCount={0}
							shareCount={0}
						/>
					</CardContent>
				</Card>
			</div>
		);
	}
);

StoryCard.displayName = "StoryCard";
