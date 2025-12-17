import { MapPin, SmilePlus, Globe } from "lucide-react";
import { memo } from "react";

interface StoryCardContentProps {
  title: string;
  description?: string | null;
  location?: string;
  feeling?: string;
  activity?: string;
  privacy?: "public" | "friends" | "onlyme";
  postFormat?: "standard" | "background" | "poll";
}

const sanitizeToText = (value: string) =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/<[^>]+>/g, "");

const StoryCardContent = memo<StoryCardContentProps>(
  ({ title, description, location, feeling, activity, privacy, postFormat }) => {
    const showMetadata = location || feeling || activity;

    const parsePoll = () => {
      if (!description) return null;
      try {
        const parsed = JSON.parse(description);
        if (parsed?.question) {
          return {
            question: parsed.question as string,
            options: (parsed.options as string[]) || [],
          };
        }
      } catch {
        return null;
      }
      return null;
    };
    
    const privacyLabels = {
      public: "Public",
      friends: "Friends",
      onlyme: "Only Me"
    };
    
    const privacyIcons = {
      public: <Globe size={14} />,
      friends: <Globe size={14} />,
      onlyme: <Globe size={14} />
    };
    
    const renderDescription = () => {
      if (!description) return null;
      const safeDescription = sanitizeToText(description).trim();

      if (!safeDescription) return null;

      const renderTextBlock = (className: string) => (
        <div className={className}>
          {safeDescription.split("\n").map((line) => {
            const key = line.trim() || crypto.randomUUID();
            return (
              <p key={key} className="mt-1 first:mt-0">
                {line}
              </p>
            );
          })}
        </div>
      );

      if (postFormat === "background" && description) {
        return renderTextBlock(
          "mt-4 p-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg prose prose-sm prose-invert max-w-none"
        );
      }
      
      return renderTextBlock(
        "mt-2 text-sm text-muted-foreground prose prose-sm max-w-none"
      );
    };

    const pollData = postFormat === "poll" ? parsePoll() : null;
    
    return (
      <div>
        <div className="flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          
          {privacy && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              {privacyIcons[privacy]}
              <span>{privacyLabels[privacy]}</span>
            </div>
          )}
        </div>
        
        {showMetadata && (
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{location}</span>
              </div>
            )}
            
            {(feeling || activity) && (
              <div className="flex items-center gap-1">
                <SmilePlus size={14} />
                <span>{feeling || activity}</span>
              </div>
            )}
          </div>
        )}
        
        {pollData ? (
          <div className="mt-3 rounded-md border bg-muted/40 p-3">
            <p className="font-semibold text-sm">{pollData.question}</p>
            <div className="mt-2 space-y-2">
              {pollData.options?.map((option) => (
                <div
                  key={option}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          renderDescription()
        )}
      </div>
    );
  }
);

StoryCardContent.displayName = "StoryCardContent";

export default StoryCardContent;
