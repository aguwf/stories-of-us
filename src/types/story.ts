import type { UserType } from "./user";

// Add to existing StoryType interface
export interface StoryType {
  // Existing fields
  id: number;
  name: string;
  description?: string | null;
  coverImage: string;
  images: string[];
  userId: string;
  sort?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  // New fields
  location?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  feeling?: string | null;
  activity?: string | null;
  privacy: "public" | "friends" | "onlyme";
  backgroundStyle?: string | null;
  mentionedUsers?: string[] | null;
  scheduledPublishTime?: Date | null;
  postFormat: "standard" | "background" | "poll";

  // Virtual fields
  user?: UserType;
  heartCount?: number;
  isHearted?: boolean;
  isBookmarked?: boolean;
}
