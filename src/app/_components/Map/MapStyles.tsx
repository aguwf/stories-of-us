import type { FunctionComponent } from "react";

export const MapStyles: FunctionComponent = () => {
	return (
		<style jsx={true}>{`
      .user-location-marker {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
        }
        50% {
          box-shadow: 0 0 20px rgba(66, 133, 244, 0.8);
        }
      }

      :global(.mapboxgl-popup-content) {
        padding: 0 !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      }

      :global(.mapboxgl-popup-close-button) {
        font-size: 24px !important;
        padding: 8px 12px !important;
        color: white !important;
        right: 4px !important;
        top: 4px !important;
      }

      :global(.mapboxgl-popup-close-button:hover) {
        background-color: rgba(255, 255, 255, 0.2) !important;
        border-radius: 4px;
      }
    `}</style>
	);
};
