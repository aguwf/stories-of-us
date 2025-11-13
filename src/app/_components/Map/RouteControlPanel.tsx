import { useState, type FunctionComponent } from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatRouteInfo } from "@/utils/mapHelpers";
import type { RouteData } from "@/types/map.types";
import { ChevronDown, ChevronUp, MapIcon, Save, Share2, X } from "lucide-react";

interface RouteControlPanelProps {
  route: RouteData;
  onClear: () => void;
}

export const RouteControlPanel: FunctionComponent<RouteControlPanelProps> = ({
  route,
  onClear,
}) => {
  const { distanceKm, durationMin } = formatRouteInfo(
    route.distance,
    route.duration
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 transition-all duration-300",
        isMobile
          ? "fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-hidden rounded-b-none"
          : "absolute top-4 right-4 max-w-sm"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
        <div className="flex items-center">
          <MapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Route Information
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {isMobile && (
            <button
              type="button"
              onClick={toggleExpand}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close route info"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content - Collapsible on mobile */}
      <div
        className={cn(
          "overflow-y-auto transition-all duration-300",
          isExpanded ? "max-h-[60vh]" : "max-h-0",
          !isMobile && "max-h-[500px]"
        )}
      >
        {/* Route summary */}
        <div className="p-4">
          {/* Route points */}
          {/* <div className="mb-4">
            <div className="flex items-start mb-3">
              <div className="mt-1 mr-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mx-auto my-1" />
              </div>
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">From</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {startPoint}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mt-1 mr-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">To</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {endPoint}
                </p>
              </div>
            </div>
          </div> */}

          {/* Journey metrics */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Distance
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {distanceKm} km
              </p>
            </div>

            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Duration
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {durationMin} min
              </p>
            </div>

            {/* <div className="col-span-2 flex items-center p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Estimated Arrival
                </p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {estimatedArrival}
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            type="button"
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 transition-colors text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      {/* Footer with clear button */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={onClear}
          className="w-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Route
        </button>
      </div>
    </div>
  );
};
