import { useMemo } from "react";

import { calculateDistance } from "@/utils/mapHelpers";
import type { StoreData } from "./types";

interface UseFilteredStoresParams {
  userLocation: [number, number] | null;
  searchQuery: string;
  showFavoritesOnly: boolean;
  isFavorite: (name: string) => boolean;
  sortBy: "name" | "distance";
  searchRadius: number;
  selectedTags: string[];
  priceRange: number[];
  customStores: StoreData[];
  favoriteStores: Set<string>;
  stores: StoreData[];
}

export const useFilteredStores = ({
  userLocation,
  searchQuery,
  showFavoritesOnly,
  isFavorite,
  sortBy,
  searchRadius,
  selectedTags,
  priceRange,
  customStores,
  favoriteStores,
  stores,
}: UseFilteredStoresParams) => {
  return useMemo<StoreData[]>(() => {
    const allStores = [...stores, ...customStores];

    let filteredStores = allStores.map((store) => {
      const storeData: StoreData = {
        ...store,
      };

      if (userLocation) {
        const dist = calculateDistance(
          userLocation[1],
          userLocation[0],
          store.coordinates[1],
          store.coordinates[0]
        );
        storeData.distance = `${dist.toFixed(1)} km`;
      }

      return storeData;
    });

    if (userLocation) {
      filteredStores = filteredStores.filter((store) => {
        if (!store.distance) return true;
        const dist = Number.parseFloat(store.distance.split(" ")[0] ?? "0");
        return dist <= searchRadius;
      });
    }

    if (showFavoritesOnly) {
      const favoriteLookup = new Set(favoriteStores);
      filteredStores = filteredStores.filter(
        (store) => favoriteLookup.has(store.name) || isFavorite(store.name)
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStores = filteredStores.filter(
        (store) =>
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query) ||
          store.notes.toLowerCase().includes(query)
      );
    }

    if (selectedTags.length > 0) {
      filteredStores = filteredStores.filter((store) =>
        store.tags?.some((tag) => selectedTags.includes(tag))
      );
    }

    if (priceRange.length > 0) {
      filteredStores = filteredStores.filter(
        (store) => store.price && priceRange.includes(store.price)
      );
    }

    filteredStores.sort((a, b) => {
      if (sortBy === "distance" && userLocation) {
        const distA = Number.parseFloat(a.distance?.split(" ")[0] ?? "0");
        const distB = Number.parseFloat(b.distance?.split(" ")[0] ?? "0");
        return distA - distB;
      }
      return a.name.localeCompare(b.name);
    });

    return filteredStores;
  }, [
    userLocation,
    searchQuery,
    showFavoritesOnly,
    isFavorite,
    sortBy,
    searchRadius,
    selectedTags,
    priceRange,
    customStores,
    favoriteStores,
  ]);
};
