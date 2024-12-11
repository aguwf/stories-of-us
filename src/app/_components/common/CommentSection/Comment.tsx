import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentType } from "@/types";
import { formatDistanceToNow } from "date-fns";

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
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.userAvatar} />
        <AvatarFallback>{comment.userName.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-secondary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{comment.userName}</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p>{comment.content}</p>
          
          {/* Reactions */}
          <div className="flex gap-2 mt-2">
            {Object.entries(comment.reactions).map(([emoji, users]) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="text-sm"
              >
                {emoji} {users.length}
              </Button>
            ))}
          </div>
        </div>

        {/* Reply section */}
        <div className="mt-2 flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </Button>
        </div>

        {isReplying && (
          <div className="mt-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleReply}>
                Reply
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && (
          <div className="mt-4 ml-8 space-y-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment; 