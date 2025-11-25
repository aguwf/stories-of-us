import {
  Clock,
  Heart,
  Navigation2,
  Share2,
  Star,
} from "lucide-react";
import type { FunctionComponent } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { gradientClasses } from "@/utils/constants";
import { LocationForm } from "../../_components/Map/LocationForm";
import type { StoreData } from "./types";

interface StoreSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newLocationCoordinates: [number, number] | null;
  onSubmitLocation: (data: Partial<StoreData>) => void;
  onCancelLocation: () => void;
  selectedStore: StoreData | null;
  onToggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
  onDirections: () => void;
  onShare: (store: StoreData) => void;
}

export const StoreSheet: FunctionComponent<StoreSheetProps> = ({
  isOpen,
  onOpenChange,
  newLocationCoordinates,
  onSubmitLocation,
  onCancelLocation,
  selectedStore,
  onToggleFavorite,
  isFavorite,
  onDirections,
  onShare,
}) => (
  <Sheet open={isOpen} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      className="h-auto max-h-[80vh] overflow-y-auto"
    >
      <div className="p-4">
        {newLocationCoordinates ? (
          <LocationForm onSubmit={onSubmitLocation} onCancel={onCancelLocation} />
        ) : selectedStore ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedStore.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedStore.address}
                </p>
              </div>
              <button
                onClick={() => onToggleFavorite(selectedStore.name)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isFavorite(selectedStore.name)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  )}
                />
              </button>
            </div>

            {selectedStore.images && selectedStore.images.length > 0 && (
              <div className="mb-4 rounded-lg overflow-hidden h-48 w-full relative">
                <img
                  src={selectedStore.images[0]}
                  alt={selectedStore.name}
                  className="object-cover w-full h-full"
                />
                <div className={`absolute inset-0 ${gradientClasses.orange}`} />
              </div>
            )}

            <div className="space-y-4">
              {selectedStore.openingHours && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{selectedStore.openingHours}</span>
                </div>
              )}

              {selectedStore.rating && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{selectedStore.rating} / 5.0</span>
                </div>
              )}

              {selectedStore.tags && (
                <div className="flex flex-wrap gap-2">
                  {selectedStore.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {selectedStore.notes}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={onDirections}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Navigation2 className="w-4 h-4" />
                  Directions
                </button>
                <button
                  onClick={() => onShare(selectedStore)}
                  className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </SheetContent>
  </Sheet>
);
