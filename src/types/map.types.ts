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
  date: string;
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

  // New fields
  tags?: string[];
  price?: 1 | 2 | 3 | 4; // 1: $, 2: $$, 3: $$$, 4: $$$$
  amenities?: string[];
  popularity?: number; // 0-100 for heatmap
  moderationStatus?: "pending" | "approved" | "rejected";
  reviews?: Review[];
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
}

export interface RouteInfo {
  distanceKm: string;
  durationMin: number;
}
