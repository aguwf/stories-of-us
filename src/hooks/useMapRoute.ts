import { useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { env } from '@/env';
import type { RouteData, DirectionsResponse } from '@/types/map.types';
import { MAP_COLORS } from '@/utils/mapConstants';

/**
 * Hook to manage map routes using Mapbox Directions API
 */
export const useMapRoute = (mapRef: React.RefObject<mapboxgl.Map | null>) => {
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch route from Mapbox Directions API
  const fetchRoute = useCallback(
    async (start: [number, number], end: [number, number]) => {
      setIsLoading(true);
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;

        const response = await fetch(url);
        const data = (await response.json()) as DirectionsResponse;

        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          if (route) {
            const routeData: RouteData = {
              distance: route.distance,
              duration: route.duration,
              geometry: route.geometry as GeoJSON.LineString,
            };
            setActiveRoute(routeData);
            return routeData;
          }
        }
        return null;
      } catch (error) {
        console.error('Error fetching route:', error);
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

      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          },
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MAP_COLORS.ROUTE,
            'line-width': 5,
            'line-opacity': 0.8,
          },
        });
      } else {
        const source = map.getSource('route') as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        });
      }

      // Fit map to show entire route
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });
      map.fitBounds(bounds, { padding: 50 });
    },
    [mapRef]
  );

  // Clear route from map
  const clearRoute = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      if (map.getLayer('route')) {
        map.removeLayer('route');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
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

