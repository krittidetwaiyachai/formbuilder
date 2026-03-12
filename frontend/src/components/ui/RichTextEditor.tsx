import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Type } from
"lucide-react";
import { useEffect } from "react";
import "./RichTextEditor.css";
interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}
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
      }
    }
  });
  useEffect(() => {
    if (editor && value !== undefined) {
      if (editor.getHTML() !== value) {
        if (editor.isEmpty) {
          editor.commands.setContent(value);
        } else {
          const currentSelection = editor.state.selection;
          editor.commands.setContent(value);
        }
      }
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
  const ToolbarButton = ({
    isActive,
    onClick,
    children,
    title
  }: {isActive?: boolean;onClick: () => void;children: React.ReactNode;title?: string;}) =>
  <button
    type="button"
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
    isActive ? "bg-gray-300 text-black" : "hover:bg-gray-200 text-gray-600"}`
    }
    title={title}
    disabled={readOnly}>
      {children}    </button>;
  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black ${readOnly ? "bg-gray-50" : ""}`}
      style={{ minHeight }}>
      {!readOnly &&
      <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap items-center gap-1 select-none">          {}          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">            <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold">
              <Bold className="w-4 h-4" />            </ToolbarButton>            <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic">
              <Italic className="w-4 h-4" />            </ToolbarButton>            <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline">
              <UnderlineIcon className="w-4 h-4" />            </ToolbarButton>          </div>          {}          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">            <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left">
              <AlignLeft className="w-4 h-4" />            </ToolbarButton>            <ToolbarButton
            onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
            }
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center">
              <AlignCenter className="w-4 h-4" />            </ToolbarButton>            <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right">
              <AlignRight className="w-4 h-4" />            </ToolbarButton>            <ToolbarButton
            onClick={() =>
            editor.chain().focus().setTextAlign("justify").run()
            }
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justify">
              <AlignJustify className="w-4 h-4" />            </ToolbarButton>          </div>          {}          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">            <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List">
              <List className="w-4 h-4" />            </ToolbarButton>            <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List">
              <ListOrdered className="w-4 h-4" />            </ToolbarButton>          </div>          {}          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">            <ToolbarButton
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href;
              const url = window.prompt("URL", previousUrl);
              if (url === null) return;
              if (url === "") {
                editor.
                chain().
                focus().
                extendMarkRange("link").
                unsetLink().
                run();
                return;
              }
              editor.
              chain().
              focus().
              extendMarkRange("link").
              setLink({ href: url }).
              run();
            }}
            isActive={editor.isActive("link")}
            title="Link">
              <LinkIcon className="w-4 h-4" />            </ToolbarButton>          </div>          {}          {}        </div>
      }      <EditorContent
        editor={editor}
        className={`prose-sm p-0 ${readOnly ? "cursor-not-allowed text-gray-500" : "cursor-text"}`} />
    </div>);
};