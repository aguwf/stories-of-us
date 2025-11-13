import type { MapConfig } from "@/types/map.types";

export const MAP_CONFIG: MapConfig = {
	initialCenter: [105.8448, 21.029],
	initialZoom: 12,
	clusterMaxZoom: 14,
	clusterRadius: 50,
};

export const MAP_COLORS = {
	ROUTE: "#B7A3E3",
	USER_LOCATION: "#4285F4",
	CLUSTER_SMALL: "#B7A3E3",
	CLUSTER_MEDIUM: "#f1f075",
	CLUSTER_LARGE: "#f28cb1",
	MARKER: "#B7A3E3",
	MARKER_STROKE: "#fff",
};

export const MAP_STYLES = {
	MAPBOX_STYLE: "mapbox://styles/mapbox/streets-v11",
};

export const GEOLOCATION_OPTIONS: PositionOptions = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0,
};
