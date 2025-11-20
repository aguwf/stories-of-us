import { MapPin, SmilePlus, Globe } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface StoryCardContentProps {
  title: string;
  description: string | null;
  location?: string;
  feeling?: string;
  activity?: string;
  privacy?: "public" | "friends" | "onlyme";
  postFormat?: "standard" | "background" | "poll";
}

const StoryCardContent = memo<StoryCardContentProps>(
  ({ title, description, location, feeling, activity, privacy, postFormat }) => {
    const showMetadata = location || feeling || activity;
    
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
      if (postFormat === "background" && description) {
        return (
          <p className="mt-4 p-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
            {description}
          </p>
        );
      }
      
      return description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      );
    };
    
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
        
        {renderDescription()}
      </div>
    );
  }
);

StoryCardContent.displayName = "StoryCardContent";

export default StoryCardContent;