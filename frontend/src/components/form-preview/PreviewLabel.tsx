import React from 'react';
import { Field } from '@/types';
import { sanitize } from '@/utils/sanitization';

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
    
    
    const decodeHtml = (html: string) => {
        if (typeof window === 'undefined') return html; 
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    const rawLabel = field.label || '';
    
    const labelToSanitize = (rawLabel.includes('&lt;') && rawLabel.includes('&gt;')) 
        ? decodeHtml(rawLabel) 
        : rawLabel;

    
    const labelContent = sanitize(labelToSanitize);
    
    const labelAlignment = field.options?.labelAlignment || 'TOP';
    const isRightAligned = labelAlignment === 'RIGHT';
    const isCenterAligned = labelAlignment === 'CENTER';

    return (
        <Tag htmlFor={as === 'label' ? htmlFor : undefined} className={`block font-semibold mb-1 ${isPublic ? 'text-base' : 'text-sm text-gray-800'} ${isRightAligned ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`} style={isPublic ? { color: 'var(--text)' } : {}}>
            { }
            {(field.imageUrl || field.videoUrl) && (
                <div className="mb-3 mt-1 space-y-3 flex flex-col items-center">
                    
                    { }
                    {field.imageUrl && (
                        <div className="relative max-w-full">
                            <img 
                                src={field.imageUrl} 
                                alt="Content" 
                                className="rounded-lg object-contain bg-gray-50/50"
                                style={{ 
                                    maxWidth: field.imageWidth || '100%',
                                    
                                    width: field.imageWidth ? undefined : 'auto' 
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    { }
                    {field.videoUrl && (() => {
                        
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                        const match = field.videoUrl?.match(regExp);
                        const videoId = (match && match[2].length === 11) ? match[2] : null;

                        if (videoId) {
                             return (
                                <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-black/5 aspect-video isolate">
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video player"
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                                    />
                                </div>
                             );
                        }
                        return null;
                    })()}
                </div>
            )}

            <div className={`flex items-start ${isCenterAligned ? 'justify-center' : ''}`}>
                {questionNumber && (
                    <span className="mr-2 flex-shrink-0 mt-[2px]" style={isPublic ? { color: 'var(--text)', opacity: 0.6 } : {}}>
                        <span className={isPublic ? '' : 'text-gray-500'}>{questionNumber}</span> 
                        <span className={isPublic ? 'mx-1' : 'text-gray-300 mx-1'} style={isPublic ? { color: 'var(--divider)' } : {}}>|</span>
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <div 
                        className={`ql-editor !p-0 !min-h-0 [&>p]:!m-0 pointer-events-none ${isPublic ? '' : 'text-gray-800'} ${isRightAligned ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`} 
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
