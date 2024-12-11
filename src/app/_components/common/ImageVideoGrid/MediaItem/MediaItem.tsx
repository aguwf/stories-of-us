import Video from "../Video";
import ImageK from "../../ImageK";
import { MediaItem as MediaItemType } from "@/types";

interface MediaItemProps {
  item: MediaItemType;
  className: string;
}

export const MediaItem: React.FC<MediaItemProps> = ({ item, className }) => {
  if (item.type === "video") {
    return <Video src={item.src} className={className} />;
  }
  
  return (
    <ImageK
      width={500}
      height={800}
      quality={100}
      className={className}
      src={item.src.split("/").pop() || ""}
      alt="Media item"
    />
  );
}; 