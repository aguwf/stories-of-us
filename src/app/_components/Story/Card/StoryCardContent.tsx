import { memo } from "react";

interface StoryCardContentProps {
    title: string;
    description: string | null;
}

const StoryCardContent = memo<StoryCardContentProps>(
    ({ title, description }) => (
        <div>
            <h3 className="font-bold">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {description}
                </p>
            )}
        </div>
    ),
);

StoryCardContent.displayName = "StoryCardContent";

export default StoryCardContent;
