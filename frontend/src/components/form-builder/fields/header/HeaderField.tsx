import React, { useRef, useState } from 'react';
import { Field, FieldType } from '@/types';
import { useFormStore } from '@/store/formStore';
import { ChevronRight, FileX } from 'lucide-react';


const RichTextEditor = React.lazy(() => import('@/components/ui/RichTextEditor').then(module => ({ default: module.RichTextEditor })));
import { RichTextToolbar } from '@/components/ui/RichTextToolbar';
import { sanitize } from '@/utils/sanitization';
import { useTranslation } from 'react-i18next';

interface HeaderFieldProps {
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

export const HeaderField: React.FC<HeaderFieldProps> = ({ 
  field, 
 
  isSelected = false,
  onSelect,
  isMultiSelecting = false
}) => {
  const { t } = useTranslation();
  const updateField = useFormStore((state) => state.updateField);
  const [activeInput, setActiveInput] = useState<'heading' | 'subheading'>('heading');

  const headingModules = React.useMemo(() => ({
    toolbar: {
      container: `#toolbar-heading-${field.id}`,
    }
  }), [field.id]);

  const subheadingModules = React.useMemo(() => ({
    toolbar: {
      container: `#toolbar-subheading-${field.id}`,
    }
  }), [field.id]);
  const headerContainerRef = useRef<HTMLDivElement>(null);

  if (field.type === FieldType.PARAGRAPH) {
     return (
        <div className="max-w-2xl pointer-events-none">
            <p className="text-gray-700 text-sm leading-relaxed">
              {field.placeholder || t('builder.header.paragraph_default')}
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
              {field.label || t('builder.submit.default_label')}
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
              <h3 className="font-semibold text-black">{field.label || t('builder.header.section_title')}</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-2">{t('builder.header.section_desc')}</p>
        </div>
    );
  }

  if (field.type === FieldType.PAGE_BREAK) {
    return (
        <div className="py-8 border-t-2 border-dashed border-gray-400 pointer-events-none">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <FileX className="h-5 w-5" />
              <span className="text-sm font-medium">{t('builder.header.page_break')}</span>
            </div>
        </div>
    );
  }

  
  const headerProps = field.options || {};
  const headerAlignment = headerProps.alignment || 'LEFT';
  const headerSize = headerProps.size || 'MEDIUM';
  const headerSubheading = field.placeholder && field.placeholder.length > 0;
  
  
  const headingImage = headerProps.headingImage || null;
  const imagePosition = headerProps.imagePosition || 'TOP';
  const hasBackgroundImage = headingImage && imagePosition === 'BACKGROUND';
  const overlayOpacity = headerProps.overlayOpacity ?? 50;

  const getHeaderSizeClass = () => {
    switch(headerSize) {
      case 'SMALL': return 'text-xl';
      case 'LARGE': return 'text-4xl';
      default: return 'text-2xl'; 
    }
  };

  const getHeaderAlignmentClass = () => {
    switch(headerAlignment) {
      case 'CENTER': return 'text-center';
      case 'RIGHT': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div 
      ref={headerContainerRef}
      className={`relative w-full transition-all duration-200 group
        ${isSelected ? '' : 'border-transparent hover:border-gray-200'}
        ${isSelected ? 'cursor-default' : 'cursor-pointer'}
        ${hasBackgroundImage ? 'overflow-hidden rounded-lg min-h-[200px]' : 'rounded-lg'}
      `}
      onClick={(e) => {
         e.stopPropagation();
         if (onSelect) {
             
             
             onSelect(field.id);
         }
      }}
    >
       { }
       {hasBackgroundImage && (
         <div 
           className="absolute inset-0 z-0 bg-cover bg-center"
           style={{ backgroundImage: `url(${headingImage})` }}
         >
           <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}></div>
         </div>
       )}

        <div className={hasBackgroundImage ? `relative z-10 p-8 flex flex-col justify-center h-full min-h-80 ${
          headerAlignment === 'CENTER' ? 'items-center' : 
          headerAlignment === 'RIGHT' ? 'items-end' : 'items-start'
        }` : ''}>
        
        {isSelected && !isMultiSelecting && (
          <div className="absolute -top-12 left-0 right-0 z-[60] flex justify-center">
            <div style={{ display: activeInput === 'heading' ? 'block' : 'none' }}>
              <RichTextToolbar id={`toolbar-heading-${field.id}`} />
            </div>
            <div style={{ display: activeInput === 'subheading' ? 'block' : 'none' }}>
              <RichTextToolbar id={`toolbar-subheading-${field.id}`} />
            </div>
          </div>
        )}

        {isSelected && !isMultiSelecting ? (
          <div className="relative group/editor">
             <React.Suspense fallback={<div className="h-12 bg-gray-50 animate-pulse rounded-md" />}>
               <RichTextEditor
                  theme="snow"
                  value={field.label || t('builder.header.default_heading')}
                  onChange={(value) => updateField(field.id, { label: value })}
                  onFocus={() => setActiveInput('heading')}
                  placeholder={t('builder.header.default_heading')}
                  modules={headingModules}
                  className={`${getHeaderSizeClass()} ${getHeaderAlignmentClass()} text-gray-900 leading-tight tracking-tight borderless`}
               />
             </React.Suspense>
          </div>
        ) : (
          <h2
            className={`${getHeaderSizeClass()} ${getHeaderAlignmentClass()} text-gray-900 leading-tight tracking-tight ql-editor !p-0 !overflow-visible break-words break-all`}
            dangerouslySetInnerHTML={{ __html: sanitize(field.label || t('builder.header.default_heading')) }}
          />
        )}
        
        {(headerSubheading || isSelected) && (
           <div className="mt-3">
             {isSelected && !isMultiSelecting ? (
               <div className="relative group/editor">
                 <React.Suspense fallback={<div className="h-8 bg-gray-50 animate-pulse rounded-md" />}>
                   <RichTextEditor
                     theme="snow"
                     value={field.placeholder || ''}
                     onChange={(value) => updateField(field.id, { placeholder: value })}

                   onFocus={() => setActiveInput('subheading')}
                   placeholder={t('builder.header.subheading_placeholder')}
                   modules={subheadingModules}
                   className="text-gray-500 text-lg borderless"
                 />
                 </React.Suspense>
               </div>
             ) : (
               <div
                 className={`text-base text-gray-500 ${getHeaderAlignmentClass()} font-light ql-editor !p-0 !overflow-visible`}
                 dangerouslySetInnerHTML={{ __html: sanitize(field.placeholder || (isSelected ? t('builder.header.subheading_placeholder') : '')) }}
               />
             )}
           </div>
        )}
         {headingImage && headingImage.startsWith('http') && imagePosition !== 'BACKGROUND' && (
          <div className={`mt-6 ${
            imagePosition === 'CENTER' ? 'flex justify-center' : 
            imagePosition === 'RIGHT' ? 'flex justify-end' : 'flex justify-start'
          }`}>
            <img 
              src={headingImage} 
              alt="Heading" 
              className="max-w-full h-auto rounded-xl shadow-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        </div>
      </div>
  );
};
