import { Button } from "@/components/ui/button";
import { memo } from "react";
import AnimatedActionButton from "../AnimatedActionButton";
import { Icon } from "../../common/icon";
import { ICON_SIZE_LARGE, ICON_SIZE_MEDIUM } from "@/utils/constants";

interface StoryCardActionsProps {
    isLiked: boolean;
    isBookmarked: boolean;
    onLike: () => void;
    onBookmark: () => void;
}

const StoryCardActions = memo<StoryCardActionsProps>(
    ({ isLiked, isBookmarked, onLike, onBookmark }) => (
        <div className="flex items-center mt-4">
            <AnimatedActionButton
                isActive={isLiked}
                activeIcon="heart-filled"
                inactiveIcon="heart-outline"
                activeLabel=" Unlike"
                inactiveLabel=" Like"
                onClick={onLike}
            />
            <AnimatedActionButton
                isActive={isBookmarked}
                activeIcon="bookmark-filled"
                inactiveIcon="bookmark-outline"
                activeLabel=" Saved"
                inactiveLabel=" Bookmark"
                onClick={onBookmark}
            />
            <Button variant="ghost" size="sm" className="gap-2 p-0 w-1/3">
                <Icon className="!h-5 !w-5" name="square-share-line-outline" />
                Share
            </Button>
        </div>
    ),
);

StoryCardActions.displayName = "StoryCardActions";

export default StoryCardActions;
