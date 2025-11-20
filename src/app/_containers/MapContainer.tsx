"use client";

import {
  MapStyles,
  RouteControlPanel,
  UserLocationButton,
} from "@/app/_components/Map";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFavoriteStores } from "@/hooks/useFavoriteStores";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMapRoute } from "@/hooks/useMapRoute";
import { useMapbox } from "@/hooks/useMapbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BEAR_STORES } from "@/utils/constants";
import { MAP_COLORS, MAP_CONFIG } from "@/utils/mapConstants";
import {
  createStoresGeoJSON,
  formatRouteInfo,
  sanitizeStoreName,
} from "@/utils/mapHelpers";
import { createPopupHTML, createRouteInfoHTML } from "@/utils/mapPopupHelpers";
import { cn } from "@/lib/utils";
import type * as GeoJSON from "geojson";
import mapboxgl from "mapbox-gl";
import { type FunctionComponent, useCallback, useEffect, useRef, useState } from "react";

interface StoreData {
  name: string;
  address: string;
  notes: string;
  coordinates: [number, number];
}

// Định nghĩa các loại bộ lọc có thể có
interface FilterState {
  showFavoritesOnly: boolean;
  // Có thể thêm các bộ lọc khác trong tương lai
  // isHighlyRated: boolean,
  // categoryFilter: string[],
  // và nhiều loại bộ lọc khác
}

const MapContainer: FunctionComponent = () => {
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Thêm state để quản lý các bộ lọc
  const [filters, setFilters] = useState<FilterState>({
    showFavoritesOnly: false,
  });
  // State để quản lý trạng thái mở/đóng của bộ lọc
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Custom hooks
  const { mapRef, mapContainerRef, isMapLoaded } = useMapbox(MAP_CONFIG);
  const {
    userLocation,
    getUserLocation,
    cleanup: cleanupGeolocation,
  } = useGeolocation(mapRef);
  const { favoriteStores, toggleFavorite, isFavorite } = useFavoriteStores();
  const { activeRoute, fetchRoute, displayRoute, clearRoute } =
    useMapRoute(mapRef);

  // Initialize user location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Lọc danh sách địa điểm dựa trên các bộ lọc hiện tại
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const getFilteredStores = useCallback(() => {
    let filteredStores = [...BEAR_STORES];

    if (filters.showFavoritesOnly) {
      filteredStores = filteredStores.filter((store) => isFavorite(store.name));
    }

    // Có thể thêm các điều kiện lọc khác trong tương lai

    return filteredStores;
  }, [filters, favoriteStores, isFavorite]);

  // Cập nhật dữ liệu trên bản đồ khi có thay đổi trong bộ lọc
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const map = mapRef.current;
    const filteredStores = getFilteredStores();
    const geojsonData = createStoresGeoJSON(filteredStores);

    // Cập nhật dữ liệu source nếu source đã tồn tại
    if (map.getSource("stores")) {
      const source = map.getSource("stores") as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);
    }
  }, [filters, favoriteStores, isMapLoaded, getFilteredStores, mapRef.current]); // Kích hoạt khi bộ lọc hoặc danh sách yêu thích thay đổi

  // Setup map layers and event handlers when map is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const map = mapRef.current;
    const filteredStores = getFilteredStores();
    const geojsonData = createStoresGeoJSON(filteredStores);

    // Add a GeoJSON source with clustering enabled
    if (!map.getSource("stores")) {
      map.addSource("stores", {
        type: "geojson",
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: MAP_CONFIG.clusterMaxZoom,
        clusterRadius: MAP_CONFIG.clusterRadius,
      });
    }

    // Add layer for clusters
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "stores",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          MAP_COLORS.CLUSTER_SMALL,
          10,
          MAP_COLORS.CLUSTER_MEDIUM,
          30,
          MAP_COLORS.CLUSTER_LARGE,
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
      },
    });

    // Add layer for cluster count labels
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "stores",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    // Add layer for unclustered points
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "stores",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": MAP_COLORS.MARKER,
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": MAP_COLORS.MARKER_STROKE,
      },
    });

    // Handle cluster click - zoom in
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
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

    // Handle marker click - show popup (desktop) or sheet (mobile)
    const handleMarkerClick = (e: mapboxgl.MapMouseEvent) => {
      const coordinates = (
        e.features?.[0]?.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number];
      const { name, address, notes } = e.features?.[0]?.properties ?? {};

      // Ensure popup appears over the correct copy of the feature
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const storeData: StoreData = {
        name: name ?? "",
        address: address ?? "",
        notes: notes ?? "",
        coordinates,
      };

      if (isDesktop) {
        // Show Mapbox Popup on desktop
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

        // Handle directions click
        const handleDirectionsClick = async () => {
          if (!userLocation) {
            alert("Please enable location services to get directions");
            getUserLocation();
            return;
          }

          clearRoute();
          const route = await fetchRoute(userLocation, coordinates);

          if (route) {
            displayRoute(route);
            const { distanceKm, durationMin } = formatRouteInfo(
              route.distance,
              route.duration
            );
            const routeInfoHTML = createRouteInfoHTML(distanceKm, durationMin);

            const currentHTML =
              popup.getElement()?.querySelector(".mapboxgl-popup-content")
                ?.innerHTML ?? "";
            const updatedHTML = `${
              currentHTML.replace(
                /<div style="[^"]*margin-top: 12px[^"]*">[\s\S]*?<\/div>\s*<\/div>\s*$/,
                "</div>"
              ) + routeInfoHTML.replace("</div>", "")
            }</div>`;
            popup.setHTML(updatedHTML);

            // Add clear route button listener
            setTimeout(() => {
              const clearBtn = document.getElementById("clear-route-btn");
              if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                  clearRoute();
                  popup.setHTML(
                    createPopupHTML({
                      ...storeData,
                      isFavorite: isFavorite(name ?? ""),
                    })
                  );
                });
              }
            }, 0);
          }
        };

        // Attach event listeners to popup buttons
        const attachPopupListeners = () => {
          const sanitizedName = sanitizeStoreName(name ?? "");
          const favoriteBtn = document.getElementById(
            `favorite-btn-${sanitizedName}`
          );
          const directionsBtn = document.getElementById(
            `directions-btn-${sanitizedName}`
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
        };

        setTimeout(attachPopupListeners, 0);
      } else {
        // Show Bottom Sheet on mobile
        if (currentPopupRef.current) {
          currentPopupRef.current.remove();
        }
        setSelectedStore(storeData);
        setIsSheetOpen(true);
      }
    };

    // Change cursor to pointer when hovering over clusters
    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });

    // Change cursor to pointer when hovering over unclustered points
    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });

    // Attach event listeners
    map.on("click", "clusters", handleClusterClick);
    map.on("click", "unclustered-point", handleMarkerClick);

    // Cleanup
    return () => {
      cleanupGeolocation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isMapLoaded,
    isFavorite,
    toggleFavorite,
    getUserLocation,
    userLocation,
    fetchRoute,
    displayRoute,
    clearRoute,
    cleanupGeolocation,
    isDesktop,
    mapRef.current,
	getFilteredStores
  ]);

  const handleDirectionsFromSheet = async () => {
    if (!selectedStore) return;

    if (!userLocation) {
      alert("Please enable location services to get directions");
      getUserLocation();
      return;
    }

    clearRoute();
    const route = await fetchRoute(userLocation, selectedStore.coordinates);

    if (route) {
      displayRoute(route);
      setIsSheetOpen(false);
    }
  };

  // Toggle bộ lọc "Hiển thị chỉ địa điểm đã lưu"
  const toggleFavoritesFilter = () => {
    setFilters((prev) => ({
      ...prev,
      showFavoritesOnly: !prev.showFavoritesOnly,
    }));
  };

  // Toggle trạng thái mở/đóng của bộ lọc
  const toggleFilterPanel = () => {
    setIsFilterOpen((prev) => !prev);
  };

  return (
    <div className="h-full relative">
      <div className="w-full h-full" id="map-container" ref={mapContainerRef} />

      {/* Filter Button và Panel */}
      <div
        className={cn(
          "absolute transition-all duration-300 z-10 shadow-lg",
          isMobile
            ? "bottom-20 left-1/2 transform -translate-x-1/2"
            : "top-4 right-4"
        )}
      >
        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={toggleFilterPanel}
          className={cn(
            "flex items-center justify-center bg-white p-3 rounded-full shadow-md",
            isMobile ? "w-12 h-12" : "w-10 h-10",
            isFilterOpen && "bg-primary text-white"
          )}
          aria-label="Toggle Filters"
        >
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>

        {/* Filter Panel */}
        <div
          className={cn(
            "bg-white rounded-lg overflow-hidden transition-all duration-300 origin-top-right",
            isFilterOpen
              ? isMobile
                ? "fixed left-0 right-0 bottom-0 rounded-t-lg p-5 z-50"
                : "absolute mt-2 right-0 min-w-[250px] opacity-100 scale-100 p-4"
              : "absolute mt-2 right-0 min-w-[250px] opacity-0 scale-95 pointer-events-none p-4"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-lg">Bộ lọc địa điểm</h3>
            {isMobile && (
              <button
                type="button"
                onClick={toggleFilterPanel}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
              <div className="flex items-center h-5">
                <input
                  id="favorite-filter"
                  type="checkbox"
                  checked={filters.showFavoritesOnly}
                  onChange={toggleFavoritesFilter}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="favorite-filter"
                  className="font-medium text-gray-900 cursor-pointer"
                >
                  Chỉ hiển thị đã lưu
                </label>
                <p className="text-gray-500 text-sm">
                  {filters.showFavoritesOnly
                    ? `Đang hiển thị ${
                        getFilteredStores().length
                      } địa điểm đã lưu`
                    : "Hiển thị tất cả địa điểm"}
                </p>
              </div>
            </div>

            {/* Vị trí dành cho các filter khác trong tương lai */}
            {/* 
						<div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
							<div className="flex items-center h-5">
								<input
									id="rated-filter"
									type="checkbox"
									className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
								/>
							</div>
							<div className="flex flex-col">
								<label htmlFor="rated-filter" className="font-medium text-gray-900 cursor-pointer">
									Được đánh giá cao
								</label>
								<p className="text-gray-500 text-sm">
									Chỉ hiển thị địa điểm có đánh giá từ 4 sao trở lên
								</p>
							</div>
						</div>
						*/}

            {isMobile && (
              <button
                type="button"
                onClick={toggleFilterPanel}
                className="w-full py-2.5 px-4 mt-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none"
              >
                Áp dụng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Route Control Panel */}
      {activeRoute && (
        <RouteControlPanel route={activeRoute} onClear={clearRoute} />
      )}

      {/* User Location Button */}
      <UserLocationButton onClick={getUserLocation} isVisible={!userLocation} />

      {/* Map Styles */}
      <MapStyles />

      {/* Bottom Sheet for Mobile */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-auto">
          {selectedStore && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedStore.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-sm text-gray-900">
                    {selectedStore.address}
                  </p>
                </div>
                {selectedStore.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-sm text-gray-900">
                      {selectedStore.notes}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      toggleFavorite(selectedStore.name);
                      setSelectedStore({
                        ...selectedStore,
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    {isFavorite(selectedStore.name)
                      ? "★ Favorited"
                      : "☆ Add to Favorites"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectionsFromSheet}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Backdrop overlay for mobile filter panel */}
      {isFilterOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={toggleFilterPanel}
        ></div>
      )}
    </div>
  );
};

export default MapContainer;
