'use client';
import { Clock, Heart, Navigation2, Share2, Star } from "lucide-react";
import type { FunctionComponent } from "react";
import { useTranslations } from "next-intl";
import type { RouterOutputs } from "@/trpc/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { gradientClasses } from "@/utils/constants";
import { LocationForm } from "../../_components/Map/LocationForm";
import type { StoreLocation } from "@/types/map.types";
import type { StoreData } from "./types";

type DuplicateMatch = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
};

type Submission = RouterOutputs["location"]["getSubmissions"][number];

interface StoreSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newLocationCoordinates: [number, number] | null;
  onSubmitLocation: (data: Partial<StoreLocation>) => void;
  onCancelLocation: () => void;
  selectedStore: StoreData | null;
  onToggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
  onDirections: () => void;
  onShare: (store: StoreData) => void;
  onStartEdit: (store: StoreData) => void;
  editingLocation: StoreData | null;
  onSubmitEdit: (data: Partial<StoreLocation> & { reason?: string }) => void;
  onCancelEdit: () => void;
  duplicateMatches?: DuplicateMatch[];
  onCheckDuplicates?: (input: {
    name: string;
    lat: number;
    lng: number;
    excludeId?: number;
  }) => void | Promise<void>;
  isCheckingDuplicates?: boolean;
  submissionsForSelection?: Submission[];
  submissionsLoading?: boolean;
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
  onStartEdit,
  editingLocation,
  onSubmitEdit,
  onCancelEdit,
  duplicateMatches,
  onCheckDuplicates,
  isCheckingDuplicates,
  submissionsForSelection,
  submissionsLoading,
}) => {
  const t = useTranslations("StoreSheet");
  const mapT = useTranslations("Map");

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onCancelLocation();
      onCancelEdit();
    }
    onOpenChange(open);
  };

  const isFormMode = !!newLocationCoordinates || !!editingLocation;
  const formCoordinates =
    editingLocation?.coordinates ?? newLocationCoordinates ?? null;

  const initialEditData: Partial<StoreLocation> | undefined =
    editingLocation && formCoordinates
      ? {
          name: editingLocation.name,
          address: editingLocation.address,
          notes: editingLocation.notes,
          openingHours: editingLocation.openingHours,
          price: editingLocation.price,
          tags: editingLocation.tags,
          amenities: editingLocation.amenities,
          popularity: editingLocation.popularity,
          images: editingLocation.images,
          rating: editingLocation.rating,
        }
      : undefined;

  if (isFormMode) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader className="text-left">
            <DialogTitle>
              {editingLocation ? t("edit_title") || "Suggest an edit" : t("add_title")}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? t("edit_description") ||
                  "Submit your suggested changes for review"
                : t("add_description")}
            </DialogDescription>
          </DialogHeader>
          <LocationForm
            onSubmit={editingLocation ? onSubmitEdit : onSubmitLocation}
            onCancel={editingLocation ? onCancelEdit : onCancelLocation}
            coordinates={formCoordinates}
            initialData={initialEditData}
            className="shadow-none bg-transparent p-0 max-w-full"
            onCheckDuplicates={onCheckDuplicates}
            duplicateMatches={duplicateMatches}
            isCheckingDuplicates={isCheckingDuplicates}
            excludeId={editingLocation?.id}
            showReasonField={!!editingLocation}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[80vh] overflow-y-auto"
      >
        <div className="p-4">
          {selectedStore ? (
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
                    <span>
                      {selectedStore.rating} {t("rating_suffix")}
                    </span>
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
                    {mapT("directions")}
                  </button>
                <button
                  onClick={() => onShare(selectedStore)}
                  className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {mapT("share")}
                </button>
              </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => onStartEdit(selectedStore)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/60 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    {t("suggest_edit") || "Suggest edit"}
                  </button>
                </div>

                <div className="mt-4 space-y-2 rounded-md bg-muted/40 p-3 text-sm">
                  <p className="font-semibold">
                    {t("submission_history_title") || "Your submissions"}
                  </p>
                  {submissionsLoading ? (
                    <p className="text-muted-foreground">{t("loading")}</p>
                  ) : submissionsForSelection && submissionsForSelection.length > 0 ? (
                    <ul className="space-y-2">
                      {submissionsForSelection.map((submission) => (
                        <li
                          key={submission.id}
                          className="flex items-start justify-between rounded border bg-white/60 px-3 py-2 text-xs dark:bg-gray-900/40"
                        >
                          <div>
                            <p className="font-medium">
                              #{submission.id} · {submission.status}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleString()}
                            </p>
                            {submission.decisionNote && (
                              <p className="text-muted-foreground">
                                {t("moderator_note") || "Moderator note"}:{" "}
                                {submission.decisionNote}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                            {submission.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("no_submissions") || "No submissions for this place yet."}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};
