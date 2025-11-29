'use client';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  Crosshair,
  Search,
  Star,
} from "lucide-react";
import type { FunctionComponent } from "react";
import { MapFilters } from "./MapFilters";
import { MapStyleSwitcher } from "./MapStyleSwitcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { StoreList, type StoreListProps } from "./StoreList";
import { useTranslations } from "next-intl";

export interface MapControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentStyle: string;
  onStyleChange: (style: string) => void;
  showFavoritesOnly: boolean;
  onShowFavoritesChange: (show: boolean) => void;
  sortBy: "name" | "distance";
  onSortChange: (sort: "name" | "distance") => void;
  hasUserLocation: boolean;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
  isFollowMode: boolean;
  onFollowModeChange: (follow: boolean) => void;
  smartAlertsEnabled: boolean;
  onSmartAlertsChange: (enabled: boolean) => void;
  followAlertsEnabled: boolean;
  onFollowAlertsChange: (enabled: boolean) => void;
  onClose: () => void;
  isMobile?: boolean;

  // New Filter Props
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  priceRange: number[];
  onPriceChange: (prices: number[]) => void;
  showHeatmap: boolean;
  onHeatmapChange: (show: boolean) => void;

  // Community Props
  onAddLocation: () => void;
  isAddLocationMode: boolean;
  storeListProps: StoreListProps;

  className?: string;
  showAddLocation?: boolean;
  showSearch?: boolean;
  hideStoreList?: boolean;
  defaultStoreListOpen?: boolean;
}

export const MapControls: FunctionComponent<MapControlsProps> = ({
  searchQuery,
  onSearchChange,
  currentStyle,
  onStyleChange,
  showFavoritesOnly,
  onShowFavoritesChange,
  sortBy,
  onSortChange,
  hasUserLocation,
  searchRadius,
  onRadiusChange,
  isFollowMode,
  onFollowModeChange,
  smartAlertsEnabled,
  onSmartAlertsChange,
  followAlertsEnabled,
  onFollowAlertsChange,
  selectedTags,
  onTagsChange,
  priceRange,
  onPriceChange,
  showHeatmap,
  onHeatmapChange,
  onAddLocation,
  isAddLocationMode,
  className,
  storeListProps,
  onClose,
  isMobile = false,
  showAddLocation = true,
  showSearch = true,
  hideStoreList = false,
  defaultStoreListOpen = false,
}) => {
  const t = useTranslations("Map");

  return (
    <div
      className={cn(
        "flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-700",
        isMobile
          ? "gap-3 p-4 max-h-none overflow-visible"
          : "gap-4 p-4 md:p-5 max-h-[80vh] overflow-y-auto",
        className
      )}
    >
      {/* Add Location Button */}
      {showAddLocation && (
        <button
          type="button"
          onClick={onAddLocation}
          className={cn(
            "w-full py-2 px-4 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2",
            isAddLocationMode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-primary text-foreground hover:bg-primary/90"
          )}
        >
          {isAddLocationMode ? t("cancel_adding") : t("add_location")}
        </button>
      )}

      {/* Search Section */}
      {showSearch && (
        <div className="space-y-2">
          {!isMobile && (
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("search_label")}
            </label>
          )}
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 transition-all",
                isMobile && "h-11"
              )}
            />
          </div>
        </div>
      )}

      {/* Near Me Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
          <span>{t("near_me")}</span>
          <span className="text-xs font-normal text-gray-400">
            {t("distance_unit", { value: searchRadius })}
          </span>
        </label>

        <div className="space-y-3">
          {/* Radius Slider */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="50"
              value={searchRadius}
              onChange={(e) => onRadiusChange(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
          </div>

          {/* Follow Mode Toggle */}
          <button
            type="button"
            onClick={() => onFollowModeChange(!isFollowMode)}
            disabled={!hasUserLocation}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200",
              isFollowMode
                ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
              !hasUserLocation && "opacity-50 cursor-not-allowed"
            )}
          >
            <Crosshair
              className={cn("h-4 w-4", isFollowMode && "animate-pulse")}
            />
            <span>
              {isFollowMode ? t("following_location") : t("follow_location")}
            </span>
          </button>
        </div>
      </div>

      {/* Smart Alerts */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t("smart_alerts")}
        </label>

        <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-900/50">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {t("nearby_alerts")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("nearby_alerts_hint")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={smartAlertsEnabled}
                onChange={(e) => onSmartAlertsChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {t("follow_alerts")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("follow_alerts_hint")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={followAlertsEnabled}
                onChange={(e) => onFollowAlertsChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t("filters_and_sort")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onShowFavoritesChange(!showFavoritesOnly)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200",
              showFavoritesOnly
                ? "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <Star
              className={cn(
                "h-4 w-4 transition-transform",
                showFavoritesOnly && "fill-current scale-110"
              )}
            />
            <span>{t("favorites")}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onSortChange(sortBy === "name" ? "distance" : "name")
            }
            disabled={!hasUserLocation && sortBy === "name"}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200",
              sortBy === "distance"
                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
              !hasUserLocation && "opacity-50 cursor-not-allowed"
            )}
            title={
              !hasUserLocation ? t("sort_tooltip") : ""
            }
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>
              {sortBy === "distance" ? t("sort_distance") : t("sort_name")}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <MapFilters
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
        priceRange={priceRange}
        onPriceChange={onPriceChange}
        showHeatmap={showHeatmap}
        onHeatmapChange={onHeatmapChange}
      />

      {/* Map Style Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t("map_style")}
        </label>
        <MapStyleSwitcher
          currentStyle={currentStyle}
          onStyleChange={onStyleChange}
        />
      </div>

      {/* Collapsible StoreList */}
      {!hideStoreList && (
        <Collapsible defaultOpen={defaultStoreListOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">
                {t("store_list")}
              </label>
              <ChevronDown className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <StoreList
              {...storeListProps}
              className={cn("flex-1", storeListProps.className)}
              onClose={onClose}
            />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
