import React from 'react';
import { Field } from '@/types';

interface PreviewLabelProps {
    field: Field;
    questionNumber?: number;
    isPublic?: boolean;
    htmlFor?: string;
    as?: 'label' | 'p' | 'div';
}

export const PreviewLabel: React.FC<PreviewLabelProps> = ({ 
    field, 
    questionNumber, 
    isPublic, 
    htmlFor, 
    as = 'label' 
}) => {
    const Tag = as;
    
    // Safety check for label content
    const labelContent = field.label || '';
    
    const labelAlignment = field.options?.labelAlignment || 'TOP';
    const isRightAligned = labelAlignment === 'RIGHT';
    const isCenterAligned = labelAlignment === 'CENTER';

    return (
        <Tag htmlFor={as === 'label' ? htmlFor : undefined} className={`block font-semibold text-gray-800 mb-1 ${isPublic ? 'text-base' : 'text-sm'} ${isRightAligned ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`}>
            <div className={`flex items-start ${isCenterAligned ? 'justify-center' : ''}`}>
                {questionNumber && (
                    <span className="text-gray-500 mr-2 flex-shrink-0 mt-[2px]">
                        {questionNumber} <span className="text-gray-300">|</span>
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <div 
                        className={`ql-editor !p-0 !min-h-0 [&>p]:!m-0 pointer-events-none text-gray-800 ${isRightAligned ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`} 
                        dangerouslySetInnerHTML={{ __html: labelContent }} 
                    />
                </div>
                {field.required && (
                    <span className="text-red-500 select-none text-lg leading-none ml-1 -mt-1 flex-shrink-0">*</span>
                )}
            </div>
        </Tag>
    );
};
