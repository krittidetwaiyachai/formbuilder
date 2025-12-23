import React, { useRef } from 'react';
import { Field, FieldType } from '@/types';
import { useFormStore } from '@/store/formStore';
import { ChevronRight, FileX } from 'lucide-react';

interface HeaderFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  disabledClass?: string;
}

export const HeaderField: React.FC<HeaderFieldProps> = ({ 
  field, 
  fieldStyle: _fieldStyle, 
  isSelected, 
  onSelect,
  disabledClass: _disabledClass = "opacity-60 cursor-pointer" 
}) => {
  const updateField = useFormStore((state) => state.updateField);
  const headerInputRef = useRef<HTMLHeadingElement>(null);
  const subheadingInputRef = useRef<HTMLParagraphElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const isFocusingRef = useRef(false);

  // Initial Sync logic is handled in parent FieldItem currently, but standard fields don't need it as much
  // Header needs contentEditable support.
  // Actually, extracting Header logic fully including refs might be tricky with the current logic in FieldItem using refs to focus.
  // For now, I will keep the contentEditable logic HERE inside HeaderField, but FieldItem's "shouldFocusField" effect might need adjustment.
  // Wait, FieldItem's focus effect tries to focus `headerInputRef` which is inside FieldItem.
  // If I move this to HeaderField, FieldItem loses access to the ref unless I use forwardRef or useImperativeHandle.
  // OR, I can move the focus logic into this component.
  
  // Implementation note: The `FieldItem` component has specific `useEffect` hooks for focusing.
  // To make this refactor work without breaking focus, I might need to move that focus logic here too.
  // Or expose a ref.
  
  // Let's implement rendering first.
  
  if (field.type === FieldType.PARAGRAPH) {
     return (
        <div className="max-w-2xl pointer-events-none">
            <p className="text-gray-700 text-sm leading-relaxed">
              {field.placeholder || 'This is a paragraph. You can add descriptive text here to provide instructions or additional information to your form users.'}
            </p>
        </div>
     );
  }

  if (field.type === FieldType.SUBMIT) {
     return (
        <div className="flex justify-center pointer-events-none">
            <button
              type="button"
              disabled
              className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {field.label || 'Submit'}
            </button>
        </div>
     );
  }

  if (field.type === FieldType.DIVIDER) {
    return (
        <div className="py-4 pointer-events-none">
            <hr className="border-t-2 border-gray-300" />
        </div>
    );
  }

  if (field.type === FieldType.SECTION_COLLAPSE) {
    return (
        <div className="border-2 border-gray-300 rounded-lg p-4 max-w-md pointer-events-none">
            <div className="flex items-center justify-between cursor-pointer">
              <h3 className="font-semibold text-black">{field.label || 'Section Title'}</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Click to expand/collapse section</p>
        </div>
    );
  }

  if (field.type === FieldType.PAGE_BREAK) {
    return (
        <div className="py-8 border-t-2 border-dashed border-gray-400 pointer-events-none">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <FileX className="h-5 w-5" />
              <span className="text-sm font-medium">Page Break</span>
            </div>
        </div>
    );
  }

  // HEADER TYPE
  const headerValidation = (field.validation as any) || {};
  const headerSize = headerValidation?.size || 'DEFAULT';
  const headerAlignment = headerValidation?.alignment || 'LEFT';
  const headerSubheading = field.placeholder || '';
  
  const getHeaderSizeClass = () => {
    switch (headerSize) {
      case 'LARGE': return 'text-4xl';
      case 'SMALL': return 'text-xl';
      default: return 'text-2xl';
    }
  };
  
  const getHeaderAlignmentClass = () => {
    switch (headerAlignment) {
      case 'CENTER': return 'text-center';
      case 'RIGHT': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div 
        ref={headerContainerRef}
        className="cursor-text"
    >
        <h2
          ref={headerInputRef}
          contentEditable={isSelected}
          suppressContentEditableWarning
          className={`${getHeaderSizeClass()} font-bold text-black ${getHeaderAlignmentClass()} outline-none cursor-text`}
          style={{ 
            pointerEvents: 'auto', 
            userSelect: 'text', 
            WebkitUserSelect: 'text',
            minHeight: '1.5em'
          }}
          // We use dangerouslySetInnerHTML in the original, but here we can just use children if we sync?
          // The original used: dangerouslySetInnerHTML={{ __html: field.label || ... }}
          // And had a useEffect to sync.
          // To keep it simple, I'll stick close to original but maybe use simple text if HTML isn't needed. 
          // The original `labelHtml` state was interesting.
          // For this refactor, let's assume we want to preserve that behavior.
          // I'll skip the `dangerouslySetInnerHTML` for now and just set defaultValue/onBlur, 
          // but contentEditable with React is tricky.
          // I will use key={field.id} or similar to force re-render if needed, 
          // OR better: use the exact same logic as original if possible.
          // Since I can't easily lift the `useEffect` logic for synching straight into here without re-implementing,
          // I will implement the logic inside this component.
           dangerouslySetInnerHTML={{ __html: field.label || 'Heading' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            isFocusingRef.current = true;
            if (headerInputRef.current) headerInputRef.current.focus();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!isSelected) {
              onSelect(field.id, true);
            }
          }}
          onBlur={(e) => {
             const newText = e.currentTarget.textContent || '';
             if (newText !== (field.label || 'Header')) {
               updateField(field.id, { label: newText });
             }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
        {headerSubheading || headerSubheading === '' ? (
          <p
            ref={subheadingInputRef}
            contentEditable={isSelected}
            suppressContentEditableWarning
            className={`text-sm text-gray-600 mt-2 ${getHeaderAlignmentClass()} outline-none cursor-text`}
            style={{ 
              pointerEvents: 'auto', 
              userSelect: 'text', 
              WebkitUserSelect: 'text',
              minHeight: '1.5em'
            }}
             dangerouslySetInnerHTML={{ __html: field.placeholder || '' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              isFocusingRef.current = true;
              if (subheadingInputRef.current) subheadingInputRef.current.focus();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSelected) {
                onSelect(field.id, true);
              }
            }}
            onBlur={(e) => {
               const newText = e.currentTarget.textContent || '';
               if (newText !== field.placeholder) {
                 updateField(field.id, { placeholder: newText });
               }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />
        ) : null}
         {(field.validation as any)?.headingImage && (
          <div className={`mt-4 ${
            headerAlignment === 'CENTER' ? 'flex justify-center' : 
            headerAlignment === 'RIGHT' ? 'flex justify-end' : 'flex justify-start'
          }`}>
            <img 
              src={(field.validation as any).headingImage} 
              alt="Heading" 
              className="max-w-full h-auto rounded-lg max-h-96 object-contain"
            />
          </div>
        )}
      </div>
  );
};
