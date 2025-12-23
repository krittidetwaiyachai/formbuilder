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
  const [htmlContent] = useState({ __html: field.label || 'This is a paragraph. Click to edit.' });

  // Sync effect is less critical here since we use onBlur to save, 
  // but if properties panel updates checking, we might want to update preview.
  // However, for contentEditable, direct prop update re-renders can reset cursor position.
  // So we avoid re-setting innerHTML while editing if possible.
  
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
        if (editorRef.current.innerHTML !== field.label) {
             // Only update if significantly different to avoid cursor jumps?
             // Actually, for a pure paragraph field, syncing from properties panel (Textarea) 
             // needs to update this view.
             editorRef.current.innerHTML = field.label || '';
        }
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
          className={`text-sm text-black leading-relaxed outline-none cursor-text min-h-[1.5em] ${isSelected ? 'p-2 border border-dashed border-gray-300 rounded' : ''}`}
          style={{ 
            pointerEvents: 'auto', 
            userSelect: 'text', 
            WebkitUserSelect: 'text',
          }}
          dangerouslySetInnerHTML={htmlContent}
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
