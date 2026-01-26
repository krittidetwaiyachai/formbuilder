import React from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';

const RichTextEditor = React.lazy(() => import('@/components/ui/RichTextEditor').then(module => ({ default: module.RichTextEditor })));
import { RichTextToolbar } from '@/components/ui/RichTextToolbar';
import { sanitize } from '@/utils/sanitization';
import { useTranslation } from 'react-i18next';

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
  isMultiSelecting?: boolean;
}

export const ParagraphField: React.FC<ParagraphFieldProps> = ({ 
  field, 

  isSelected = false,
  onSelect,
  isMultiSelecting = false
}) => {
  const { t } = useTranslation();
  const updateField = useFormStore((state) => state.updateField);
  
  const modules = React.useMemo(() => ({
    toolbar: {
      container: `#toolbar-${field.id}`,
    }
  }), [field.id]);

  
  const htmlContent = { __html: sanitize(field.label || t('builder.header.paragraph_edit')) };




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
        {isSelected && !isMultiSelecting && (
          <div className="absolute -top-12 left-0 right-0 z-[60] flex justify-center">
             <RichTextToolbar id={`toolbar-${field.id}`} />
          </div>
        )}

        {isSelected && !isMultiSelecting ? (
           <div className="relative group/editor">
             <React.Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-md" />}>
               <RichTextEditor
                  theme="snow"
                  value={field.label}
                  onChange={(value) => updateField(field.id, { label: value })}
                  placeholder={t('builder.header.slash_command')}
                  modules={modules}
                  className="text-sm text-black leading-relaxed borderless animate-slide-down min-h-32"
               />
             </React.Suspense>
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
