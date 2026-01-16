import React from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { RichTextToolbar } from '@/components/ui/RichTextToolbar';

interface ParagraphFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    iconColor: string;
    bgGradient: string;
    inputBorder: string;
    overlayBorder: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string, autoFocus?: boolean) => void;
}

export const ParagraphField: React.FC<ParagraphFieldProps> = ({ 
  field, 

  isSelected = false,
  onSelect
}) => {
  const updateField = useFormStore((state) => state.updateField);
  
  const modules = React.useMemo(() => ({
    toolbar: {
      container: `#toolbar-${field.id}`,
    }
  }), [field.id]);

  // Render content safely
  const htmlContent = { __html: field.label || 'This is a paragraph. Click to edit.' };




  return (
    <div 
      className={`relative w-full transition-all duration-200 group
        ${isSelected ? '' : 'border-transparent hover:border-gray-200'}
        ${isSelected ? 'cursor-default' : 'cursor-pointer'}
        rounded-lg
      `}
        onClick={(e) => {
             e.stopPropagation();
             if (onSelect && !isSelected) {
                 onSelect(field.id);
             }
        }}
    > 
        {isSelected && (
          <div className="absolute -top-12 left-0 right-0 z-[60] flex justify-center">
             <RichTextToolbar id={`toolbar-${field.id}`} />
          </div>
        )}

        {isSelected ? (
           <div className="relative group/editor">
             <RichTextEditor
                theme="snow"
                value={field.label}
                onChange={(value) => updateField(field.id, { label: value })}
                placeholder="Type '/' for commands"
                modules={modules}
                className="text-sm text-black leading-relaxed borderless animate-slide-down min-h-32"
             />
           </div>
        ) : (
          <div
            className={`text-sm text-black leading-relaxed outline-none min-h-[1.5em] ql-editor !p-0`}
            dangerouslySetInnerHTML={htmlContent}
          />
        )}
    </div>
  );
};
