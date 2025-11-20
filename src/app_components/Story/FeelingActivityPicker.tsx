import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus, X } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeelingActivityPickerProps {
  feeling: string;
  activity: string;
  onSelect: (type: "feeling" | "activity", value: string) => void;
}

const FEELINGS = [
  "😊 Happy",
  "😢 Sad",
  "😎 Cool",
  "😍 Loved",
  "🤔 Thoughtful",
  "😴 Sleepy",
  "😡 Angry",
  "😂 Amused",
];

const ACTIVITIES = [
  "🏃 Running",
  "🍽️ Eating",
  "📚 Studying",
  "🎮 Gaming",
  "🎬 Watching",
  "🎵 Listening",
  "✈️ Traveling",
  "🏋️ Working out",
];

export default function FeelingActivityPicker({
  feeling,
  activity,
  onSelect,
}: FeelingActivityPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: "feeling" | "activity", value: string) => {
    onSelect(type, value);
    setOpen(false);
  };

  const clearSelection = () => {
    onSelect("feeling", "");
    onSelect("activity", "");
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {feeling || activity ? (
        <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
          <span>{feeling || activity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={clearSelection}
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild={true}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
            >
              <SmilePlus size={14} />
              Feeling/Activity
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80">
            <Tabs defaultValue="feeling">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="feeling">Feeling</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="feeling" className="p-2">
                <ScrollArea className="h-60">
                  <div className="grid grid-cols-2 gap-2">
                    {FEELINGS.map((item) => (
                      <Button
                        key={item}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleSelect("feeling", item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="activity" className="p-2">
                <ScrollArea className="h-60">
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITIES.map((item) => (
                      <Button
                        key={item}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => handleSelect("activity", item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
