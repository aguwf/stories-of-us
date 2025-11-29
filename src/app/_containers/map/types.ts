import type { Review, ReviewSummary } from "@/types/map.types";

export interface StoreData {
  id?: number;
  name: string;
  address: string;
  notes: string;
  coordinates: [number, number];
  distance?: string;
  openingHours?: string;
  rating?: number;
  images?: string[];
  tags?: string[];
  price?: 1 | 2 | 3 | 4;
  amenities?: string[];
  popularity?: number;
  reviews?: Review[];
  reviewSummary?: ReviewSummary;
  reviewPhotos?: string[];
  userReview?: Review;
  updatedAt?: string | Date | null;
}
