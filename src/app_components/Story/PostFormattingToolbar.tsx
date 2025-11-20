import React from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, MapPin, Tag, Clock, Globe, SmilePlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Only keep special actions that Tiptap doesn't handle
export type FormattingAction =
  | "add-media"
  | "location"
  | "tag"
  | "feeling"
  | "privacy"
  | "schedule";

interface PostFormattingToolbarProps {
  onAction?: (action: FormattingAction) => void;
  activeActions?: FormattingAction[];
  className?: string;
}

export default function PostFormattingToolbar({
  onAction,
  activeActions = [],
  className = "",
}: PostFormattingToolbarProps) {
  const tools = [
    {
      icon: <ImageIcon size={18} />,
      action: "add-media" as const,
      tooltip: "Add Photo/Video",
      onClick: () => onAction?.("add-media"),
      isActive: activeActions.includes("add-media"),
    },
    {
      icon: <MapPin size={18} />,
      action: "location" as const,
      tooltip: "Add Location",
      onClick: () => onAction?.("location"),
      isActive: activeActions.includes("location"),
    },
    {
      icon: <Tag size={18} />,
      action: "tag" as const,
      tooltip: "Tag People",
      onClick: () => onAction?.("tag"),
      isActive: activeActions.includes("tag"),
    },
    {
      icon: <SmilePlus size={18} />,
      action: "feeling" as const,
      tooltip: "Feeling/Activity",
      onClick: () => onAction?.("feeling"),
      isActive: activeActions.includes("feeling"),
    },
    {
      icon: <Globe size={18} />,
      action: "privacy" as const,
      tooltip: "Privacy",
      onClick: () => onAction?.("privacy"),
      isActive: activeActions.includes("privacy"),
    },
    {
      icon: <Clock size={18} />,
      action: "schedule" as const,
      tooltip: "Schedule Post",
      onClick: () => onAction?.("schedule"),
      isActive: activeActions.includes("schedule"),
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-md my-2 ${className}`}
    >
      <span className="text-xs font-medium text-muted-foreground mr-1">
        Quick actions
      </span>
      <TooltipProvider>
        {tools.map((tool) => (
          <Tooltip key={tool.action}>
            <TooltipTrigger asChild={true}>
              <Button
                variant={tool.isActive ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={tool.onClick}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
