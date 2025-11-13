import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import type React from "react";
import { useState } from "react";

interface CommentProps {
	comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
	const [isReplying, setIsReplying] = useState(false);
	const [replyContent, setReplyContent] = useState("");

	const handleReply = () => {
		// Implement reply logic
		setIsReplying(false);
		setReplyContent("");
	};

	return (
		<div className="flex gap-3">
			<Avatar className="w-8 h-8">
				<AvatarImage src={comment.userAvatar} />
				<AvatarFallback>{comment.userName.substring(0, 2)}</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<div className="bg-secondary rounded-2xl px-4 py-2">
					<div className="flex flex-col">
						<span className="font-semibold text-sm">{comment.userName}</span>
						<p className="text-sm mt-0.5">{comment.content}</p>
					</div>

					{/* Reactions */}
					<div className="flex gap-1.5 mt-1">
						{Object.entries(comment.reactions).map(([emoji, users]) => (
							<Button
								key={emoji}
								variant="ghost"
								size="sm"
								className="h-6 px-2 text-xs font-medium hover:bg-secondary/80"
							>
								{emoji} {users.length}
							</Button>
						))}
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex gap-4 mt-1 px-2">
					<button
						type="button"
						className="text-xs font-semibold text-muted-foreground hover:underline"
					>
						Like
					</button>
					<button
						type="button"
						className="text-xs font-semibold text-muted-foreground hover:underline"
						onClick={() => setIsReplying(!isReplying)}
					>
						Reply
					</button>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(comment.createdAt, { addSuffix: true })}
					</span>
				</div>

				{isReplying && (
					<div className="mt-3">
						<div className="flex gap-3">
							<Avatar className="w-8 h-8">
								<AvatarImage src={comment.userAvatar} />
								<AvatarFallback>
									{comment.userName.substring(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<Textarea
									value={replyContent}
									onChange={e => setReplyContent(e.target.value)}
									placeholder="Write a reply..."
									className="min-h-[40px] px-4 py-2 rounded-2xl bg-secondary resize-none overflow-hidden focus:ring-1 focus:ring-primary/20"
								/>
								<div className="flex justify-end gap-2 mt-2">
									<Button
										variant="ghost"
										size="sm"
										className="h-8 text-sm"
										onClick={() => setIsReplying(false)}
									>
										Cancel
									</Button>
									<Button
										size="sm"
										onClick={handleReply}
										className="h-8 rounded-full px-4"
									>
										Reply
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Nested replies */}
				{comment.replies && (
					<div className="mt-2 ml-6 space-y-3">
						{comment.replies.map(reply => (
							<Comment key={reply.id} comment={reply} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Comment;
