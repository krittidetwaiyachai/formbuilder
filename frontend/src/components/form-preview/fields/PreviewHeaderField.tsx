import React, { useState } from 'react';
import { Field, FieldType } from '@/types';
import { FileX, ChevronRight } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
}

export const PreviewHeaderField: React.FC<PreviewFieldProps> = ({ field }) => {
  if (field.type === FieldType.HEADER) {
      const headerValidation = field.validation as any;
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
        <div className="mb-6">
          <h2 className={`${getHeaderSizeClass()} font-bold text-black ${getHeaderAlignmentClass()}`}>
            {field.label || 'Heading'}
          </h2>
          {headerSubheading && (
            <p className={`text-sm text-gray-600 mt-2 ${getHeaderAlignmentClass()}`}>
              {headerSubheading}
            </p>
          )}
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
  }

  if (field.type === FieldType.PARAGRAPH) {
      return (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {field.placeholder || field.label || 'This is a paragraph. You can add descriptive text here to provide instructions or additional information to your form users.'}
          </p>
        </div>
      );
  }

  if (field.type === FieldType.DIVIDER) {
      return (
        <div className="my-6">
          <hr className="border-t-2 border-gray-300" />
        </div>
      );
  }

  if (field.type === FieldType.SECTION_COLLAPSE) {
      const [isCollapsed, setIsCollapsed] = useState(true);
      return (
        <div className="mb-4">
          <div
            className="border-2 border-gray-300 rounded-lg p-4 max-w-md cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-black">{field.label || 'Section Title'}</h3>
              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
            </div>
            {!isCollapsed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Section content goes here...</p>
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
            <span className="text-sm font-medium">Page Break</span>
          </div>
        </div>
      );
  }

  return null;
};
