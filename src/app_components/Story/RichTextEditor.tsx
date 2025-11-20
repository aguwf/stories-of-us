import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import PostFormattingToolbar, {
  type FormattingAction,
} from "./PostFormattingToolbar";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSpecialAction?: (action: FormattingAction) => void;
  activeActions?: FormattingAction[];
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "What's on your mind?",
  onSpecialAction,
  activeActions = [],
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Standard text formatting tools
  const textFormatTools = [
    {
      icon: <Bold size={16} />,
      tooltip: "Bold",
      onClick: () => editor?.chain().focus().toggleBold().run(),
      isActive: editor?.isActive("bold"),
    },
    {
      icon: <Italic size={16} />,
      tooltip: "Italic",
      onClick: () => editor?.chain().focus().toggleItalic().run(),
      isActive: editor?.isActive("italic"),
    },
    {
      icon: <List size={16} />,
      tooltip: "Bullet List",
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: editor?.isActive("bulletList"),
    },
    {
      icon: <ListOrdered size={16} />,
      tooltip: "Numbered List",
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: editor?.isActive("orderedList"),
    },
    {
      icon: <LinkIcon size={16} />,
      tooltip: "Add Link",
      onClick: () => {
        const url = window.prompt("URL");
        if (url) {
          editor?.chain().focus().setLink({ href: url }).run();
        } else if (editor?.isActive("link")) {
          editor?.chain().focus().unsetLink().run();
        }
      },
      isActive: editor?.isActive("link"),
    },
  ];

  return (
    <div className="border rounded-md">
      {/* Text formatting toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-md border-b">
        <TooltipProvider>
          {textFormatTools.map((tool, index) => (
            <Tooltip key={index + tool.tooltip}>
              <TooltipTrigger asChild={true}>
                <Button
                  variant={tool.isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={tool.onClick}
                  disabled={!editor}
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

      {/* Custom post formatting toolbar for special actions */}
      <PostFormattingToolbar
        onAction={onSpecialAction}
        activeActions={activeActions}
      />

      {/* Editor content area */}
      <div className={`px-3 py-2 min-h-[120px] ${className}`}>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none h-full"
        />
      </div>
    </div>
  );
}
