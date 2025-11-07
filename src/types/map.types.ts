export interface RouteData {
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
}

export interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: number[][];
      type: string;
    };
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction: string;
        };
        distance: number;
        duration: number;
      }>;
    }>;
  }>;
  code: string;
}

export interface StoreLocation {
  name: string;
  address: string;
  notes: string;
  latitude: number;
  longitude: number;
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
}

export interface RouteInfo {
  distanceKm: string;
  durationMin: number;
}

