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
        <Button variant="ghost" size="sm">
          {/* <Smile className="w-5 h-5" /> */}
          icon
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