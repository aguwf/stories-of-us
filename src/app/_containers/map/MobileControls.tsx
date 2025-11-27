'use client';
import type { ComponentProps, FunctionComponent } from "react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { MapControls, StoreList } from "@/app/_components/Map";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Crosshair, Plus, Search, SlidersHorizontal, Star } from "lucide-react";

interface MobileControlsProps {
  mapControlsProps: ComponentProps<typeof MapControls>;
}

export const MobileControls: FunctionComponent<MobileControlsProps> = ({
  mapControlsProps,
}) => {
  const t = useTranslations("MobileControls");
  const mapT = useTranslations("Map");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    searchQuery,
    onSearchChange,
    showFavoritesOnly,
    onShowFavoritesChange,
    isFollowMode,
    onFollowModeChange,
    onAddLocation,
    isAddLocationMode,
    storeListProps,
  } = mapControlsProps;

  const mobileStoreListProps = useMemo(
    () => ({
      ...storeListProps,
      variant: "compact" as const,
    }),
    [storeListProps]
  );

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <>
      <div className="absolute inset-x-4 top-4 z-20 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("search_placeholder")}
            className="h-11 pl-9 rounded-full bg-white shadow-md border border-gray-200 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <button
          type="button"
          onClick={() => onShowFavoritesChange(!showFavoritesOnly)}
          className={cn(
            "h-11 w-11 rounded-full flex items-center justify-center shadow-md border transition-all",
            showFavoritesOnly
              ? "bg-yellow-100 border-yellow-300 text-yellow-700"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          )}
          aria-label={t("toggle_favorites")}
        >
          <Star
            className={cn("h-5 w-5", showFavoritesOnly && "fill-current")}
          />
        </button>
      </div>

      <div className="absolute inset-x-4 bottom-4 z-20 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onFollowModeChange(!isFollowMode)}
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-medium shadow-lg border transition-all",
            isFollowMode
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-700"
          )}
        >
          <Crosshair
            className={cn("h-5 w-5", isFollowMode && "animate-pulse")}
          />
          <span className="hidden sm:inline">{t("follow")}</span>
        </button>

        <button
          type="button"
          onClick={openSheet}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-semibold shadow-lg border border-gray-200 bg-white text-gray-800"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="hidden sm:inline">{t("explore")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAddLocation();
            if (!isAddLocationMode) setIsSheetOpen(true);
          }}
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-semibold shadow-lg border transition-all",
            isAddLocationMode
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-primary text-white border-primary/80"
          )}
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">
            {isAddLocationMode ? mapT("cancel_adding") : mapT("add_location")}
          </span>
        </button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-gray-200 dark:border-gray-800 p-0 pb-4 h-[82vh] max-h-[82vh] overflow-hidden"
        >
        <SheetHeader className="px-6 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
          <div className="mx-auto h-1 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          <SheetTitle className="text-center">{t("sheet_title")}</SheetTitle>
        </SheetHeader>
        <div className="h-full overflow-y-auto px-6 pt-4 pb-8 space-y-5">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-sm p-4">
              <MapControls
                {...mapControlsProps}
                onClose={closeSheet}
                isMobile={true}
                showSearch={false}
                showAddLocation={false}
                hideStoreList={true}
                className="shadow-none border-none bg-transparent p-0"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {mapT("store_list")}
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    {t("explore")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onShowFavoritesChange(!showFavoritesOnly)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                    showFavoritesOnly
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        showFavoritesOnly && "fill-current text-yellow-500"
                      )}
                    />
                  {mapT("favorites")}
                </button>
              </div>
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-inner">
                <StoreList
                  {...mobileStoreListProps}
                  className={cn("max-h-[60vh] px-3", storeListProps.className)}
                  onClose={closeSheet}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
