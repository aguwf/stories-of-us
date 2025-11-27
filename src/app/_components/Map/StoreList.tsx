'use client';
import { cn } from "@/lib/utils";
import { MapPin, Share2, Star } from "lucide-react";
import type { FunctionComponent } from "react";
import { useTranslations } from "next-intl";

interface StoreData {
  name: string;
  address: string;
  notes: string;
  coordinates: [number, number];
  distance?: string;
}

export interface StoreListProps {
  stores: StoreData[];
  onSelectStore: (store: StoreData) => void;
  selectedStore: StoreData | null;
  isFavorite: (name: string) => boolean;
  toggleFavorite: (name: string) => void;
  onShare: (store: StoreData) => void;
  className?: string;
  onClose?: () => void;
  variant?: "default" | "compact";
}

export const StoreList: FunctionComponent<StoreListProps> = ({
  stores,
  onSelectStore,
  selectedStore,
  isFavorite,
  toggleFavorite,
  onShare,
  className,
  onClose,
  variant = "default",
}) => {
  const isCompact = variant === "compact";
  const t = useTranslations("StoreList");

  if (stores.length === 0) {
    return (
      <div
        className={cn(
          "p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl",
          className
        )}
      >
        <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t("empty_title")}
        </h3>
        <p className="text-sm mt-1">{t("empty_body")}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800",
        className
      )}
    >
      <div className={cn("space-y-2 py-3", isCompact && "space-y-1.5")}>
        {stores.map((store) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            key={store.name}
            className={cn(
              "group relative rounded-xl cursor-pointer transition-all border shadow-sm hover:shadow-md",
              isCompact ? "p-3" : "p-4",
              selectedStore?.name === store.name
                ? "bg-primary/5 border-primary/50 ring-1 ring-primary/20"
                : "bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
            )}
            onClick={() => {
              onSelectStore(store);
              onClose?.();
            }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-base line-clamp-1 transition-colors",
                    selectedStore?.name === store.name
                      ? "text-primary"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {store.name}
                </h3>
                <div className="flex items-start mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0 text-gray-400" />
                  <p className="line-clamp-2 leading-relaxed">
                    {store.address}
                  </p>
                </div>
                {store.distance && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {store.distance} {t("distance_suffix")}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col gap-1 transition-opacity",
                  isCompact
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                )}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(store.name);
                  }}
                  className={cn(
                    "p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                    isFavorite(store.name)
                      ? "text-yellow-400 opacity-100"
                      : "text-gray-400"
                  )}
                  title={
                    isFavorite(store.name)
                      ? t("remove_favorite")
                      : t("add_favorite")
                  }
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      isFavorite(store.name) && "fill-current"
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(store);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title={t("share_store")}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
