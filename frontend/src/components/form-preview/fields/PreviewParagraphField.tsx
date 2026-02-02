import React from 'react';
import { Field } from '@/types';

interface PreviewFieldProps {
  field: Field;
}

export const PreviewParagraphField: React.FC<PreviewFieldProps> = ({ field }) => {
  const options = field.options || {};
  const { shrink, moveToNewLine, hidden } = options;

  if (hidden) return null;

  return (
    <div 
        className={`mb-4 ${shrink ? 'w-1/2 inline-block align-top pr-4' : 'w-full'} ${moveToNewLine ? 'clear-both' : ''}`}
    >
        <div 
            className="text-sm leading-relaxed break-words"
            style={{ color: 'var(--text-color)' }}
            dangerouslySetInnerHTML={{ __html: field.label || '' }}
        />
    </div>
  );
};
