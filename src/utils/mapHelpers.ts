import type { RouteInfo, StoreLocation } from "@/types/map.types";
import type * as GeoJSON from "geojson";

/**
 * Format route distance and duration for display
 */
export const formatRouteInfo = (
  distance: number,
  duration: number
): RouteInfo => ({
  distanceKm: (distance / 1000).toFixed(1),
  durationMin: Math.round(duration / 60),
});

/**
 * Convert store data to GeoJSON FeatureCollection
 */
export const createStoresGeoJSON = (
  stores: StoreLocation[]
): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
  type: "FeatureCollection",
  features: stores.map((store) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [store.longitude, store.latitude],
    },
    properties: {
      name: store.name,
      address: store.address,
      notes: store.notes,
    },
  })),
});

/**
 * Sanitize store name for use as HTML ID
 */
export const sanitizeStoreName = (name: string): string => {
  return name.replace(/\s+/g, "-");
};

/**
 * Create user location marker element
 */
export const createUserLocationMarkerElement = (): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "user-location-marker";
  el.style.width = "20px";
  el.style.height = "20px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = "#4285F4";
  el.style.border = "3px solid white";
  el.style.boxShadow = "0 0 10px rgba(66, 133, 244, 0.5)";
  return el;
};

/**
 * Calculate distance between two points in km using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
