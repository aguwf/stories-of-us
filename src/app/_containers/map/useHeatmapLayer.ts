import { useEffect, type MutableRefObject } from "react";
import mapboxgl from "mapbox-gl";

interface UseHeatmapLayerParams {
  mapRef: MutableRefObject<mapboxgl.Map | null>;
  isMapLoaded: boolean;
  showHeatmap: boolean;
}

export const useHeatmapLayer = ({
  mapRef,
  isMapLoaded,
  showHeatmap,
}: UseHeatmapLayerParams) => {
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (showHeatmap) {
      if (map.getLayer("clusters"))
        map.setLayoutProperty("clusters", "visibility", "none");
      if (map.getLayer("cluster-count"))
        map.setLayoutProperty("cluster-count", "visibility", "none");
      if (map.getLayer("unclustered-point"))
        map.setLayoutProperty("unclustered-point", "visibility", "none");

      if (!map.getLayer("store-heatmap")) {
        map.addLayer(
          {
            id: "store-heatmap",
            type: "heatmap",
            source: "stores",
            maxzoom: 15,
            paint: {
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "popularity"],
                0,
                0,
                100,
                1,
              ],
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                15,
                3,
              ],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(209,229,240)",
                0.6,
                "rgb(253,219,199)",
                0.8,
                "rgb(239,138,98)",
                1,
                "rgb(178,24,43)",
              ],
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                2,
                9,
                20,
              ],
              "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                14,
                1,
                15,
                0,
              ],
            },
          },
          "waterway-label"
        );
      } else {
        map.setLayoutProperty("store-heatmap", "visibility", "visible");
      }
    } else {
      if (map.getLayer("clusters"))
        map.setLayoutProperty("clusters", "visibility", "visible");
      if (map.getLayer("cluster-count"))
        map.setLayoutProperty("cluster-count", "visibility", "visible");
      if (map.getLayer("unclustered-point"))
        map.setLayoutProperty("unclustered-point", "visibility", "visible");

      if (map.getLayer("store-heatmap")) {
        map.setLayoutProperty("store-heatmap", "visibility", "none");
      }
    }
  }, [showHeatmap, isMapLoaded, mapRef]);
};
