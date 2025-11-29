import type * as GeoJSON from "geojson";
export interface RouteStep {
  maneuver: {
    instruction: string;
    location: [number, number];
    type: string;
    modifier?: string;
  };
  distance: number;
  duration: number;
  name: string;
}

export interface RouteData {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
  steps: RouteStep[];
  waypoints?: RouteStop[];
}

export interface RouteStop {
  name: string;
  address?: string;
  notes?: string;
  coordinates: [number, number];
}

export interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: number[][];
      type: "LineString";
    };
  legs: Array<{
    steps: Array<{
      maneuver: {
        instruction: string;
        location: [number, number];
        type: string;
          modifier?: string;
        };
        distance: number;
        duration: number;
        name: string;
      }>;
    }>;
  }>;
  code: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface ReviewSummary {
  avgRating: number | null;
  reviewCount: number;
  photoCount: number;
}

export interface LocationDetails {
  openingHours?: string;
  images?: string[];
  rating?: number;
  tags?: string[];
  price?: 1 | 2 | 3 | 4;
  amenities?: string[];
  popularity?: number;
  moderationStatus?: "pending" | "approved" | "rejected";
  reviews?: Review[];
  reviewSummary?: ReviewSummary;
  userReview?: Review;
}

export interface LocationInputPayload {
  name: string;
  address: string;
  description?: string | null;
  lat: number;
  lng: number;
  images?: string[];
  details?: LocationDetails | string | null;
}

export interface StoreLocation {
  name: string;
  address: string;
  notes: string;
  latitude: number;
  longitude: number;
  openingHours?: string;
  images?: string[];
  rating?: number;
  tags?: string[];
  price?: 1 | 2 | 3 | 4; // 1: $, 2: $$, 3: $$$, 4: $$$$
  amenities?: string[];
  popularity?: number; // 0-100 for heatmap
  moderationStatus?: "pending" | "approved" | "rejected";
  reviews?: Review[];
  reviewSummary?: ReviewSummary;
  userReview?: Review;
  reviewPhotos?: string[];
}

export interface MapConfig {
  initialCenter: [number, number];
  initialZoom: number;
  clusterMaxZoom: number;
  clusterRadius: number;
}

export interface PopupProps {
  name: string;
  address: string;
  notes: string;
  coordinates: [number, number];
  isFavorite: boolean;
  openingHours?: string;
  images?: string[];
  rating?: number;
  reviewSummary?: ReviewSummary;
  userReview?: Review;
  reviewPhotos?: string[];
}

export interface RouteInfo {
  distanceKm: string;
  durationMin: number;
}
