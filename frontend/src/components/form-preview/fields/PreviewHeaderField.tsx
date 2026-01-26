import React, { useState } from 'react';
import { Field, FieldType } from '@/types';
import { FileX, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PreviewFieldProps {
  field: Field;
}

export const PreviewHeaderField: React.FC<PreviewFieldProps> = ({ field }) => {
  const { t } = useTranslation();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  const openImageModal = (src: string) => {
    setModalImageSrc(src);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setModalImageSrc('');
  };

  if (field.type === FieldType.HEADER) {
      const headerValidation = field.validation as any;
      const headerSize = headerValidation?.size || 'DEFAULT';
      const headerAlignment = headerValidation?.alignment || 'LEFT';
      const headerSubheading = field.placeholder || '';
      const headingImage = headerValidation?.headingImage || '';
      const imagePosition = headerValidation?.imagePosition || 'CENTER';
      const overlayOpacity = headerValidation?.overlayOpacity ?? 50;
      
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

      const hasBackgroundImage = headingImage && headingImage.startsWith('http') && imagePosition === 'BACKGROUND';
      
      return (
        <>
          <div className={`mb-6 ${hasBackgroundImage ? 'relative rounded-xl overflow-hidden min-h-80 group cursor-pointer' : ''}`}>
            {hasBackgroundImage && (
              <>
                <img 
                  src={headingImage} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => openImageModal(headingImage)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div 
                  className="absolute inset-0 transition-opacity duration-300" 
                  style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
                />
                <div 
                  className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-white/30"
                  onClick={() => openImageModal(headingImage)}
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </>
            )}
            <div className={hasBackgroundImage ? `relative z-10 p-8 flex flex-col justify-center h-full min-h-80 ${
              headerAlignment === 'CENTER' ? 'items-center' : 
              headerAlignment === 'RIGHT' ? 'items-end' : 'items-start'
            }` : ''}>
              <h2 
                className={`${getHeaderSizeClass()} font-bold ${hasBackgroundImage ? 'text-white' : 'text-transparent bg-clip-text'} ${getHeaderAlignmentClass()} leading-tight tracking-tight pb-1`}
                style={!hasBackgroundImage ? { color: 'var(--text)' } : {}}
              >
                <div className="ql-editor !p-0 !min-h-0 [&>p]:!m-0" dangerouslySetInnerHTML={{ __html: field.label || t('public.placeholder.default_heading', 'Heading') }} />
              </h2>
              {headerSubheading && (
                <div className={`text-base mt-3 ${hasBackgroundImage ? 'text-white/90' : 'text-gray-600'} ${getHeaderAlignmentClass()}`}>
                  <div className="ql-editor !p-0 !min-h-0 [&>p]:!m-0" dangerouslySetInnerHTML={{ __html: headerSubheading }} />
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
                    className="max-w-full h-auto rounded-xl shadow-lg object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(headingImage)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {isImageModalOpen && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={closeImageModal}
            >
              <button 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                onClick={closeImageModal}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img 
                src={modalImageSrc} 
                alt="Enlarged" 
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      );
  }

  if (field.type === FieldType.PARAGRAPH) {
      return (
        <div className="mb-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', opacity: 0.85 }}>
            {field.placeholder || field.label || t('public.placeholder.default_paragraph', 'This is a paragraph. You can add descriptive text here to provide instructions or additional information to your form users.')}
          </p>
        </div>
      );
  }

  if (field.type === FieldType.DIVIDER) {
      return (
        <div className="my-6">
          <hr className="border-t-2" style={{ borderColor: 'var(--divider, transparent)' }} />
        </div>
      );
  }

  if (field.type === FieldType.SECTION_COLLAPSE) {
      const [isCollapsed, setIsCollapsed] = useState(true);
      return (
        <div className="mb-4">
          <div
            className="border rounded-lg p-4 max-w-md cursor-pointer transition-colors hover:bg-black/5"
            style={{ borderColor: 'var(--divider, transparent)', borderWidth: '1px' }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{field.label || t('public.placeholder.section_title', 'Section Title')}</h3>
              <ChevronRight 
                className={`h-5 w-5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} 
                style={{ color: 'var(--text)', opacity: 0.6 }}
              />
            </div>
            {!isCollapsed && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--divider, transparent)' }}>
                <p className="text-sm" style={{ color: 'var(--text)', opacity: 0.8 }}>{t('public.placeholder.section_content', 'Section content goes here...')}</p>
              </div>
            )}
          </div>
        </div>
      );
  }

  if (field.type === FieldType.PAGE_BREAK) {
      return (
        <div className="my-8 border-t-2 border-dashed border-gray-400">
          <div className="flex items-center justify-center gap-2 text-gray-500 mt-4">
            <FileX className="h-5 w-5" />
            <span className="text-sm font-medium">{t('public.label.page_break', 'Page Break')}</span>
          </div>
        </div>
      );
  }

  return null;
};
