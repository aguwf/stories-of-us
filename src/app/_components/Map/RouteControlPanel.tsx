import type { FunctionComponent } from 'react';
import type { RouteData } from '@/types/map.types';
import { formatRouteInfo } from '@/utils/mapHelpers';

interface RouteControlPanelProps {
  route: RouteData;
  onClear: () => void;
}

export const RouteControlPanel: FunctionComponent<RouteControlPanelProps> = ({
  route,
  onClear,
}) => {
  const { distanceKm, durationMin } = formatRouteInfo(route.distance, route.duration);

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Route Information</h3>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close route info"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Distance:</span>
          <span className="font-medium">{distanceKm} km</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Duration:</span>
          <span className="font-medium">{durationMin} min</span>
        </div>
      </div>
      <button
        onClick={onClear}
        className="mt-4 w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-md transition-colors"
      >
        Clear Route
      </button>
    </div>
  );
};

