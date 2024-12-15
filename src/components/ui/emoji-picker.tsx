import React from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-4 h-4 hover:bg-secondary/80 p-2 rounded-full transition-colors" variant="ghost" size="sm">
          😀
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Picker
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="light"
        />
      </PopoverContent>
    </Popover>
  );
}; 