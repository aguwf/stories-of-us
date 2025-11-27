"use client";

import {
  type FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type MapControlsProps,
  RouteControlPanel,
  type StoreListProps,
  UserLocationButton,
} from "@/app/_components/Map";
import { Input } from "@/components/ui/input";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useFavoriteStores } from "@/hooks/useFavoriteStores";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSavedRoutes, type ShareableRoute } from "@/hooks/useSavedRoutes";
import { useMapRoute } from "@/hooks/useMapRoute";
import { useMapbox } from "@/hooks/useMapbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MAP_CONFIG, MAP_STYLES } from "@/utils/mapConstants";
import { formatRouteInfo, sanitizeStoreName } from "@/utils/mapHelpers";
import { DesktopSidebar } from "./map/DesktopSidebar";
import { MobileControls } from "./map/MobileControls";
import { StoreSheet } from "./map/StoreSheet";
import { createInteractivePopup } from "./map/createInteractivePopup";
import { useFilteredStores } from "./map/useFilteredStores";
import { useHeatmapLayer } from "./map/useHeatmapLayer";
import { useMapEvents } from "./map/useMapEvents";
import { useStoreLayers } from "./map/useStoreLayers";
import type { StoreData } from "./map/types";
import { List, Search } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useMemo } from "react";
import type { StoreLocation } from "@/types/map.types";
import { useTranslations } from "next-intl";

const MapContainer: FunctionComponent = () => {
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState<string>(MAP_STYLES.MAPBOX_STYLE);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "distance">("name");
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const currentStyleRef = useRef<string>(MAP_STYLES.MAPBOX_STYLE);

  // Community / Add Location State
  const [isAddLocationMode, setIsAddLocationMode] = useState(false);
  const [newLocationCoordinates, setNewLocationCoordinates] = useState<
    [number, number] | null
  >(null);
  // const [customStores, setCustomStores] = useState<StoreData[]>([]); // Removed in favor of backend

  const { data: locationsData, refetch: refetchLocations } =
    api.location.getAll.useQuery();

  const fetchedStores: StoreData[] = useMemo(() => {
    return (
      locationsData?.map((location) => {
        let details: Partial<StoreLocation> = {};

        if (location.details) {
          try {
            details = JSON.parse(location.details) as Partial<StoreLocation>;
          } catch (error) {
            console.error("Failed to parse location details", error);
          }
        }

        return {
          name: location.name,
          address: location.address,
          notes: location.description ?? "",
          coordinates: [location.lng, location.lat] as [number, number],
          images: location.images,
          openingHours: details.openingHours,
          rating: details.rating,
          tags: details.tags ?? [],
          price: details.price,
          amenities: details.amenities ?? [],
          popularity: details.popularity ?? 0,
        };
      }) ?? []
    );
  }, [locationsData]);

  const createLocationMutation = api.location.create.useMutation({
    onSuccess: () => {
      toast.success(t("toast_submitted"));
      setIsAddLocationMode(false);
      setNewLocationCoordinates(null);
      setIsSheetOpen(false);
      refetchLocations();
    },
    onError: (error) => {
      toast.error(t("toast_error", { message: error.message }));
    },
  });

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
  const t = useTranslations("Map");
  const popupT = useTranslations("MapPopup");
  const popupCopy = useMemo(
    () => ({
      enableLocation: t("enable_location_prompt"),
      linkCopied: popupT("link_copied"),
      savedLabel: popupT("saved"),
      saveLabel: popupT("save"),
      directionsLabel: popupT("directions"),
      distanceLabel: popupT("distance"),
      timeLabel: popupT("time"),
      clearRouteLabel: popupT("clear_route"),
    }),
    [popupT, t]
  );

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
          address: stop.address ?? t("shared_location_label"),
          notes: stop.notes ?? "",
          coordinates: stop.coordinates,
        }));
        setPlannedStops(stops);
      }
    }
  }, [decodeSharedRoute, t]);

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
            ? t("route_with_stops", { count: plannedStops.length })
            : plannedStops[0]?.name ?? t("saved_route_name")),
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
    [activeRoute, plannedStops, t]
  );

  const handleSaveMultiStop = useCallback(
    (name: string, kind?: ShareableRoute["type"]) => {
      const routePayload = buildShareableRoute(name, kind);
      if (!routePayload) {
        alert(t("alert_add_stop_before_save"));
        return;
      }
      saveRoute(routePayload);
      alert(t("alert_route_saved"));
    },
    [buildShareableRoute, saveRoute, t]
  );

  const handleShareMultiStop = useCallback(
    (kind?: ShareableRoute["type"]) => {
      const routePayload = buildShareableRoute(undefined, kind);
      if (!routePayload) {
        alert(t("alert_add_stop_before_share"));
        return;
      }
      const url = shareRoute(routePayload);
      if (url) {
        alert(t("alert_link_copied"));
      }
    },
    [buildShareableRoute, shareRoute, t]
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
    customStores: [], // No longer using local custom stores
    favoriteStores,
    stores: fetchedStores,
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
    copy: popupCopy,
  });

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    if (currentStyleRef.current === mapStyle) return;

    currentStyleRef.current = mapStyle;
    mapRef.current.setStyle(mapStyle);
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
      alert(t("enable_location_prompt"));
      getUserLocation();
      return;
    }

    addStopToRoute(selectedStore);
    setIsSheetOpen(false);
  };

  const handleShare = (store: StoreData) => {
    const url = new URL(window.location.href);
    url.searchParams.set("store", store.name);
    navigator.clipboard.writeText(url.toString());
    alert(t("alert_link_copied"));
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
        currentPopupRef.current = createInteractivePopup({
          map: mapRef.current,
          storeData: store,
          isFavorite,
          toggleFavorite,
          userLocation,
          getUserLocation,
          addStopToRoute,
          handleClearRoute,
          onShare: handleShare,
          copy: popupCopy,
        });
      } else {
        setSelectedStore(store);
        setIsSheetOpen(true);
      }
    }
  };

  const handleAddLocationSubmit = (data: Partial<StoreLocation>) => {
    if (newLocationCoordinates && data.name) {
      const images = (data.images ?? []).filter(Boolean);

      const detailPayload = {
        openingHours: data.openingHours?.trim() || undefined,
        rating:
          data.rating !== undefined && data.rating !== null
            ? Math.min(Math.max(Number(data.rating), 0), 5)
            : undefined,
        tags: data.tags?.length ? data.tags : undefined,
        price: data.price,
        amenities: data.amenities?.length ? data.amenities : undefined,
        popularity:
          data.popularity !== undefined && data.popularity !== null
            ? Math.min(Math.max(Number(data.popularity), 0), 100)
            : undefined,
      };

      const cleanedDetails = Object.fromEntries(
        Object.entries(detailPayload).filter(([, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== undefined && value !== null && value !== "";
        })
      );

      const details =
        Object.keys(cleanedDetails).length > 0
          ? JSON.stringify(cleanedDetails)
          : undefined;

      createLocationMutation.mutate({
        name: data.name,
        description: data.notes,
        address: data.address ?? "",
        lat: newLocationCoordinates[1],
        lng: newLocationCoordinates[0],
        images,
        details,
      });
    }
  };

  const storeListProps = {
    stores: filteredStores,
    onSelectStore: handleStoreSelect,
    selectedStore,
    isFavorite,
    toggleFavorite,
    onShare: handleShare,
    variant: isDesktop ? "default" : ("compact" as StoreListProps["variant"]),
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
      if (!isAuthLoaded || !isSignedIn) {
        toast.error("Please sign in to add a location.");
        void openSignIn?.({
          redirectUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        });
        return;
      }

      setIsAddLocationMode((prev) => {
        const next = !prev;
        if (next) {
          alert("Click on the map to add a location");
        }
        return next;
      });
    },
    isAddLocationMode,
    onClose: () => setIsSidebarOpen(false),
    storeListProps,
  };

  return (
    <div className="h-full relative flex">
      <div className="flex-1 relative h-full">
        {isDesktop && (
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 pr-4">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="h-10 px-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-2"
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <List className="w-5 h-5" />
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-3 w-64 md:w-72 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-md"
              />
            </div>

            <button
              type="button"
              onClick={mapControlsProps.onAddLocation}
              className={`h-10 whitespace-nowrap px-3 rounded-lg font-medium transition-all shadow-md text-xs md:text-sm ${
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

        {isDesktop && (
          <DesktopSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            mapControlsProps={mapControlsProps}
            storeListProps={storeListProps}
          />
        )}

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
            onSaveRoute={() => handleSaveMultiStop(t("my_route_name"))}
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
