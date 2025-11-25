"use client";

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
  MapControlsProps,
  RouteControlPanel,
  UserLocationButton,
} from "@/app/_components/Map";
import { Input } from "@/components/ui/input";
import { useFavoriteStores } from "@/hooks/useFavoriteStores";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSavedRoutes, type ShareableRoute } from "@/hooks/useSavedRoutes";
import { useMapRoute } from "@/hooks/useMapRoute";
import { useMapbox } from "@/hooks/useMapbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MAP_CONFIG, MAP_STYLES } from "@/utils/mapConstants";
import { formatRouteInfo, sanitizeStoreName } from "@/utils/mapHelpers";
import { createPopupHTML } from "@/utils/mapPopupHelpers";
import { DesktopSidebar } from "./map/DesktopSidebar";
import { MobileControls } from "./map/MobileControls";
import { StoreSheet } from "./map/StoreSheet";
import { useFilteredStores } from "./map/useFilteredStores";
import { useHeatmapLayer } from "./map/useHeatmapLayer";
import { useMapEvents } from "./map/useMapEvents";
import { useStoreLayers } from "./map/useStoreLayers";
import type { StoreData } from "./map/types";
import { List, Search } from "lucide-react";

const MapContainer: FunctionComponent = () => {
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState<string>(MAP_STYLES.MAPBOX_STYLE);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "distance">("name");

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Community / Add Location State
  const [isAddLocationMode, setIsAddLocationMode] = useState(false);
  const [newLocationCoordinates, setNewLocationCoordinates] = useState<
    [number, number] | null
  >(null);
  const [customStores, setCustomStores] = useState<StoreData[]>([]);

  // Routing state
  const [transportMode, setTransportMode] = useState<
    "driving" | "walking" | "cycling" | "driving-traffic"
  >("driving");
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
  const {
    activeRoute,
    fetchRoute,
    displayRoute,
    clearRoute: clearMapRoute,
  } = useMapRoute(mapRef);

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
  }, [
    transportMode,
    avoidTolls,
    userLocation,
    plannedStops,
    fetchRoute,
    displayRoute,
    clearMapRoute,
  ]);

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

  const filteredStores = useFilteredStores({
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
  });

  useStoreLayers({ mapRef, isMapLoaded, filteredStores });
  useHeatmapLayer({ mapRef, isMapLoaded, showHeatmap });
  useMapEvents({
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
  });

  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      mapRef.current.setStyle(mapStyle);
    }
  }, [mapStyle, isMapLoaded, mapRef]);

  useEffect(
    () => () => {
      cleanupGeolocation();
    },
    [cleanupGeolocation]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !isMapLoaded || !mapRef.current) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const storeName = params.get("store");
    if (!storeName) return;

    const store = filteredStores.find(
      (s) => sanitizeStoreName(s.name) === sanitizeStoreName(storeName)
    );
    if (store) {
      mapRef.current.flyTo({
        center: store.coordinates,
        zoom: 15,
      });
    }
  }, [filteredStores, isMapLoaded, mapRef, searchQuery]);

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
        zoom: 15,
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
          .setHTML(
            createPopupHTML({ ...store, isFavorite: isFavorite(store.name) })
          )
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
          zoom: 15,
        });
      }
    }
  };

  const storeListProps = {
    stores: filteredStores,
    onSelectStore: handleStoreSelect,
    selectedStore,
    isFavorite,
    toggleFavorite,
    onShare: handleShare,
  };

  const mapControlsProps: MapControlsProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    currentStyle: mapStyle,
    onStyleChange: setMapStyle,
    showFavoritesOnly,
    onShowFavoritesChange: setShowFavoritesOnly,
    sortBy,
    onSortChange: setSortBy,
    hasUserLocation: !!userLocation,
    searchRadius,
    onRadiusChange: setSearchRadius,
    isFollowMode,
    onFollowModeChange: setIsFollowMode,
    selectedTags,
    onTagsChange: setSelectedTags,
    priceRange,
    onPriceChange: setPriceRange,
    showHeatmap,
    onHeatmapChange: setShowHeatmap,
    onAddLocation: () => {
      setIsAddLocationMode(!isAddLocationMode);
      if (!isAddLocationMode) {
        alert("Click on the map to add a location");
      }
    },
    isAddLocationMode,
    onClose: () => setIsSidebarOpen(false),
    storeListProps,
  };

  return (
    <div className="h-full relative flex">
      {isDesktop && (
        <DesktopSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          mapControlsProps={mapControlsProps}
          storeListProps={storeListProps}
        />
      )}

      <div className="flex-1 relative h-full">
        {isDesktop && (
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 pr-4">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-2"
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <List className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:inline">
                {isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              </span>
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stores, addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 w-64 md:w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-md"
              />
            </div>

            <button
              type="button"
              onClick={mapControlsProps.onAddLocation}
              className={`whitespace-nowrap px-3 py-2 rounded-lg font-medium transition-all shadow-md ${
                isAddLocationMode
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-primary text-foreground hover:bg-primary/90"
              }`}
            >
              {isAddLocationMode ? "Cancel Adding" : "Add New Location"}
            </button>
          </div>
        )}
        <div
          className="w-full h-full"
          id="map-container"
          ref={mapContainerRef}
        />

        {isMobile && <MobileControls mapControlsProps={mapControlsProps} />}

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

        <UserLocationButton onClick={getUserLocation} isVisible={true} />
      </div>

      <StoreSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        newLocationCoordinates={newLocationCoordinates}
        onSubmitLocation={handleAddLocationSubmit}
        onCancelLocation={() => {
          setIsSheetOpen(false);
          setNewLocationCoordinates(null);
        }}
        selectedStore={selectedStore}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        onDirections={handleDirectionsFromSheet}
        onShare={handleShare}
      />
    </div>
  );
};

export default MapContainer;
