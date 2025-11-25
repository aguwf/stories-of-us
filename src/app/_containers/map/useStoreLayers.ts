import mapboxgl from "mapbox-gl";
import { useEffect, type MutableRefObject } from "react";

import { MAP_COLORS, MAP_CONFIG } from "@/utils/mapConstants";
import { createStoresGeoJSON } from "@/utils/mapHelpers";
import type { StoreData } from "./types";

interface UseStoreLayersParams {
  mapRef: MutableRefObject<mapboxgl.Map | null>;
  isMapLoaded: boolean;
  filteredStores: StoreData[];
}

export const useStoreLayers = ({
  mapRef,
  isMapLoaded,
  filteredStores,
}: UseStoreLayersParams) => {
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const geojsonData = createStoresGeoJSON(
      filteredStores.map((store) => ({
        name: store.name,
        address: store.address,
        notes: store.notes,
        latitude: store.coordinates[1],
        longitude: store.coordinates[0],
        popularity: store.popularity,
      }))
    );

    const ensureSources = () => {
      if (!map.getSource("stores")) {
        map.addSource("stores", {
          type: "geojson",
          data: geojsonData,
          cluster: true,
          clusterMaxZoom: MAP_CONFIG.clusterMaxZoom,
          clusterRadius: MAP_CONFIG.clusterRadius,
          clusterProperties: {},
        });
      }

      if (!map.getSource("stores-heatmap")) {
        map.addSource("stores-heatmap", {
          type: "geojson",
          data: geojsonData,
          cluster: false,
        });
      }
    };

    const ensureLayers = () => {
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
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40,
            ],
          },
        });
      }

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

    const updateSources = () => {
      const storesSource = map.getSource("stores") as mapboxgl.GeoJSONSource;
      const heatmapSource = map.getSource(
        "stores-heatmap"
      ) as mapboxgl.GeoJSONSource;

      storesSource?.setData(geojsonData);
      heatmapSource?.setData(geojsonData);
    };

    const syncLayers = () => {
      ensureSources();
      ensureLayers();
      updateSources();
    };

    const handleStyleLoad = () => {
      syncLayers();
    };

    syncLayers();
    map.on("style.load", handleStyleLoad);

    return () => {
      map.off("style.load", handleStyleLoad);
    };
  }, [isMapLoaded, mapRef, filteredStores]);
};
