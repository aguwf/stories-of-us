import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { CommentType } from "@/types";
import Comment from "./Comment";
import { useUserStore } from "@/app/_store/userStore";

interface CommentSectionProps {
  comments: CommentType[];
  onAddComment: (content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
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
    <div className="w-full max-w-screen-md mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback>{user?.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              <EmojiPicker
                onEmojiSelect={(emoji) => 
                  setNewComment((prev) => prev + emoji.native)
                }
              />
              <Button className="rounded-full" type="submit" disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection; 