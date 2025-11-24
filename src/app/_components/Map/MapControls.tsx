import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Crosshair, Search, Star } from "lucide-react";
import type { FunctionComponent } from "react";
import { MapFilters } from "./MapFilters";
import { MapStyleSwitcher } from "./MapStyleSwitcher";

interface MapControlsProps {
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

  className?: string;
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
  selectedTags,
  onTagsChange,
  priceRange,
  onPriceChange,
  showHeatmap,
  onHeatmapChange,
  onAddLocation,
  isAddLocationMode,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-h-[80vh] overflow-y-auto",
        className
      )}
    >
      {/* Add Location Button */}
      <button
        type="button"
        onClick={onAddLocation}
        className={cn(
          "w-full py-2 px-4 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2",
          isAddLocationMode
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isAddLocationMode ? "Cancel Adding" : "Add New Location"}
      </button>

      {/* Search Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Search
        </label>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search stores, addresses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Near Me Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
          <span>Near Me</span>
          <span className="text-xs font-normal text-gray-400">{searchRadius} km</span>
        </label>
        
        <div className="space-y-3">
            {/* Radius Slider */}
            <div className="flex items-center gap-2">
                <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={searchRadius} 
                    onChange={(e) => onRadiusChange(parseInt(e.target.value))}
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
                <Crosshair className={cn("h-4 w-4", isFollowMode && "animate-pulse")} />
                <span>{isFollowMode ? "Following Location" : "Follow Location"}</span>
            </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Filters & Sort
        </label>
        <div className="flex gap-2">
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
            <span>Favorites</span>
          </button>

          <button
            type="button"
            onClick={() => onSortChange(sortBy === "name" ? "distance" : "name")}
            disabled={!hasUserLocation && sortBy === "name"}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all duration-200",
              sortBy === "distance"
                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
              !hasUserLocation && "opacity-50 cursor-not-allowed"
            )}
            title={!hasUserLocation ? "Enable location to sort by distance" : ""}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{sortBy === "distance" ? "Distance" : "Name"}</span>
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
          Map Style
        </label>
        <MapStyleSwitcher
          currentStyle={currentStyle}
          onStyleChange={onStyleChange}
        />
      </div>
    </div>
  );
};
