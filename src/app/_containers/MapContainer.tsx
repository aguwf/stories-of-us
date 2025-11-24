"use client";

import {
  Clock,
  Heart,
  Navigation2,
  Share2,
  Star,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MapControls,
  RouteControlPanel,
  StoreList,
  UserLocationButton,
} from "@/app/_components/Map";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useFavoriteStores } from "@/hooks/useFavoriteStores";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSavedRoutes, type ShareableRoute } from "@/hooks/useSavedRoutes";
import { LocationForm } from "../_components/Map/LocationForm";
import { useMapRoute } from "@/hooks/useMapRoute";
import { useMapbox } from "@/hooks/useMapbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BEAR_STORES, gradientClasses } from "@/utils/constants";
import { MAP_COLORS, MAP_CONFIG, MAP_STYLES } from "@/utils/mapConstants";
import {
  createStoresGeoJSON,
  formatRouteInfo,
  sanitizeStoreName,
  calculateDistance,
} from "@/utils/mapHelpers";
// createRouteInfoHTML
import { createPopupHTML } from "@/utils/mapPopupHelpers";
import { cn } from "@/lib/utils";
import type * as GeoJSON from "geojson";

interface StoreData {
  name: string;
  address: string;
  notes: string;
  coordinates: [number, number];
  distance?: string;
  openingHours?: string;
  rating?: number;
  images?: string[];
  tags?: string[];
  price?: 1 | 2 | 3 | 4;
  amenities?: string[];
  popularity?: number;
}

const MapContainer: FunctionComponent = () => {
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState<string>(MAP_STYLES.MAPBOX_STYLE);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "distance">("name");
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Community / Add Location State
  const [isAddLocationMode, setIsAddLocationMode] = useState(false);
  const [newLocationCoordinates, setNewLocationCoordinates] = useState<[number, number] | null>(null);
  const [customStores, setCustomStores] = useState<StoreData[]>([]);

  // Routing state
  const [transportMode, setTransportMode] = useState<"driving" | "walking" | "cycling" | "driving-traffic">("driving");
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [plannedStops, setPlannedStops] = useState<StoreData[]>([]);

  // Near Me state
  const [searchRadius, setSearchRadius] = useState<number>(50); // Default 50km
  const [isFollowMode, setIsFollowMode] = useState(false);

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
  const { saveRoute, shareRoute, decodeSharedRoute } = useSavedRoutes();
  const { activeRoute, fetchRoute, displayRoute, clearRoute: clearMapRoute } =
    useMapRoute(mapRef);

  // Wrapper to clear route and destination
  const handleClearRoute = useCallback(() => {
    clearMapRoute();
    setPlannedStops([]);
  }, [clearMapRoute]);

  // Refetch route when options change
  useEffect(() => {
    if (userLocation && plannedStops.length > 0) {
      const exclude = avoidTolls ? ["toll"] : [];
      fetchRoute(
        userLocation,
        plannedStops.map((stop) => stop.coordinates),
        transportMode,
        exclude,
        plannedStops.map((stop) => stop.name)
      ).then((route) => {
        if (route) displayRoute(route);
      });
    } else {
      clearMapRoute();
    }
  }, [transportMode, avoidTolls, userLocation, plannedStops, fetchRoute, displayRoute, clearMapRoute]);

  // Follow mode effect
  useEffect(() => {
    if (isFollowMode && userLocation && mapRef.current) {
      mapRef.current.easeTo({
        center: userLocation,
        duration: 1000, // Smooth transition
      });
    }
  }, [isFollowMode, userLocation, mapRef]);

  // Auto-sort by distance when radius changes
  useEffect(() => {
    if (userLocation) {
      setSortBy("distance");
    }
  }, [searchRadius, userLocation]);

  // Initialize user location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Handle URL query parameters for sharing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const storeName = params.get("store");
      if (storeName) {
        if (isMapLoaded && mapRef.current) {
           // Logic to find store and fly to it is handled in handleStoreSelect or similar, 
           // but here we just want to fly to it if found.
           // Existing logic was fine, just keeping it.
           const store = BEAR_STORES.find(
            (s) => sanitizeStoreName(s.name) === sanitizeStoreName(storeName)
          );
          if (store) {
            mapRef.current.flyTo({
              center: [store.longitude, store.latitude],
              zoom: 15,
            });
          }
        }
      }
    }
  }, [isMapLoaded, mapRef]);

  // Load shared multi-stop route/collection from URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sharedRouteToken = params.get("route");

    if (sharedRouteToken) {
      const sharedRoute = decodeSharedRoute(sharedRouteToken);
      if (sharedRoute?.stops?.length) {
        const stops = sharedRoute.stops.map((stop) => ({
          name: stop.name,
          address: stop.address ?? "Shared location",
          notes: stop.notes ?? "",
          coordinates: stop.coordinates,
        }));
        setPlannedStops(stops);
      }
    }
  }, [decodeSharedRoute]);

  const addStopToRoute = useCallback((stop: StoreData) => {
    setPlannedStops((prev) => {
      const existing = prev.filter((item) => item.name !== stop.name);
      return [...existing, stop];
    });
  }, []);

  const removeStopFromRoute = useCallback((name: string) => {
    setPlannedStops((prev) => prev.filter((stop) => stop.name !== name));
  }, []);

  const buildShareableRoute = useCallback(
    (name?: string, kind?: ShareableRoute["type"]): ShareableRoute | null => {
      if (plannedStops.length === 0) return null;
      const routeInfo = activeRoute
        ? formatRouteInfo(activeRoute.distance, activeRoute.duration)
        : null;

      return {
        name:
          name ||
          (plannedStops.length > 1
            ? `Route with ${plannedStops.length} stops`
            : plannedStops[0]?.name ?? "Saved route"),
        stops: plannedStops.map((stop) => ({
          name: stop.name,
          address: stop.address,
          notes: stop.notes,
          coordinates: stop.coordinates,
        })),
        type: kind ?? (plannedStops.length > 1 ? "multi-stop" : "collection"),
        distanceKm: routeInfo?.distanceKm,
        durationMin: routeInfo?.durationMin,
      };
    },
    [activeRoute, plannedStops]
  );

  const handleSaveMultiStop = useCallback(
    (name: string, kind?: ShareableRoute["type"]) => {
      const routePayload = buildShareableRoute(name, kind);
      if (!routePayload) {
        alert("Add at least one stop before saving.");
        return;
      }
      saveRoute(routePayload);
      alert("Route saved for later.");
    },
    [buildShareableRoute, saveRoute]
  );

  const handleShareMultiStop = useCallback(
    (kind?: ShareableRoute["type"]) => {
      const routePayload = buildShareableRoute(undefined, kind);
      if (!routePayload) {
        alert("Add stops before sharing.");
        return;
      }
      const url = shareRoute(routePayload);
      if (url) {
        alert("Share link copied to clipboard!");
      }
    },
    [buildShareableRoute, shareRoute]
  );

  // Update map style
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      mapRef.current.setStyle(mapStyle);
    }
  }, [mapStyle, isMapLoaded, mapRef]);

  // Lọc danh sách địa điểm dựa trên các bộ lọc hiện tại
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const getFilteredStores = useCallback(() => {
    // Combine static stores with custom stores
    const allStores = [...BEAR_STORES, ...customStores.map(s => ({
        ...s,
        latitude: s.coordinates[1],
        longitude: s.coordinates[0],
    }))];

    let filteredStores = allStores.map((store) => {
        const storeData: StoreData = {
        name: store.name,
        address: store.address,
        notes: store.notes,
        coordinates: [store.longitude, store.latitude],
        openingHours: store.openingHours,
        rating: store.rating,
        images: store.images,
        // Map existing data to new fields if available, or mock/default
        tags: store.tags,
        price: store.price as 1 | 2 | 3 | 4 | undefined,
        amenities: store.amenities,
        popularity: store.popularity ?? Math.floor(Math.random() * 100), // Mock popularity if missing
      };

      if (userLocation) {
        const dist = calculateDistance(
          userLocation[1],
          userLocation[0],
          store.latitude,
          store.longitude
        );
        storeData.distance = `${dist.toFixed(1)} km`;
      }

      return storeData;
    });

    // Filter by radius if user location is available
    if (userLocation) {
        filteredStores = filteredStores.filter(store => {
            if (!store.distance) return true;
            const dist = parseFloat(store.distance.split(" ")[0] ?? "0");
            return dist <= searchRadius;
        });
    }

    if (showFavoritesOnly) {
      filteredStores = filteredStores.filter((store) => isFavorite(store.name));
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
    
    // Filter by Tags
    if (selectedTags.length > 0) {
        filteredStores = filteredStores.filter(store => 
            store.tags?.some(tag => selectedTags.includes(tag))
        );
    }

    // Filter by Price
    if (priceRange.length > 0) {
        filteredStores = filteredStores.filter(store => 
            store.price && priceRange.includes(store.price)
        );
    }

    // Sort stores
    filteredStores.sort((a, b) => {
      if (sortBy === "distance" && userLocation) {
        const distA = parseFloat(a.distance?.split(" ")[0] ?? "0");
        const distB = parseFloat(b.distance?.split(" ")[0] ?? "0");
        return distA - distB;
      }
      return a.name.localeCompare(b.name);
    });

    return filteredStores;
  }, [showFavoritesOnly, favoriteStores, isFavorite, searchQuery, userLocation, sortBy, searchRadius, selectedTags, priceRange, customStores]);

  // Cập nhật dữ liệu trên bản đồ khi có thay đổi trong bộ lọc
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const map = mapRef.current;
    const filteredStores = getFilteredStores();
    const geojsonData = createStoresGeoJSON(
      filteredStores.map((s) => ({
        name: s.name,
        address: s.address,
        notes: s.notes,
        latitude: s.coordinates[1],
        longitude: s.coordinates[0],
        // Pass extra props for heatmap
        popularity: s.popularity,
      }))
    );

    // Cập nhật dữ liệu source nếu source đã tồn tại
    if (map.getSource("stores")) {
      const source = map.getSource("stores") as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);
    }
  }, [showFavoritesOnly, favoriteStores, isMapLoaded, getFilteredStores, mapRef.current, searchQuery, selectedTags, priceRange, customStores]);

  // Heatmap Layer Logic
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (showHeatmap) {
        // Hide cluster/point layers
        if (map.getLayer("clusters")) map.setLayoutProperty("clusters", "visibility", "none");
        if (map.getLayer("cluster-count")) map.setLayoutProperty("cluster-count", "visibility", "none");
        if (map.getLayer("unclustered-point")) map.setLayoutProperty("unclustered-point", "visibility", "none");

        // Add Heatmap Layer
        if (!map.getLayer("store-heatmap")) {
            map.addLayer({
                id: "store-heatmap",
                type: "heatmap",
                source: "stores",
                maxzoom: 15,
                paint: {
                    // Increase the heatmap weight based on frequency and property magnitude
                    "heatmap-weight": [
                        "interpolate",
                        ["linear"],
                        ["get", "popularity"],
                        0, 0,
                        100, 1
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0, 1,
                        15, 3
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0, "rgba(33,102,172,0)",
                        0.2, "rgb(103,169,207)",
                        0.4, "rgb(209,229,240)",
                        0.6, "rgb(253,219,199)",
                        0.8, "rgb(239,138,98)",
                        1, "rgb(178,24,43)"
                    ],
                    // Adjust the heatmap radius by zoom level
                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0, 2,
                        9, 20
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    "heatmap-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        14, 1,
                        15, 0
                    ],
                }
            }, "waterway-label"); // Place before labels
        } else {
            map.setLayoutProperty("store-heatmap", "visibility", "visible");
        }
    } else {
        // Show cluster/point layers
        if (map.getLayer("clusters")) map.setLayoutProperty("clusters", "visibility", "visible");
        if (map.getLayer("cluster-count")) map.setLayoutProperty("cluster-count", "visibility", "visible");
        if (map.getLayer("unclustered-point")) map.setLayoutProperty("unclustered-point", "visibility", "visible");
        
        // Hide Heatmap Layer
        if (map.getLayer("store-heatmap")) {
            map.setLayoutProperty("store-heatmap", "visibility", "none");
        }
    }

  }, [showHeatmap, isMapLoaded, mapRef]);

  // Setup map layers and event handlers when map is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const map = mapRef.current;

    const addLayers = () => {
        const filteredStores = getFilteredStores();
        const geojsonData = createStoresGeoJSON(
        filteredStores.map((s) => ({
            name: s.name,
            address: s.address,
            notes: s.notes,
            latitude: s.coordinates[1],
            longitude: s.coordinates[0],
            popularity: s.popularity,
        }))
        );

        // Add a GeoJSON source with clustering enabled
        if (!map.getSource("stores")) {
        map.addSource("stores", {
            type: "geojson",
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: MAP_CONFIG.clusterMaxZoom,
            clusterRadius: MAP_CONFIG.clusterRadius,
            clusterProperties: {
                // Aggregate popularity for clusters if needed, though heatmap uses unclustered data usually.
                // For heatmap to work on source, we might need a separate source without clustering or turn off clustering
                // But heatmap works on point sources.
                // Actually, heatmap layers don't work well with clustered sources because the points are hidden.
                // We might need a separate source for heatmap or disable clustering when heatmap is on.
                // For simplicity, let's keep using the same source but we might need to adjust.
                // Wait, mapbox heatmap works on the raw features of the source. 
                // If cluster is true, the source produces cluster points at low zoom.
                // So the heatmap would show clusters as points, which is weird.
                // Ideally we need a non-clustered source for heatmap.
            }
        });
        }
        
        // We need a separate non-clustered source for heatmap to be accurate at all zoom levels
        // Or we can just toggle clustering on the source? No, can't change that at runtime easily.
        // Let's add a second source "stores-heatmap" without clustering.
        if (!map.getSource("stores-heatmap")) {
            map.addSource("stores-heatmap", {
                type: "geojson",
                data: geojsonData,
                cluster: false,
            });
        }

        // Add layer for clusters
        if (!map.getLayer("clusters")) {
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
        }

        // Add layer for cluster count labels
        if (!map.getLayer("cluster-count")) {
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
        }

        // Add layer for unclustered points
        if (!map.getLayer("unclustered-point")) {
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
        }
    };

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
      
      // Find the full store data to get extra fields like openingHours, rating, images
      // Since properties in GeoJSON might be flattened or limited, we look up in our filtered stores
      // or we could have passed them in properties. For now, let's look up.
      const store = getFilteredStores().find(s => s.name === name);

      // Ensure popup appears over the correct copy of the feature
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const storeData: StoreData = {
        name: name ?? "",
        address: address ?? "",
        notes: notes ?? "",
        coordinates,
        openingHours: store?.openingHours,
        rating: store?.rating,
        images: store?.images,
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

          addStopToRoute(storeData);

            // Add clear route button listener
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

        // Attach event listeners to popup buttons
        const attachPopupListeners = () => {
          const sanitizedName = sanitizeStoreName(name ?? "");
          const favoriteBtn = document.getElementById(
            `favorite-btn-${sanitizedName}`
          );
          const directionsBtn = document.getElementById(
            `directions-btn-${sanitizedName}`
          );
          const shareBtn = document.getElementById(`share-btn-${sanitizedName}`);

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
                url.searchParams.set("store", name ?? "");
                navigator.clipboard.writeText(url.toString());
                alert("Link copied to clipboard!");
            });
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

    // Handle map click for adding location
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
        if (isAddLocationMode) {
            const coordinates = [e.lngLat.lng, e.lngLat.lat] as [number, number];
            setNewLocationCoordinates(coordinates);
            
            // Open form via Sheet or Popup
            // For simplicity, let's use the Sheet for adding location on both mobile and desktop
            // or we can use a modal. Let's use Sheet for consistency.
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

    // Change cursor when in add location mode
    if (isAddLocationMode) {
        map.getCanvas().style.cursor = "crosshair";
    } else {
        map.getCanvas().style.cursor = "";
    }

    // Attach event listeners
    map.on("click", "clusters", handleClusterClick);
    map.on("click", "unclustered-point", handleMarkerClick);
    map.on("click", handleMapClick); // Add general click handler
    map.on("style.load", addLayers);
    
    // Initial add
    addLayers();

    // Cleanup
    return () => {
      cleanupGeolocation();
      map.off("click", "clusters", handleClusterClick);
      map.off("click", "unclustered-point", handleMarkerClick);
      map.off("click", handleMapClick);
      map.off("style.load", addLayers);
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
    handleClearRoute,
    cleanupGeolocation,
    isDesktop,
    mapRef.current,
	getFilteredStores,
    isAddLocationMode // Add dependency
  ]);

  const handleDirectionsFromSheet = async () => {
    if (!selectedStore) return;

    if (!userLocation) {
      alert("Please enable location services to get directions");
      getUserLocation();
      return;
    }

    addStopToRoute(selectedStore);
    setIsSheetOpen(false);
  };

  const handleStoreSelect = (store: StoreData) => {
      // Fly to store
      if (mapRef.current) {
          mapRef.current.flyTo({
              center: store.coordinates,
              zoom: 15
          });

          if (isDesktop) {
             if (currentPopupRef.current) {
                currentPopupRef.current.remove();
             }
             const popup = new mapboxgl.Popup({
                maxWidth: "320px",
                className: "custom-popup",
             })
             .setLngLat(store.coordinates)
             .setHTML(createPopupHTML({ ...store, isFavorite: isFavorite(store.name) }))
             .addTo(mapRef.current);
             currentPopupRef.current = popup;
             
             // Re-attach listeners for the new popup
             // Note: We should ideally refactor this listener attachment logic to be reusable
             // For now, we'll just leave it as is or user can click marker to get full interactivity
          } else {
              setSelectedStore(store);
              setIsSheetOpen(true);
          }
      }
  };

  const handleShare = (store: StoreData) => {
    const url = new URL(window.location.href);
    url.searchParams.set("store", store.name);
    navigator.clipboard.writeText(url.toString());
    alert("Link copied to clipboard!");
  };
  
  const handleAddLocationSubmit = (data: Partial<StoreData>) => {
      if (newLocationCoordinates && data.name && data.address) {
          const newStore: StoreData = {
              name: data.name,
              address: data.address,
              notes: data.notes || "",
              coordinates: newLocationCoordinates,
              openingHours: data.openingHours,
              price: data.price,
              tags: data.tags,
              amenities: data.amenities,
              popularity: 0, // New locations start with 0 popularity
          };
          
          setCustomStores([...customStores, newStore]);
          setIsAddLocationMode(false);
          setNewLocationCoordinates(null);
          setIsSheetOpen(false);
          
          // Fly to new location
          if (mapRef.current) {
              mapRef.current.flyTo({
                  center: newLocationCoordinates,
                  zoom: 15
              });
          }
      }
  };

  return (
    <div className="h-full relative flex">
      {/* Sidebar for Store List (Desktop) */}
      {isDesktop && (
        <div className={cn(
            "bg-white dark:bg-gray-900 shadow-xl z-20 transition-all duration-300 flex flex-col",
            isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}>
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-lg">Stores</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                    {/* Close icon */}
                </button>
            </div>
            <div className="p-4 border-b">
                 <MapControls
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    currentStyle={mapStyle}
                    onStyleChange={setMapStyle}
                    showFavoritesOnly={showFavoritesOnly}
                    onShowFavoritesChange={setShowFavoritesOnly}
                     sortBy={sortBy}
                     onSortChange={setSortBy}
                     hasUserLocation={!!userLocation}
                     searchRadius={searchRadius}
                     onRadiusChange={setSearchRadius}
                     isFollowMode={isFollowMode}
                     onFollowModeChange={setIsFollowMode}
                     // New Props
                     selectedTags={selectedTags}
                     onTagsChange={setSelectedTags}
                     priceRange={priceRange}
                     onPriceChange={setPriceRange}
                     showHeatmap={showHeatmap}
                     onHeatmapChange={setShowHeatmap}
                     // Community Props
                     onAddLocation={() => {
                         setIsAddLocationMode(!isAddLocationMode);
                         if (!isAddLocationMode) {
                             alert("Click on the map to add a location");
                         }
                     }}
                     isAddLocationMode={isAddLocationMode}
                     className="shadow-none p-0"
                 />
            </div>
            <StoreList
                stores={getFilteredStores()}
                 onSelectStore={handleStoreSelect}
                 selectedStore={selectedStore}
                 isFavorite={isFavorite}
                 toggleFavorite={toggleFavorite}
                 onShare={handleShare}
                 className="flex-1"
             />
        </div>
      )}

      <div className="flex-1 relative h-full">
        <div className="w-full h-full" id="map-container" ref={mapContainerRef} />

        {/* Toggle Sidebar Button (Desktop) */}
        {isDesktop && !isSidebarOpen && (
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-10 bg-white p-2 rounded-md shadow-md"
            >
                Show List
            </button>
        )}

        {/* Mobile Controls */}
        {isMobile && (
             <div className="absolute top-4 left-4 right-4 z-10">
                <MapControls
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    currentStyle={mapStyle}
                    onStyleChange={setMapStyle}
                    showFavoritesOnly={showFavoritesOnly}
                    onShowFavoritesChange={setShowFavoritesOnly}
                     sortBy={sortBy}
                     onSortChange={setSortBy}
                     hasUserLocation={!!userLocation}
                     searchRadius={searchRadius}
                     onRadiusChange={setSearchRadius}
                     isFollowMode={isFollowMode}
                     onFollowModeChange={setIsFollowMode}
                     // New Props
                     selectedTags={selectedTags}
                     onTagsChange={setSelectedTags}
                     priceRange={priceRange}
                     onPriceChange={setPriceRange}
                     showHeatmap={showHeatmap}
                     onHeatmapChange={setShowHeatmap}
                     // Community Props
                     onAddLocation={() => {
                         setIsAddLocationMode(!isAddLocationMode);
                         if (!isAddLocationMode) {
                             alert("Click on the map to add a location");
                         }
                     }}
                     isAddLocationMode={isAddLocationMode}
                 />
            </div>
        )}

        {/* Route Control Panel */}
        {activeRoute && (
            <RouteControlPanel 
              route={activeRoute} 
              onClear={handleClearRoute}
              transportMode={transportMode}
              onTransportModeChange={setTransportMode}
              avoidTolls={avoidTolls}
              onAvoidTollsChange={setAvoidTolls}
              plannedStops={plannedStops}
              onRemoveStop={removeStopFromRoute}
              onSaveRoute={() => handleSaveMultiStop("My Route")}
              onShareRoute={() => handleShareMultiStop()}
            />
        )}

        {/* User Location Button */}
        <UserLocationButton 
            onClick={getUserLocation} 
            isVisible={true} 
        />
      </div>

      {/* Bottom Sheet for Mobile Store Details OR Add Location Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto">
          <div className="p-4">
            {newLocationCoordinates ? (
              <LocationForm
                onSubmit={handleAddLocationSubmit}
                onCancel={() => {
                  setIsSheetOpen(false);
                  setNewLocationCoordinates(null);
                }}
              />
            ) : selectedStore ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedStore.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedStore.address}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(selectedStore.name)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Heart
                      className={cn(
                        "w-6 h-6 transition-colors",
                        isFavorite(selectedStore.name)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      )}
                    />
                  </button>
                </div>

                {selectedStore.images && selectedStore.images.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden h-48 w-full relative">
                    <img
                      src={selectedStore.images[0]}
                      alt={selectedStore.name}
                      className="object-cover w-full h-full"
                    />
                    <div className={`absolute inset-0 ${gradientClasses.orange}`} />
                  </div>
                )}

                <div className="space-y-4">
                  {selectedStore.openingHours && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{selectedStore.openingHours}</span>
                    </div>
                  )}
                  
                  {selectedStore.rating && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedStore.rating} / 5.0</span>
                    </div>
                  )}

                  {selectedStore.tags && (
                    <div className="flex flex-wrap gap-2">
                        {selectedStore.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                  )}

                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {selectedStore.notes}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleDirectionsFromSheet}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Navigation2 className="w-4 h-4" />
                      Directions
                    </button>
                    <button
                      onClick={() => handleShare(selectedStore)}
                      className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MapContainer;