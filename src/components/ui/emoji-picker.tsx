import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Smile } from "lucide-react";
import type React from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "./tooltip";

interface EmojiPickerProps {
	onEmojiSelect: (emoji: unknown) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
	return (
		<Popover>
			<Tooltip>
				<TooltipTrigger asChild>
					<PopoverTrigger asChild>
						<Button
							className="rounded-full text-muted-foreground hover:text-foreground transition-colors"
							variant="ghost"
							size="icon"
							aria-label="Add emoji"
						>
							<Smile className="w-5 h-5" />
						</Button>
					</PopoverTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Add emoji</p>
				</TooltipContent>
			</Tooltip>
			<PopoverContent className="w-80 p-0">
				<Picker data={data} onEmojiSelect={onEmojiSelect} theme="light" />
			</PopoverContent>
		</Popover>
	);
};
