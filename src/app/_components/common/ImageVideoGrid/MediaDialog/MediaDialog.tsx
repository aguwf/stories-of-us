/** Post detail dialog shown when viewing a media item. */
"use client";

import { useUserStore } from "@/app/_store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import type { MediaItem, StoryType } from "@/types";
import type { CommentType } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CommentSection from "../../CommentSection/CommentSection";
import { Icon, type IconName } from "../../Icon";
import MediaCarousel from "../MediaCarousel";

const formatDateLabel = (dateValue: Date | string | null) => {
	const date = new Date(dateValue || new Date());
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

interface MediaDialogProps {
	index: number;
	items: MediaItem[];
	story?: StoryType;
	children: React.ReactNode;
	onOpenChange: (open: boolean) => void;
	selectedIndex: number | null;
}

export const MediaDialog: React.FC<MediaDialogProps> = ({
	index,
	items,
	story,
	children,
	onOpenChange,
	selectedIndex,
}) => {
	const { user } = useUserStore();
	const { userId: clerkUserId } = useAuth();
	const utils = api.useUtils();

	const [isLiked, setIsLiked] = useState(Boolean(story?.isHearted));
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [comments, setComments] = useState<CommentType[]>([]);

	const userId = useMemo(
		() => user?.id ?? clerkUserId ?? null,
		[clerkUserId, user?.id]
	);

	const toggleHeart = api.story.toggleHeart.useMutation({
		onMutate: () => setIsLiked(prev => !prev),
		onSuccess: async () => {
			await utils.story.invalidate();
		},
		onError: error => {
			setIsLiked(prev => !prev);
			toast.error(error.message || "Failed to update heart");
		},
	});

	const postedLabel = formatDateLabel(story?.createdAt ?? null);

	const defaultCommentUser = useMemo(
		() => ({
			userId: user?.id ?? "guest",
			userName: user?.name ?? "Guest",
			userAvatar: user?.avatar ?? "",
		}),
		[user?.avatar, user?.id, user?.name]
	);

	const handleAddComment = useCallback(
		(content: string) => {
			const newComment: CommentType = {
				id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
				content,
				createdAt: new Date(),
				reactions: {},
				replies: [],
				...defaultCommentUser,
			};
			setComments(prev => [newComment, ...prev]);
		},
		[defaultCommentUser]
	);

	const handleCopyLink = useCallback(() => {
		if (!story?.id) return;
		const link = `${window.location.origin}/story/${story.id}`;
		navigator.clipboard
			.writeText(link)
			.then(() => toast.success("Link copied to clipboard"))
			.catch(() => toast.error("Failed to copy link"));
	}, [story?.id]);

	const handleLikeStory = useCallback(() => {
		if (!userId || !story?.id) {
			toast.error("Please sign in to like stories");
			return;
		}
		toggleHeart.mutate({ storyId: story.id });
	}, [story?.id, toggleHeart, userId]);

	const handleBookmarkStory = useCallback(() => {
		setIsBookmarked(prev => !prev);
		toast.info("Bookmark feature coming soon");
	}, []);

	useEffect(() => {
		setIsLiked(Boolean(story?.isHearted));
	}, [story?.isHearted]);

	const metaBadges = useMemo(
		() =>
			[
				{ icon: "lock-closed-outline" as IconName, label: story?.privacy },
				{ icon: "map-pin-outline" as IconName, label: story?.location },
				{ icon: "sparkles-outline" as IconName, label: story?.feeling },
			].filter(
				(item): item is { icon: IconName; label: string } =>
					Boolean(item.label)
			),
		[story?.feeling, story?.location, story?.privacy]
	);

	const statItems = useMemo(
		() =>
			[
				{
					icon: "heart-outline" as IconName,
					label: "Reactions",
					value: story?.heartCount ?? 0,
				},
				{
					icon: "chat-outline" as IconName,
					label: "Comments",
					value: comments.length,
				},
				{
					icon: "share-outline" as IconName,
					label: "Shares",
					value: 0,
				},
			] as Array<{ icon: IconName; label: string; value: number }>,
		[comments.length, story?.heartCount]
	);

	const handleShare = useCallback(() => {
		if (!story?.id) return;
		const link = `${window.location.origin}/story/${story.id}`;
		if (navigator.share) {
			navigator
				.share({ url: link, title: story?.name ?? "Story", text: story?.description ?? "" })
				.catch(() => handleCopyLink());
			return;
		}
		handleCopyLink();
	}, [handleCopyLink, story?.description, story?.id, story?.name]);

	return (
		<Dialog onOpenChange={onOpenChange}>
			<DialogTrigger asChild={true}>{children}</DialogTrigger>
			<DialogContent className="max-w-7xl w-[96vw] h-[92vh] p-0 border-none bg-white/95 backdrop-blur-sm overflow-hidden flex flex-col">
				<div className="grid h-full md:grid-cols-[minmax(0,1.4fr)_minmax(360px,1fr)]">
					<div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 px-3 py-4 md:p-6 flex items-center justify-center overflow-hidden">
						<div className="w-full h-full max-w-4xl rounded-2xl bg-white shadow-sm border p-3 md:p-4 flex items-center justify-center">
							<MediaCarousel
								items={items}
								initialIndex={selectedIndex ?? index}
								className="w-full"
							/>
						</div>
					</div>

					<div className="flex flex-col min-h-0 bg-white">
						<div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b bg-white/90 backdrop-blur-sm">
							<div className="flex items-center gap-3">
								<Avatar className="h-12 w-12 border-2 border-gray-200">
									<AvatarImage src={story?.user?.avatar ?? ""} />
									<AvatarFallback>
										<Icon className="h-6 w-6" name="user-outline" />
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="font-semibold text-base">
										{story?.user?.name ?? "Unknown author"}
									</span>
									<div className="flex items-center gap-2 text-muted-foreground">
										<Icon name="time-outline" className="h-4 w-4" />
										<span className="text-sm">{postedLabel}</span>
									</div>
								</div>
							</div>
							<DialogClose asChild={true}>
								<Button variant="ghost" size="icon" aria-label="Close dialog">
									<Icon name="close-outline" className="h-5 w-5" />
								</Button>
							</DialogClose>
						</div>

						<div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
							<div className="space-y-2">
								<h3 className="text-2xl font-bold leading-tight">
									{story?.name ?? "Untitled story"}
								</h3>
								{story?.description && (
									<p className="text-muted-foreground leading-relaxed">
										{story.description}
									</p>
								)}
								{metaBadges.length > 0 && (
									<div className="flex flex-wrap gap-2 pt-2">
										{metaBadges.map(item => (
											<span
												key={`${item.icon}-${item.label}`}
												className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium border"
											>
												<Icon name={item.icon} className="h-3.5 w-3.5" />
												{item.label}
											</span>
										))}
									</div>
								)}
							</div>

							<div className="rounded-xl border bg-white shadow-sm p-4 space-y-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="flex flex-wrap gap-3">
										{statItems.map(stat => (
											<div
												key={stat.label}
												className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 border"
											>
												<Icon name={stat.icon} className="h-4 w-4" />
												<span className="font-semibold">{stat.value}</span>
												<span className="text-xs text-muted-foreground">
													{stat.label}
												</span>
											</div>
										))}
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											className="gap-2"
											onClick={handleShare}
										>
											<Icon name="square-share-line-outline" className="h-4 w-4" />
											Share
										</Button>
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										variant={isLiked ? "secondary" : "outline"}
										size="sm"
										className="gap-2"
										onClick={handleLikeStory}
									>
										<Icon
											name={isLiked ? "heart-filled" : "heart-outline"}
											className="h-4 w-4"
										/>
										{isLiked ? "Liked" : "Like"}
									</Button>
									<Button
										variant={isBookmarked ? "secondary" : "outline"}
										size="sm"
										className="gap-2"
										onClick={handleBookmarkStory}
									>
										<Icon
											name={
												isBookmarked ? "bookmark-filled" : "bookmark-outline"
											}
											className="h-4 w-4"
										/>
										{isBookmarked ? "Saved" : "Bookmark"}
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={handleShare}
									>
										<Icon name="square-share-line-outline" className="h-4 w-4" />
										Share
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={handleCopyLink}
									>
										<Icon name="copy-outline" className="h-4 w-4" />
										Copy link
									</Button>
								</div>
							</div>

							<div className="rounded-xl border bg-white shadow-sm p-4 space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex flex-col">
										<span className="text-base font-semibold">Comments</span>
										<span className="text-xs text-muted-foreground">
											Share your thoughts about this story
										</span>
									</div>
									<span className="text-xs text-muted-foreground">
										{comments.length} total
									</span>
								</div>
								{comments.length === 0 && (
									<div className="rounded-lg border bg-slate-50 text-slate-600 px-3 py-2 text-sm">
										Be the first to comment.
									</div>
								)}
								<CommentSection
									comments={comments}
									onAddComment={handleAddComment}
								/>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
