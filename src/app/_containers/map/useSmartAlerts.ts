import { useCallback, useEffect, useRef } from "react";

import { calculateDistance, sanitizeStoreName } from "@/utils/mapHelpers";
import type { StoreData } from "./types";

type SmartAlertParams = {
  userLocation: [number, number] | null;
  favoriteStores: Set<string>;
  stores: StoreData[];
  selectedTags: string[];
  searchRadiusKm: number;
  smartAlertsEnabled: boolean;
  followAlertsEnabled: boolean;
};

const TAG_SEEN_STORAGE_KEY = "stories-of-us:tag-alerts";
const NEARBY_ALERT_COOLDOWN_MS = 1000 * 60 * 30; // 30 minutes

const normalizeDateValue = (value: unknown) => {
  if (!value) return null;
  try {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return new Date(value).toISOString();
    return null;
  } catch {
    return null;
  }
};

const buildStoreLink = (storeName: string) => {
  if (typeof window === "undefined") return "/";
  const url = new URL(window.location.href);
  url.searchParams.set("store", storeName);
  return url.toString();
};

export const useSmartAlerts = ({
  userLocation,
  favoriteStores,
  stores,
  selectedTags,
  searchRadiusKm,
  smartAlertsEnabled,
  followAlertsEnabled,
}: SmartAlertParams) => {
  const tagSeenRef = useRef<Record<string, Set<number>>>({});
  const tagsKeyRef = useRef<string | null>(null);
  const favoriteSnapshotRef = useRef<Map<string | number, string | null>>(
    new Map()
  );
  const hasBootstrappedFavoritesRef = useRef(false);
  const nearAlertCooldownRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(TAG_SEEN_STORAGE_KEY);
      if (!raw) {
        tagSeenRef.current = {};
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, number[]>;
      tagSeenRef.current = Object.fromEntries(
        Object.entries(parsed).map(([key, ids]) => [key, new Set(ids)])
      );
    } catch (error) {
      console.error("Failed to read tag alerts cache", error);
      tagSeenRef.current = {};
    }
  }, []);

  useEffect(() => {
    if (followAlertsEnabled) return;
    favoriteSnapshotRef.current.clear();
    hasBootstrappedFavoritesRef.current = false;
  }, [followAlertsEnabled]);

  const persistTagSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = Object.fromEntries(
        Object.entries(tagSeenRef.current).map(([key, ids]) => [
          key,
          Array.from(ids),
        ])
      );
      localStorage.setItem(TAG_SEEN_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to persist tag alerts cache", error);
    }
  }, []);

  const showNotification = useCallback(
    async (title: string, body: string, url?: string) => {
      if (typeof window === "undefined") return;
      if (!("Notification" in window) || !navigator.serviceWorker) return;

      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
      }

      if (Notification.permission !== "granted") return;

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: "/android-chrome-192x192.png",
          badge: "/favicon-32x32.png",
          data: url,
        });
      } catch (error) {
        console.error("Failed to show notification", error);
      }
    },
    []
  );

  // Nearby favorite geofence alerts
  useEffect(() => {
    if (
      !smartAlertsEnabled ||
      !userLocation ||
      favoriteStores.size === 0 ||
      stores.length === 0
    ) {
      return;
    }

    const maxRadiusKm = Math.max(0.25, Math.min(searchRadiusKm, 10));
    const now = Date.now();

    stores
      .filter((store) => favoriteStores.has(store.name))
      .forEach((store) => {
        const [lng, lat] = store.coordinates;
        const distanceKm = calculateDistance(
          userLocation[1],
          userLocation[0],
          lat,
          lng
        );

        if (distanceKm > maxRadiusKm) return;

        const lastPing = nearAlertCooldownRef.current.get(store.name) ?? 0;
        if (now - lastPing < NEARBY_ALERT_COOLDOWN_MS) return;

        nearAlertCooldownRef.current.set(store.name, now);
        void showNotification(
          "You're near a saved spot",
          `${store.name} is just ${distanceKm.toFixed(1)} km away.`,
          buildStoreLink(store.name)
        );
      });
  }, [
    smartAlertsEnabled,
    userLocation,
    favoriteStores,
    stores,
    searchRadiusKm,
    showNotification,
  ]);

  // New place in followed tags
  useEffect(() => {
    if (
      !smartAlertsEnabled ||
      selectedTags.length === 0 ||
      stores.length === 0
    ) {
      return;
    }

    const tagsKey = selectedTags.slice().sort().join("|");
    const seenForTags =
      tagSeenRef.current[tagsKey] ?? new Set<number>();

    const matching = stores.filter(
      (store) =>
        store.id !== undefined &&
        store.tags?.some((tag) => selectedTags.includes(tag))
    );

    // When tags change, bootstrap without notifying to avoid spamming
    if (tagsKeyRef.current !== tagsKey) {
      tagsKeyRef.current = tagsKey;
      matching.forEach((store) => {
        if (store.id !== undefined) {
          seenForTags.add(store.id);
        }
      });
      tagSeenRef.current[tagsKey] = seenForTags;
      persistTagSeen();
      return;
    }

    matching.forEach((store) => {
      if (store.id === undefined || seenForTags.has(store.id)) return;
      seenForTags.add(store.id);
      tagSeenRef.current[tagsKey] = seenForTags;
      void showNotification(
        "New place in your tags",
        `${store.name} matches your interests.`,
        buildStoreLink(store.name)
      );
    });

    persistTagSeen();
  }, [
    smartAlertsEnabled,
    selectedTags,
    stores,
    persistTagSeen,
    showNotification,
  ]);

  // Follow alerts for favorite updates
  useEffect(() => {
    if (!followAlertsEnabled || favoriteStores.size === 0 || stores.length === 0)
      return;

    const favoriteList = stores.filter((store) =>
      favoriteStores.has(store.name)
    );

    if (!hasBootstrappedFavoritesRef.current) {
      favoriteList.forEach((store) => {
        const key = store.id ?? sanitizeStoreName(store.name);
        favoriteSnapshotRef.current.set(
          key,
          normalizeDateValue((store as { updatedAt?: unknown }).updatedAt)
        );
      });
      hasBootstrappedFavoritesRef.current = true;
      return;
    }

    favoriteList.forEach((store) => {
      const key = store.id ?? sanitizeStoreName(store.name);
      const latest = normalizeDateValue(
        (store as { updatedAt?: unknown }).updatedAt
      );
      const previous = favoriteSnapshotRef.current.get(key);

      if (previous && latest && latest !== previous) {
        void showNotification(
          "Favorite updated",
          `${store.name} has new details.`,
          buildStoreLink(store.name)
        );
      }

      favoriteSnapshotRef.current.set(key, latest ?? previous ?? null);
    });
  }, [
    followAlertsEnabled,
    favoriteStores,
    stores,
    showNotification,
  ]);
};
