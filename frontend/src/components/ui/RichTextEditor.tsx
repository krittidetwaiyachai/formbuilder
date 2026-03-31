import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useTranslation } from "react-i18next";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline as UnderlineIcon } from
"lucide-react";
import { LinkDialog } from "@/components/ui/LinkDialog";
import { useToast } from "@/components/ui/toaster";
import "./RichTextEditor.css";
interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}
const normalizeLinkUrl = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return "";
  }
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  return `https://${trimmedUrl}`;
};
const extensions = [
StarterKit.configure({
  link: false,
  underline: false
}),
Underline,
TextAlign.configure({
  types: ["heading", "paragraph"]
}),
Link.configure({
  openOnClick: true,
  HTMLAttributes: {
    class: "text-blue-600 underline cursor-pointer",
    target: "_blank",
    rel: "noopener noreferrer"
  }
})];
export const RichTextEditor = ({
  value,
  onChange,
  readOnly = false,
  className = "",
  minHeight = "120px"
}: RichTextEditorProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [pendingLinkValue, setPendingLinkValue] = useState("");
  const [linkSelection, setLinkSelection] = useState<{
    from: number;
    to: number;
    empty: boolean;
  } | null>(null);
  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3 ${className}`,
        style: `min-height: ${minHeight}`
      },
      handleKeyDown: (view, event) => {
        if (event.key !== " " && event.code !== "Space" || !view.state.selection.empty) {
          return false;
        }
        const { state } = view;
        const linkMark = state.schema.marks.link;
        if (!linkMark) {
          return false;
        }
        const cursorMarks = state.selection.$from.marks();
        const nodeBeforeMarks = state.selection.$from.nodeBefore?.marks ?? [];
        const storedMarks = state.storedMarks ?? [];
        const hasActiveLinkContext = [
        ...cursorMarks,
        ...nodeBeforeMarks,
        ...storedMarks].
        some((mark) => mark.type === linkMark);
        if (!hasActiveLinkContext) {
          return false;
        }
        event.preventDefault();
        const transaction = state.tr;
        transaction.setStoredMarks([]);
        transaction.insertText(" ", state.selection.from, state.selection.to);
        view.dispatch(transaction);
        return true;
      }
    }
  });
  useEffect(() => {
    if (!editor || value === undefined) {
      return;
    }
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);
  if (!editor) {
    return null;
  }
  const handleInsertLink = () => {
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast({
        title: t("builder.link.select_text_title"),
        description: t("builder.link.select_text_description"),
        variant: "warning",
        duration: 2500
      });
      return;
    }
    setLinkSelection({ from, to, empty });
    setPendingLinkValue(editor.getAttributes("link").href || "");
    setIsLinkDialogOpen(true);
  };
  const handleLinkConfirm = (url: string) => {
    const normalizedUrl = normalizeLinkUrl(url);
    if (!normalizedUrl || !linkSelection || linkSelection.empty) {
      setIsLinkDialogOpen(false);
      return;
    }
    editor.
    chain().
    focus().
    setTextSelection({ from: linkSelection.from, to: linkSelection.to }).
    extendMarkRange("link").
    setLink({ href: normalizedUrl }).
    run();
    editor.
    chain().
    focus().
    setTextSelection(linkSelection.to).
    unsetMark("link").
    run();
    setIsLinkDialogOpen(false);
  };
  const handleLinkCancel = () => {
    setIsLinkDialogOpen(false);
  };
  const ToolbarButton = ({
    isActive,
    onClick,
    children,
    title
  }: {isActive?: boolean;onClick: () => void;children: React.ReactNode;title?: string;}) =>
  <button
    type="button"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
    isActive ? "bg-gray-300 text-black" : "hover:bg-gray-200 text-gray-600"}`
    }
    title={title}
    disabled={readOnly}>
      {children}
    </button>;
  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black ${
      readOnly ? "bg-gray-50" : ""}`
      }
      style={{ minHeight }}>
      {!readOnly &&
      <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap items-center gap-1 select-none">
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline">
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right">
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justify">
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List">
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List">
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
            onClick={handleInsertLink}
            isActive={editor.isActive("link")}
            title="Link">
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      }
      <EditorContent
        editor={editor}
        className={`prose-sm p-0 ${
        readOnly ? "cursor-not-allowed text-gray-500" : "cursor-text"}`
        } />
      <LinkDialog
        isOpen={isLinkDialogOpen}
        initialValue={pendingLinkValue}
        onConfirm={handleLinkConfirm}
        onCancel={handleLinkCancel} />
    </div>);
};