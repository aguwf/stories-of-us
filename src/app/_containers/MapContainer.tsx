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
import mapboxgl from "mapbox-gl";
import { type FunctionComponent, useEffect, useRef, useState } from "react";

interface StoreData {
	name: string;
	address: string;
	notes: string;
	coordinates: [number, number];
}

const MapContainer: FunctionComponent = () => {
	const currentPopupRef = useRef<mapboxgl.Popup | null>(null);
	const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const isDesktop = useMediaQuery("(min-width: 768px)");

	// Custom hooks
	const { mapRef, mapContainerRef, isMapLoaded } = useMapbox(MAP_CONFIG);
	const {
		userLocation,
		getUserLocation,
		cleanup: cleanupGeolocation,
	} = useGeolocation(mapRef);
	const { toggleFavorite, isFavorite } = useFavoriteStores();
	const { activeRoute, fetchRoute, displayRoute, clearRoute } =
		useMapRoute(mapRef);

	// Initialize user location on mount
	useEffect(() => {
		getUserLocation();
	}, [getUserLocation]);

	// Setup map layers and event handlers when map is loaded
	useEffect(() => {
		if (!isMapLoaded || !mapRef.current) return;

		const map = mapRef.current;
		const geojsonData = createStoresGeoJSON(BEAR_STORES);

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

	return (
		<div className="h-full relative">
			<div className="w-full h-full" id="map-container" ref={mapContainerRef} />

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
		</div>
	);
};

export default MapContainer;
