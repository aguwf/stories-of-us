"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { StoreLocation } from "@/types/map.types";
import { useTranslations } from "next-intl";
import { useEffect, useState, type FunctionComponent } from "react";

const defaultFormState: Partial<StoreLocation> = {
  name: "",
  address: "",
  notes: "",
  openingHours: "",
  price: 2,
  tags: [],
  amenities: [],
  popularity: 50,
  images: [],
  rating: undefined,
};

interface LocationFormProps {
  initialData?: Partial<StoreLocation>;
  onSubmit: (data: Partial<StoreLocation> & { reason?: string }) => void;
  onCancel: () => void;
  coordinates?: [number, number] | null;
  className?: string;
  onCheckDuplicates?: (input: {
    name: string;
    lat: number;
    lng: number;
    excludeId?: number;
  }) => void | Promise<void>;
  duplicateMatches?: Array<{
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    status: string;
  }>;
  isCheckingDuplicates?: boolean;
  excludeId?: number;
  showReasonField?: boolean;
}

export const LocationForm: FunctionComponent<LocationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  coordinates,
  className,
  onCheckDuplicates,
  duplicateMatches,
  isCheckingDuplicates,
  excludeId,
  showReasonField,
}) => {
  const t = useTranslations("LocationForm");

  const [formData, setFormData] = useState<Partial<StoreLocation>>({
    ...defaultFormState,
    ...initialData,
    tags: initialData?.tags ?? defaultFormState.tags,
    amenities: initialData?.amenities ?? defaultFormState.amenities,
    images: initialData?.images ?? defaultFormState.images,
    price: initialData?.price ?? defaultFormState.price,
    popularity: initialData?.popularity ?? defaultFormState.popularity,
  });

  const [tagInput, setTagInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setFormData(() => ({
      ...defaultFormState,
      ...initialData,
      tags: initialData?.tags ?? defaultFormState.tags,
      amenities: initialData?.amenities ?? defaultFormState.amenities,
      images: initialData?.images ?? defaultFormState.images,
      price: initialData?.price ?? defaultFormState.price,
      popularity: initialData?.popularity ?? defaultFormState.popularity,
    }));
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const numericFields = ["rating", "popularity"];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === ""
          ? undefined
          : Number(value)
        : value,
    }));
  };

  const handlePriceChange = (price: number) => {
    setFormData((prev) => ({ ...prev, price: price as 1 | 2 | 3 | 4 }));
  };

  const addListItems = (
    rawValue: string,
    field: "tags" | "amenities" | "images"
  ) => {
    const items = rawValue
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!items.length) return;

    setFormData((prev) => {
      const existing = new Set([...(prev[field] ?? [])]);
      for (const item of items) {
        existing.add(item);
      }

      return {
        ...prev,
        [field]: Array.from(existing),
      };
    });
  };

  const handleAddTag = () => {
    addListItems(tagInput, "tags");
    setTagInput("");
  };

  const handleAddAmenity = () => {
    addListItems(amenityInput, "amenities");
    setAmenityInput("");
  };

  const handleAddImage = () => {
    addListItems(imageInput, "images");
    setImageInput("");
  };

  const removeItem = (
    value: string,
    field: "tags" | "amenities" | "images"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<StoreLocation> = {
      ...formData,
      rating:
        formData.rating !== undefined && formData.rating !== null
          ? Math.min(Math.max(Number(formData.rating), 0), 5)
          : undefined,
      popularity:
        formData.popularity !== undefined && formData.popularity !== null
          ? Math.min(Math.max(Number(formData.popularity), 0), 100)
          : undefined,
      images: formData.images?.filter(Boolean),
    };

    onSubmit({ ...payload, reason: reason.trim() || undefined });
  };

  const quickTags = [
    "Shopping",
    "Entertainment",
    "Cafe",
    "Wifi",
    "Parking",
  ] as const;
  const quickAmenities = [
    "Wifi",
    "Parking",
    "AC",
    "Restroom",
    "Food Court",
  ] as const;
  const getAmenityKey = (amenity: (typeof quickAmenities)[number]) =>
    amenity === "Food Court" ? "FoodCourt" : amenity;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-2xl w-full",
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">
          {initialData ? t("title_edit") : t("title_add")}
        </h3>
        {coordinates && (
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {t("pinned_spot")}
            </p>
            <p>
              {coordinates[1].toFixed(5)}, {coordinates[0].toFixed(5)}
            </p>
            {onCheckDuplicates && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2 h-auto px-0 text-xs text-primary underline-offset-4 hover:underline"
                isLoading={isCheckingDuplicates}
                onClick={() =>
                  onCheckDuplicates({
                    name: formData.name ?? "",
                    lat: coordinates[1],
                    lng: coordinates[0],
                    excludeId,
                  })
                }
              >
                {t("check_duplicates") || "Check duplicates"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required={true}
            placeholder={t("name_placeholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{t("address")}</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required={true}
            placeholder={t("address_placeholder")}
          />
        </div>
      </div>

      {duplicateMatches && duplicateMatches.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-100">
          <p className="font-semibold">
            {t("duplicate_warning_title") || "Possible duplicates nearby"}
          </p>
          <ul className="mt-2 space-y-1">
            {duplicateMatches.map((dup) => (
              <li key={dup.id} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                <div>
                  <p className="font-medium">
                    #{dup.id} — {dup.name}
                  </p>
                  <p className="text-amber-800 dark:text-amber-100/80">
                    {dup.address} ({dup.lat.toFixed(5)}, {dup.lng.toFixed(5)}) ·{" "}
                    {dup.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showReasonField && (
        <div className="space-y-2">
          <Label htmlFor="reason">{t("change_reason") || "Reason / context"}</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              t("change_reason_placeholder") || "What needs to change or why?"
            }
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="openingHours">{t("opening_hours")}</Label>
          <Input
            id="openingHours"
            name="openingHours"
            value={formData.openingHours}
            onChange={handleChange}
            placeholder={t("opening_hours_placeholder")}
          />
          <p className="text-xs text-gray-500">{t("opening_hours_help")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">{t("rating")}</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={formData.rating ?? ""}
            onChange={handleChange}
            placeholder={t("rating_placeholder")}
          />
          <p className="text-xs text-gray-500">{t("rating_help")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder={t("notes_placeholder")}
        />
      </div>

      <div className="space-y-3">
        <Label>{t("budget")}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => handlePriceChange(price)}
              className={cn(
                "flex-1 py-2 px-2 text-sm rounded-md border transition-all",
                formData.price === price
                  ? "bg-green-50 border-green-200 text-green-700 font-medium dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              )}
            >
              {"$".repeat(price)}
              <span className="ml-1 text-xs text-gray-500">
                {price === 1
                  ? t("budget_low")
                  : price === 4
                  ? t("budget_high")
                  : t("budget_mid")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t("tags")}</Label>
            <p className="text-xs text-gray-500">{t("tags_quick_fill")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => addListItems(tag, "tags")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  formData.tags?.includes(tag)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                )}
              >
                {t(`quick_tags.${tag}`)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={t("tags_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              {t("add")}
            </Button>
          </div>
          <p className="text-xs text-gray-500">{t("tags_help")}</p>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeItem(tag, "tags")}
                  className="hover:text-blue-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t("amenities")}</Label>
            <p className="text-xs text-gray-500">{t("amenities_help")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAmenities.map((amenity) => (
              <button
                type="button"
                key={amenity}
                onClick={() => addListItems(amenity, "amenities")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  formData.amenities?.includes(amenity)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 hover:bg-emerald-50 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                )}
              >
                {t(`quick_amenities.${getAmenityKey(amenity)}`)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              placeholder={t("amenities_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAmenity();
                }
              }}
            />
            <Button type="button" onClick={handleAddAmenity} variant="outline">
              {t("add")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities?.map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeItem(amenity, "amenities")}
                  className="hover:text-emerald-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("images")}</Label>
          <div className="flex gap-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder={t("images_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
            <Button type="button" onClick={handleAddImage} variant="outline">
              {t("add")}
            </Button>
          </div>
          <p className="text-xs text-gray-500">{t("images_help")}</p>
          <div className="flex flex-wrap gap-2">
            {formData.images?.map((image) => (
              <span
                key={image}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center gap-1"
              >
                {image.length > 24 ? `${image.slice(0, 24)}...` : image}
                <button
                  type="button"
                  onClick={() => removeItem(image, "images")}
                  className="hover:text-purple-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="popularity">{t("popularity")}</Label>
            <input
              id="popularity"
              name="popularity"
              type="range"
              min={0}
              max={100}
              value={formData.popularity ?? 0}
              onChange={handleChange}
              className="w-full accent-purple-600"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {t("popularity_label", { value: formData.popularity ?? 0 })}
              </span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          {t("cancel")}
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? t("save_changes") : t("add_location")}
        </Button>
      </div>
    </form>
  );
};
