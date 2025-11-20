import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { useState } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface LocationPickerProps {
  location: string;
  onLocationChange: (location: string, lat?: number, lng?: number) => void;
}

export default function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(location);
  
  const handleSave = () => {
    onLocationChange(inputValue);
    setOpen(false);
  };
  
  const clearLocation = () => {
    onLocationChange("");
    setInputValue("");
  };
  
  return (
    <div className="flex items-center gap-2 mt-2">
      {location ? (
        <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
          <MapPin size={14} />
          <span>{location}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0" 
            onClick={clearLocation}
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
              <MapPin size={14} />
              Add location
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Add a location</h4>
              <Input 
                placeholder="Enter location" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}