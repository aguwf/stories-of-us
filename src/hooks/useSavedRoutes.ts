import { useCallback, useEffect, useState } from "react";

import type { RouteStop } from "@/types/map.types";

type SavedRouteType = "multi-stop" | "collection";

export interface ShareableRoute {
  name: string;
  stops: RouteStop[];
  type: SavedRouteType;
  distanceKm?: string;
  durationMin?: number;
}

export interface SavedRoute extends ShareableRoute {
  id: string;
  createdAt: string;
}

const STORAGE_KEY = "stories-of-us:saved-routes";

const encodePayload = (route: ShareableRoute) => {
  const payload = JSON.stringify({
    ...route,
    stops: route.stops.map((stop) => ({
      name: stop.name,
      address: stop.address,
      notes: stop.notes,
      coordinates: stop.coordinates,
    })),
  });

  // Ensure UTF-8 safety for clipboard/URL
  return btoa(unescape(encodeURIComponent(payload)));
};

const decodePayload = (token: string): ShareableRoute | null => {
  try {
    const parsed = JSON.parse(
      decodeURIComponent(escape(atob(token)))
    ) as ShareableRoute;
    if (!parsed?.stops?.length) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to decode shared route:", error);
    return null;
  }
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}`;
};

export const useSavedRoutes = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SavedRoute[];
      setSavedRoutes(parsed);
    } catch (error) {
      console.error("Failed to read saved routes:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  const saveRoute = useCallback((route: ShareableRoute) => {
    setSavedRoutes((prev) => {
      const next: SavedRoute = {
        ...route,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      return [...prev, next];
    });
  }, []);

  const deleteRoute = useCallback((id: string) => {
    setSavedRoutes((prev) => prev.filter((route) => route.id !== id));
  }, []);

  const shareRoute = useCallback((route: ShareableRoute) => {
    if (typeof window === "undefined") return null;
    const token = encodePayload(route);
    const url = new URL(window.location.href);
    url.searchParams.set("route", token);
    navigator.clipboard.writeText(url.toString());
    return url.toString();
  }, []);

  const decodeSharedRoute = useCallback((token: string) => {
    return decodePayload(token);
  }, []);

  return {
    savedRoutes,
    saveRoute,
    deleteRoute,
    shareRoute,
    decodeSharedRoute,
  };
};
