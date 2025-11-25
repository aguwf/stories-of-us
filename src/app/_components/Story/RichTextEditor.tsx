"use client";

import React from "react";
import {
  useEditor,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import PostFormattingToolbar, {
  type FormattingAction,
} from "./PostFormattingToolbar";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSpecialAction?: (action: FormattingAction) => void;
  activeActions?: FormattingAction[];
  className?: string;
  containerClassName?: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    data-active={isActive ? "true" : undefined}
    className="rounded-md border px-2 py-1 text-xs font-medium transition-colors data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 border-b bg-muted/30 px-3 py-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      >
        Bold
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      >
        Italic
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
      >
        Strike
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
      >
        Code
      </ToolbarButton>

      <span className="mx-1 inline-block h-6 w-px bg-border" aria-hidden={true} />

      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph")}
      >
        Paragraph
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
      >
        H3
      </ToolbarButton>

      <span className="mx-1 inline-block h-6 w-px bg-border" aria-hidden={true} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      >
        Bullet List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      >
        Numbered List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
      >
        Quote
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
      >
        Code Block
      </ToolbarButton>

      <span className="mx-1 inline-block h-6 w-px bg-border" aria-hidden={true} />

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        Horizontal Rule
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        Hard Break
      </ToolbarButton>

      <span className="mx-1 inline-block h-6 w-px bg-border" aria-hidden={true} />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        Undo
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        Redo
      </ToolbarButton>
    </div>
  );
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "What's on your mind?",
  onSpecialAction,
  activeActions = [],
  className = "",
  containerClassName = "",
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

  const handleLinkClick = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm",
        containerClassName
      )}
    >
      <MenuBar editor={editor} />

      <PostFormattingToolbar
        onAction={onSpecialAction}
        activeActions={activeActions}
        className="shrink-0 border-b bg-muted/10"
      />

      <div className="relative flex-1 overflow-hidden">
        {editor && (
          <BubbleMenu
            editor={editor}
            className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 shadow-md"
          >
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            >
              Bold
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            >
              Italic
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
            >
              Strike
            </ToolbarButton>
            <ToolbarButton
              onClick={handleLinkClick}
              isActive={editor.isActive("link")}
            >
              Link
            </ToolbarButton>
          </BubbleMenu>
        )}

        {editor && (
          <FloatingMenu
            editor={editor}
            className="flex flex-col gap-2 rounded-md border bg-background p-2 shadow-md"
          >
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
            >
              List
            </ToolbarButton>
          </FloatingMenu>
        )}

        <div className="px-3 py-2 min-h-[140px] overflow-auto">
          <EditorContent
            editor={editor}
            className={cn(
              "tiptap prose prose-sm max-w-none focus:outline-none",
              className
            )}
          />
        </div>
      </div>
    </div>
  );
}
