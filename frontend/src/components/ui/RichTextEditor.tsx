import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Type } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  readOnly = false,
  className = '',
  minHeight = '120px'
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3 ${className}`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync value changes if external value changes (and is different)
  useEffect(() => {
    if (editor && value !== undefined) {
       // Only update if the content is different to avoid cursor jumps / loops
       // We compare specific HTML to avoid issues with formatting differences
       if (editor.getHTML() !== value) {
          // If the editor is empty, we can safely set content
          if (editor.isEmpty) {
              editor.commands.setContent(value);
          } else {
              // If not empty, we need to be careful.
              // For a form field, usually the value comes from us typing, so it should match.
              // If it doesn't match, it means the parent forced a change (e.g. reset).
              // We should try to preserve cursor position if possible, or just set content.
              // For now, simple setContent is safer than not updating.
              const currentSelection = editor.state.selection;
              editor.commands.setContent(value);
              // Try to restore selection? (Might be tricky if text changed)
          }
       }
    }
  }, [value, editor]);

  // Handle readOnly updates
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
  }: { 
    isActive?: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        isActive 
          ? 'bg-gray-300 text-black' 
          : 'hover:bg-gray-200 text-gray-600'
      }`}
      title={title}
      disabled={readOnly}
    >
      {children}
    </button>
  );

  return (
    <div 
        className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black ${readOnly ? 'bg-gray-50' : ''}`}
        style={{ minHeight }}
    >
      {!readOnly && (
        <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap items-center gap-1 select-none">
          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Link */}
          <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
            <ToolbarButton
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              isActive={editor.isActive('link')}
              title="Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
          
           {/* Font Size (Native TipTap doesn't support font size well out of box without extra plugins, keeping simple for now or using Heading levels) */}
           {/* For now, ignoring Font Size dropdown to keep it clean as per StarterKit limits, or we could map to Headings if desired. 
               User asked for Modern Standard, which usually avoids arbitrary font sizes in Web Editors in favor of semantic HTML. 
               Let's keep it clean. */}
        </div>
      )}

      <EditorContent editor={editor} className={`prose-sm p-0 ${readOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-text'}`} />
    </div>
  );
};
