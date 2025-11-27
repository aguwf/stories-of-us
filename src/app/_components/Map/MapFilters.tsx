'use client';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DollarSign, Flame, Tag } from "lucide-react";
import type { FunctionComponent } from "react";
import { useTranslations } from "next-intl";

interface MapFiltersProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  priceRange: number[]; // [min, max] or just selected prices
  onPriceChange: (prices: number[]) => void;
  showHeatmap: boolean;
  onHeatmapChange: (show: boolean) => void;
  className?: string;
}

const AVAILABLE_TAGS = [
  "Cafe",
  "Restaurant",
  "Park",
  "Museum",
  "Shopping",
  "Wifi",
  "Parking",
  "Pet Friendly",
] as const;

export const MapFilters: FunctionComponent<MapFiltersProps> = ({
  selectedTags,
  onTagsChange,
  priceRange,
  onPriceChange,
  showHeatmap,
  onHeatmapChange,
  className,
}) => {
  const t = useTranslations("MapFilters");
  const getTagKey = (tag: (typeof AVAILABLE_TAGS)[number]) =>
    tag === "Pet Friendly" ? "PetFriendly" : tag;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const togglePrice = (price: number) => {
    if (priceRange.includes(price)) {
      onPriceChange(priceRange.filter((p) => p !== price));
    } else {
      onPriceChange([...priceRange, price]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Heatmap Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={cn("h-4 w-4", showHeatmap ? "text-orange-500" : "text-gray-400")} />
          <Label htmlFor="heatmap-mode" className="text-sm font-medium">
            {t("heatmap")}
          </Label>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="heatmap-mode"
            className="sr-only peer"
            checked={showHeatmap}
            onChange={(e) => onHeatmapChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Price Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <DollarSign className="h-3 w-3" />
          <span>{t("price")}</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => togglePrice(price)}
              className={cn(
                "flex-1 py-1.5 px-2 text-sm rounded-md border transition-all",
                priceRange.includes(price)
                  ? "bg-green-50 border-green-200 text-green-700 font-medium dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              )}
            >
              {"$".repeat(price)}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Tag className="h-3 w-3" />
          <span>{t("tags")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-all",
                selectedTags.includes(tag)
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              )}
            >
              {t(`options.${getTagKey(tag)}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
