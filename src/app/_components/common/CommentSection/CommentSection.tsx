import { useUserStore } from "@/app/_store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Textarea } from "@/components/ui/textarea";
import type { CommentType } from "@/types";
import type React from "react";
import { useState } from "react";
import Comment from "./Comment";

interface CommentSectionProps {
	comments: CommentType[];
	onAddComment: (content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
	comments,
	onAddComment,
}) => {
	const [newComment, setNewComment] = useState("");
	const { user } = useUserStore();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newComment.trim()) {
			onAddComment(newComment);
			setNewComment("");
		}
	};

	return (
		<div className="w-full max-w-screen-md mx-auto py-4">
			<form onSubmit={handleSubmit} className="mb-6">
				<div className="flex gap-3">
					<Avatar className="w-8 h-8">
						<AvatarImage src={user?.avatar || ""} />
						<AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
					</Avatar>
					<div className="flex-1 relative">
						<Textarea
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="Write a comment..."
							className="min-h-[40px] px-4 py-2 rounded-2xl bg-secondary resize-none overflow-hidden focus:ring-1 focus:ring-primary/20"
						/>
						<div className="flex justify-between items-center mt-2">
							<div className="flex items-center gap-2">
								<EmojiPicker
									onEmojiSelect={(emoji) =>
										setNewComment((prev) => prev + emoji.native)
									}
								/>
							</div>
							<Button
								className="rounded-full px-4 py-1 h-8 text-sm font-medium transition-opacity disabled:opacity-50"
								type="submit"
								disabled={!newComment.trim()}
							>
								Post
							</Button>
						</div>
					</div>
				</div>
			</form>

			<div className="space-y-4">
				{comments.map((comment) => (
					<Comment key={comment.id} comment={comment} />
				))}
			</div>
		</div>
	);
};

export default CommentSection;
