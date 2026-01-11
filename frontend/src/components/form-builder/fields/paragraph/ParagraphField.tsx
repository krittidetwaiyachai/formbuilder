import React, { useRef, useState, useEffect } from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';

interface ParagraphFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string, autoFocus?: boolean) => void;
  disabledClass?: string;
}

export const ParagraphField: React.FC<ParagraphFieldProps> = ({ 
  field, 
  fieldStyle: _fieldStyle, 
  isSelected, 
  onSelect,
  disabledClass: _disabledClass = "opacity-60 cursor-pointer" 
}) => {
  const updateField = useFormStore((state) => state.updateField);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initial content
  const [htmlContent, setHtmlContent] = useState({ __html: field.label || 'This is a paragraph. Click to edit.' });

  // Sync effect safely
  useEffect(() => {
    const currentText = editorRef.current?.innerHTML; // Use innerHTML for paragraph rich text structure? Or textContent? 
    // Wait, Paragraph uses innerHTML in dangerouslySetInnerHTML.
    // Ideally we should sync innerHTML. but browsers change HTML structure (e.g. adding <div> or <br>).
    // Let's stick to simple text sync if possible, OR if it's rich text, we need to be careful.
    // Given the previous code used innerHTML, let's try to match that.
    
    // Safety check: only update if prop is different from what is rendered
    if (editorRef.current && currentText !== field.label) {
         setHtmlContent({ __html: field.label || '' });
    }
  }, [field.label]);

  const options = field.options || {};
  const { shrink, moveToNewLine } = options;

  return (
    <div 
        className={`relative ${shrink ? 'max-w-md' : 'w-full'} ${moveToNewLine ? 'clear-both' : ''}`}
        onClick={(e) => {
             e.stopPropagation();
             if (onSelect && !isSelected) {
                 onSelect(field.id);
             }
        }}
    >
        <div
          ref={editorRef}
          contentEditable={isSelected}
          suppressContentEditableWarning
          spellCheck={false}
          className={`text-sm text-black leading-relaxed outline-none cursor-text min-h-[1.5em] ${isSelected ? 'p-2 border border-dashed border-gray-300 rounded' : ''}`}
          style={{ 
            pointerEvents: 'auto', 
            userSelect: 'text', 
            WebkitUserSelect: 'text',
          }}
          dangerouslySetInnerHTML={htmlContent}
          onInput={(e) => {
             const newHtml = e.currentTarget.innerHTML; 
             updateField(field.id, { label: newHtml });
          }}
          onBlur={(e) => {
             const newHtml = e.currentTarget.innerHTML;
             if (newHtml !== field.label) {
               updateField(field.id, { label: newHtml });
             }
          }}
          onKeyDown={(e) => {
             // Allow normal typing, Enter for new line etc.
             // Maybe stop propagation to prevent deleting the field when backspacing empty?
             e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
        {field.label === '' && isSelected && (
            <div className="absolute top-2 left-2 text-gray-400 pointer-events-none italic">
                Empty paragraph...
            </div>
        )}
    </div>
  );
};
