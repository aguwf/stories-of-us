import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { StoreLocation } from "@/types/map.types";
import { useState, type FunctionComponent } from "react";

interface LocationFormProps {
  initialData?: Partial<StoreLocation>;
  onSubmit: (data: Partial<StoreLocation>) => void;
  onCancel: () => void;
  className?: string;
}

export const LocationForm: FunctionComponent<LocationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className,
}) => {
  const [formData, setFormData] = useState<Partial<StoreLocation>>({
    name: "",
    address: "",
    notes: "",
    openingHours: "",
    price: 1,
    tags: [],
    amenities: [],
    ...initialData,
  });

  const [tagInput, setTagInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (price: number) => {
    setFormData((prev) => ({ ...prev, price: price as 1 | 2 | 3 | 4 }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full",
        className
      )}
    >
      <h3 className="text-lg font-semibold">
        {initialData ? "Edit Location" : "Add New Location"}
      </h3>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Store Name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Full Address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Description / Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Describe the place..."
        />
      </div>

      <div className="space-y-2">
        <Label>Price Level</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => handlePriceChange(price)}
              className={cn(
                "flex-1 py-1.5 px-2 text-sm rounded-md border transition-all",
                formData.price === price
                  ? "bg-green-50 border-green-200 text-green-700 font-medium dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
              )}
            >
              {"$".repeat(price)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag (e.g. Wifi)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-600 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? "Save Changes" : "Add Location"}
        </Button>
      </div>
    </form>
  );
};
