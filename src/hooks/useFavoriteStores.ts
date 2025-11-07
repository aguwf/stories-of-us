import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'favoriteStores';

/**
 * Hook to manage favorite stores with localStorage persistence
 */
export const useFavoriteStores = () => {
  const [favoriteStores, setFavoriteStores] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(STORAGE_KEY);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites) as string[];
        setFavoriteStores(new Set(parsed));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Toggle favorite store
  const toggleFavorite = useCallback((storeName: string) => {
    setFavoriteStores((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(storeName)) {
        newSet.delete(storeName);
      } else {
        newSet.add(storeName);
      }
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  // Check if a store is favorite
  const isFavorite = useCallback(
    (storeName: string) => favoriteStores.has(storeName),
    [favoriteStores]
  );

  return {
    favoriteStores,
    toggleFavorite,
    isFavorite,
  };
};

