import mapboxgl from "mapbox-gl";

import { sanitizeStoreName } from "@/utils/mapHelpers";
import { createPopupHTML } from "@/utils/mapPopupHelpers";
import type { StoreData } from "./types";

interface CreateInteractivePopupOptions {
  map: mapboxgl.Map;
  storeData: StoreData;
  isFavorite: (name: string) => boolean;
  toggleFavorite: (name: string) => void;
  userLocation: [number, number] | null;
  getUserLocation: () => void;
  addStopToRoute: (stop: StoreData) => void;
  handleClearRoute: () => void;
  onShare?: (store: StoreData) => void;
}

/**
 * Render a popup for a store and wire up all interactive controls.
 */
export const createInteractivePopup = ({
  map,
  storeData,
  isFavorite,
  toggleFavorite,
  userLocation,
  getUserLocation,
  addStopToRoute,
  handleClearRoute,
  onShare,
}: CreateInteractivePopupOptions) => {
  const popup = new mapboxgl.Popup({
    maxWidth: "320px",
    className: "custom-popup",
  })
    .setLngLat(storeData.coordinates)
    .addTo(map);

  const renderPopup = () => {
    popup.setHTML(
      createPopupHTML({
        ...storeData,
        isFavorite: isFavorite(storeData.name),
      })
    );
    setTimeout(attachPopupListeners, 0);
  };

  const handleDirectionsClick = () => {
    if (!userLocation) {
      alert("Please enable location services to get directions");
      getUserLocation();
      return;
    }

    addStopToRoute(storeData);

    setTimeout(() => {
      const clearBtn = document.getElementById("clear-route-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          handleClearRoute();
          renderPopup();
        });
      }
    }, 0);
  };

  const attachPopupListeners = () => {
    const sanitizedName = sanitizeStoreName(storeData.name);
    const favoriteBtn = document.getElementById(`favorite-btn-${sanitizedName}`);
    const directionsBtn = document.getElementById(
      `directions-btn-${sanitizedName}`
    );
    const shareBtn = document.getElementById(`share-btn-${sanitizedName}`);

    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", () => {
        toggleFavorite(storeData.name);
        renderPopup();
      });
    }

    if (directionsBtn) {
      directionsBtn.addEventListener("click", handleDirectionsClick);
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        if (onShare) {
          onShare(storeData);
          return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set("store", storeData.name);
        navigator.clipboard.writeText(url.toString());
        alert("Link copied to clipboard!");
      });
    }
  };

  renderPopup();

  return popup;
};
