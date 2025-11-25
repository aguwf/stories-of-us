import { env } from "@/env";
import type { DirectionsResponse, RouteData } from "@/types/map.types";
import { MAP_COLORS } from "@/utils/mapConstants";
import type * as GeoJSON from "geojson";
import mapboxgl from "mapbox-gl";
import { useCallback, useState } from "react";

/**
 * Hook to manage map routes using Mapbox Directions API
 */
export const useMapRoute = (mapRef: React.RefObject<mapboxgl.Map | null>) => {
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch route from Mapbox Directions API
  const fetchRoute = useCallback(
    async (
      start: [number, number],
      waypoints: [number, number][],
      profile:
        | "driving"
        | "walking"
        | "cycling"
        | "driving-traffic" = "driving",
      exclude: string[] = [],
      waypointLabels: string[] = []
    ) => {
      setIsLoading(true);
      try {
        const coordinates = [start, ...waypoints];
        const coordinatePath = coordinates
          .map((coord) => `${coord[0]},${coord[1]}`)
          .join(";");

        let url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatePath}?geometries=geojson&steps=true&access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;

        if (exclude.length > 0) {
          url += `&exclude=${exclude.join(",")}`;
        }

        const response = await fetch(url);
        const data = (await response.json()) as DirectionsResponse;

        if (data.code === "Ok" && data.routes.length > 0) {
          const route = data.routes[0];
          if (route) {
            const routeData: RouteData = {
              distance: route.distance,
              duration: route.duration,
              geometry: route.geometry as GeoJSON.LineString,
              steps:
                route.legs?.flatMap((leg) =>
                  leg.steps.map((step) => ({
                    maneuver: {
                      instruction: step.maneuver.instruction,
                      location: step.maneuver.location,
                      type: step.maneuver.type,
                      modifier: step.maneuver.modifier,
                    },
                    distance: step.distance,
                    duration: step.duration,
                    name: step.name,
                  }))
                ) || [],
              waypoints: coordinates.map((coord, index) => ({
                coordinates: coord,
                name:
                  index === 0
                    ? "Start"
                    : waypointLabels[index - 1] ?? `Stop ${index}`,
              })),
            };
            setActiveRoute(routeData);
            return routeData;
          }
        }
        return null;
      } catch (error) {
        console.error("Error fetching route:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Add or update route on map
  const displayRoute = useCallback(
    (route: RouteData) => {
      if (!mapRef.current) return;

      const map = mapRef.current;

      if (!map.getSource("route")) {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": MAP_COLORS.ROUTE,
            "line-width": 5,
            "line-opacity": 0.8,
          },
        });
      } else {
        const source = map.getSource("route") as mapboxgl.GeoJSONSource;
        source.setData({
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        });
      }

      // Fit map to show entire route
      const bounds = new mapboxgl.LngLatBounds();
      for (const coord of route.geometry.coordinates) {
        bounds.extend(coord as [number, number]);
      }
      map.fitBounds(bounds, {
        padding: {
          top: 50,
          right: 50,
          bottom: 200,
          left: 50,
        },
      });
    },
    [mapRef]
  );

  // Clear route from map
  const clearRoute = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      if (map.getLayer("route")) {
        map.removeLayer("route");
      }
      if (map.getSource("route")) {
        map.removeSource("route");
      }
    }
    setActiveRoute(null);
  }, [mapRef]);

  return {
    activeRoute,
    isLoading,
    fetchRoute,
    displayRoute,
    clearRoute,
  };
};
