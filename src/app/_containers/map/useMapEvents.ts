import mapboxgl from "mapbox-gl";
import { useEffect, type MutableRefObject } from "react";
import type * as GeoJSON from "geojson";

import { createPopupHTML } from "@/utils/mapPopupHelpers";
import { sanitizeStoreName } from "@/utils/mapHelpers";
import type { StoreData } from "./types";

interface UseMapEventsParams {
  mapRef: MutableRefObject<mapboxgl.Map | null>;
  isMapLoaded: boolean;
  filteredStores: StoreData[];
  isDesktop: boolean;
  isFavorite: (name: string) => boolean;
  toggleFavorite: (name: string) => void;
  userLocation: [number, number] | null;
  getUserLocation: () => void;
  addStopToRoute: (stop: StoreData) => void;
  handleClearRoute: () => void;
  setSelectedStore: (store: StoreData | null) => void;
  setIsSheetOpen: (open: boolean) => void;
  isAddLocationMode: boolean;
  setNewLocationCoordinates: (coords: [number, number] | null) => void;
  currentPopupRef: React.MutableRefObject<mapboxgl.Popup | null>;
}

export const useMapEvents = ({
  mapRef,
  isMapLoaded,
  filteredStores,
  isDesktop,
  isFavorite,
  toggleFavorite,
  userLocation,
  getUserLocation,
  addStopToRoute,
  handleClearRoute,
  setSelectedStore,
  setIsSheetOpen,
  isAddLocationMode,
  setNewLocationCoordinates,
  currentPopupRef,
}: UseMapEventsParams) => {
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const findStore = (name?: string): StoreData | undefined => {
      if (!name) return undefined;
      const sanitized = sanitizeStoreName(name);
      return filteredStores.find(
        (store) => sanitizeStoreName(store.name) === sanitized
      );
    };

    const handleClusterClick = (event: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0]?.properties?.cluster_id;

      if (clusterId !== undefined) {
        const source = map.getSource("stores") as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          const coordinates = (features[0]?.geometry as GeoJSON.Point)
            .coordinates;
          map.easeTo({
            center: [coordinates[0] || 0, coordinates[1] || 0],
            zoom: zoom ?? 14,
          });
        });
      }
    };

    const handleMarkerClick = (event: mapboxgl.MapMouseEvent) => {
      const coordinates = (
        event.features?.[0]?.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number];
      const { name, address, notes } = event.features?.[0]?.properties ?? {};

      const store =
        findStore(name) ??
        filteredStores.find((s) => s.name === (name as string | undefined));

      while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const storeData: StoreData = {
        name: (name as string) ?? "",
        address: (address as string) ?? "",
        notes: (notes as string) ?? "",
        coordinates,
        openingHours: store?.openingHours,
        rating: store?.rating,
        images: store?.images,
      };

      if (isDesktop) {
        if (currentPopupRef.current) {
          currentPopupRef.current.remove();
        }

        const popup = new mapboxgl.Popup({
          maxWidth: "320px",
          className: "custom-popup",
        })
          .setLngLat(coordinates)
          .setHTML(
            createPopupHTML({
              ...storeData,
              isFavorite: isFavorite(name ?? ""),
            })
          )
          .addTo(map);

        currentPopupRef.current = popup;

        const handleDirectionsClick = async () => {
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
                popup.setHTML(
                  createPopupHTML({
                    ...storeData,
                    isFavorite: isFavorite(name ?? ""),
                  })
                );
              });
            }
          }, 0);
        };

        const attachPopupListeners = () => {
          const sanitizedName = sanitizeStoreName(name ?? "");
          const favoriteBtn = document.getElementById(
            `favorite-btn-${sanitizedName}`
          );
          const directionsBtn = document.getElementById(
            `directions-btn-${sanitizedName}`
          );
          const shareBtn = document.getElementById(
            `share-btn-${sanitizedName}`
          );

          if (favoriteBtn) {
            favoriteBtn.addEventListener("click", () => {
              toggleFavorite(name ?? "");
              popup.setHTML(
                createPopupHTML({
                  ...storeData,
                  isFavorite: isFavorite(name ?? ""),
                })
              );
              setTimeout(attachPopupListeners, 0);
            });
          }

          if (directionsBtn) {
            directionsBtn.addEventListener("click", handleDirectionsClick);
          }

          if (shareBtn) {
            shareBtn.addEventListener("click", () => {
              const url = new URL(window.location.href);
              url.searchParams.set("store", (name as string) ?? "");
              navigator.clipboard.writeText(url.toString());
              alert("Link copied to clipboard!");
            });
          }
        };

        setTimeout(attachPopupListeners, 0);
      } else {
        if (currentPopupRef.current) {
          currentPopupRef.current.remove();
        }
        setSelectedStore(storeData);
        setIsSheetOpen(true);
      }
    };

    const handleMapClick = (event: mapboxgl.MapMouseEvent) => {
      if (isAddLocationMode) {
        const coordinates = [event.lngLat.lng, event.lngLat.lat] as [
          number,
          number,
        ];
        setNewLocationCoordinates(coordinates);
        setIsSheetOpen(true);
      }
    };

    map.on("click", "clusters", handleClusterClick);
    map.on("click", "unclustered-point", handleMarkerClick);
    map.on("click", handleMapClick);

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });

    map.getCanvas().style.cursor = isAddLocationMode ? "crosshair" : "";

    return () => {
      map.off("click", "clusters", handleClusterClick);
      map.off("click", "unclustered-point", handleMarkerClick);
      map.off("click", handleMapClick);
      map.getCanvas().style.cursor = "";
    };
  }, [
    isMapLoaded,
    mapRef,
    filteredStores,
    isDesktop,
    isFavorite,
    toggleFavorite,
    userLocation,
    getUserLocation,
    addStopToRoute,
    handleClearRoute,
    setSelectedStore,
    setIsSheetOpen,
    isAddLocationMode,
    setNewLocationCoordinates,
    currentPopupRef,
  ]);
};
