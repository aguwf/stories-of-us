'use client';
import { type FunctionComponent, useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { RouteData, RouteStop } from "@/types/map.types";
import { formatRouteInfo } from "@/utils/mapHelpers";
import {
  Bike,
  Car,
  ChevronDown,
  ChevronUp,
  Footprints,
  MapIcon,
  Save,
  Share2,
  TrafficCone,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface RouteControlPanelProps {
  route: RouteData;
  onClear: () => void;
  transportMode: "driving" | "walking" | "cycling" | "driving-traffic";
  onTransportModeChange: (
    mode: "driving" | "walking" | "cycling" | "driving-traffic"
  ) => void;
  avoidTolls: boolean;
  onAvoidTollsChange: (avoid: boolean) => void;
  plannedStops: RouteStop[];
  onRemoveStop: (name: string) => void;
  onSaveRoute: () => void;
  onShareRoute: () => void;
}

export const RouteControlPanel: FunctionComponent<RouteControlPanelProps> = ({
  route,
  onClear,
  transportMode,
  onTransportModeChange,
  avoidTolls,
  onAvoidTollsChange,
  plannedStops,
  onRemoveStop,
  onSaveRoute,
  onShareRoute,
}) => {
  const t = useTranslations("RoutePanel");
  const { distanceKm, durationMin } = formatRouteInfo(
    route.distance,
    route.duration
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const modes = [
    { id: "driving", icon: Car, label: t("mode_drive") },
    { id: "driving-traffic", icon: TrafficCone, label: t("mode_traffic") },
    { id: "cycling", icon: Bike, label: t("mode_bike") },
    { id: "walking", icon: Footprints, label: t("mode_walk") },
  ] as const;

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 transition-all duration-300 flex flex-col",
        isMobile
          ? "fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-b-none"
          : "absolute top-4 right-4 w-80 max-h-[calc(100vh-2rem)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 shrink-0">
        <div className="flex items-center">
          <MapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            {t("title")}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {isMobile && (
            <button
              type="button"
              onClick={toggleExpand}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isExpanded ? t("collapse") : t("expand")}
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
            aria-label={t("close")}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content - Collapsible on mobile */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 flex flex-col",
          isExpanded ? "flex-1" : "max-h-0"
        )}
      >
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Transport Mode Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onTransportModeChange(mode.id)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all",
                  transportMode === mode.id
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-300 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
                title={mode.label}
              >
                <mode.icon className="w-4 h-4 mb-1" />
                {mode.label}
              </button>
            ))}
          </div>

          {/* Avoid Tolls Checkbox */}
          {(transportMode === "driving" ||
            transportMode === "driving-traffic") && (
            <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidTolls}
                onChange={(e) => onAvoidTollsChange(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>{t("avoid_tolls")}</span>
            </label>
          )}

          {/* Journey metrics */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("distance")}
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {distanceKm} km
              </p>
            </div>

            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("duration")}
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {durationMin} min
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
            onClick={onShareRoute}
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t("share")}
          </button>
          <button
            type="button"
            onClick={onSaveRoute}
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 transition-colors text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {t("save")}
          </button>
        </div>

          {/* Planned stops list */}
          {plannedStops.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <span>{t("stops")}</span>
                <span>{plannedStops.length}</span>
              </div>
              <div className="space-y-2">
                {plannedStops.map((stop, index) => (
                  <div
                    key={`${stop.name}-${index}`}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-md px-3 py-2 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                        {stop.name}
                      </p>
                      {stop.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {stop.address}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveStop(stop.name)}
                      className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                      aria-label={t("remove_stop", { name: stop.name })}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Turn-by-turn Steps Toggle */}
          {route.steps && route.steps.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <span>{t("turn_by_turn")}</span>
                {showSteps ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showSteps && (
                <div className="mt-2 space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                  {route.steps.map((step, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-800 dark:text-gray-200">
                        {step.maneuver.instruction}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(step.distance / 1000).toFixed(1)} km
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with clear button */}
        <div className="p-4 pt-0 mt-auto">
          <button
            type="button"
            onClick={onClear}
            className="w-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            {t("clear_route")}
          </button>
        </div>
      </div>
    </div>
  );
};
