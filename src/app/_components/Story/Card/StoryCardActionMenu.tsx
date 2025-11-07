import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { Icon } from "../../common/Icon";
import { ICON_SIZE_LARGE } from "@/utils/constants";

export type ActionMenuKey = "copy" | "edit" | "delete" | "insertAfter";

export interface ActionMenuOption {
  key: ActionMenuKey;
  label: string;
  icon: React.ReactNode;
  color?: "danger";
}

interface StoryCardActionMenuProps {
  options: ActionMenuOption[];
  onActionSelect: (key: ActionMenuKey) => void;
  isDeleting: boolean;
}

const StoryCardActionMenu = memo<StoryCardActionMenuProps>(
  ({ options, onActionSelect, isDeleting }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-0 w-10 h-10"
          disabled={isDeleting}
          aria-label="Story actions"
        >
          <Icon className={ICON_SIZE_LARGE} name="menu-dots-outline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.key}
            className={cn(
              "flex items-center gap-2",
              option.color === "danger" && "text-destructive"
            )}
            onClick={() => onActionSelect(option.key)}
            disabled={isDeleting && option.key === "delete"}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
);

StoryCardActionMenu.displayName = "StoryCardActionMenu";

export default StoryCardActionMenu;
