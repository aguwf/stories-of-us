import { GEOLOCATION_OPTIONS } from "@/utils/mapConstants";
import { createUserLocationMarkerElement } from "@/utils/mapHelpers";
import mapboxgl from "mapbox-gl";
import { useCallback, useRef, useState } from "react";

/**
 * Hook to manage user's geolocation and display marker on map
 */
export const useGeolocation = (
  mapRef: React.RefObject<mapboxgl.Map | null>
) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by your browser";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setUserLocation(coords);
        setError(null);

        // Add or update user location marker
        if (mapRef.current && !userLocationMarkerRef.current) {
          const el = createUserLocationMarkerElement();
          userLocationMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat(coords)
            .addTo(mapRef.current);
        } else if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLngLat(coords);
        }
      },
      (error) => {
        const errorMsg = `Error getting location: ${error.message}`;
        console.error(errorMsg);
        setError(errorMsg);
      },
      GEOLOCATION_OPTIONS
    );
  }, [mapRef]);

  const checkPermissionAndGetLocation = useCallback(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          getUserLocation();
        } else {
          setError(
            "Location permission denied. Please enable location in your device settings."
          );
        }
      });
    } else {
      getUserLocation();
    }
  }, [getUserLocation]);

  // Cleanup marker on unmount
  const cleanup = useCallback(() => {
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }
  }, []);

  return {
    userLocation,
    getUserLocation,
    error,
    cleanup,
	checkPermissionAndGetLocation
  };
};
