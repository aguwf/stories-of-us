import type { UserType } from "./user";

// Add to existing StoryType interface
export interface StoryType {
  // Existing fields
  id: number;
  name: string;
  description: string | null;
  coverImage: string;
  images: string[];
  userId: string;
  sort: number | null;
  createdAt: Date;
  updatedAt: Date | null;

  // New fields
  location?: string;
  locationLat?: number;
  locationLng?: number;
  feeling?: string;
  activity?: string;
  privacy: "public" | "friends" | "onlyme";
  backgroundStyle?: string;
  mentionedUsers?: string[];
  scheduledPublishTime?: Date;
  postFormat: "standard" | "background" | "poll";

  // Virtual fields
  user?: UserType;
  heartCount?: number;
  isHearted?: boolean;
}
