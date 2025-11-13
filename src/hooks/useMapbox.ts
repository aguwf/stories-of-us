import { env } from "@/env";
import type { MapConfig } from "@/types/map.types";
import { MAP_STYLES } from "@/utils/mapConstants";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

/**
 * Hook to initialize and manage Mapbox GL JS instance
 */
export const useMapbox = (config: MapConfig) => {
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const [isMapLoaded, setIsMapLoaded] = useState(false);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		// Initialize Mapbox
		mapboxgl.accessToken = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
		const map = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: MAP_STYLES.MAPBOX_STYLE,
			center: config.initialCenter,
			zoom: config.initialZoom,
		});

		mapRef.current = map;

		// Set loaded state when map is ready
		map.on("load", () => {
			setIsMapLoaded(true);
		});

		// Cleanup on unmount
		return () => {
			map.remove();
			mapRef.current = null;
			setIsMapLoaded(false);
		};
	}, [config.initialCenter, config.initialZoom]);

	return {
		mapRef,
		mapContainerRef,
		isMapLoaded,
	};
};
