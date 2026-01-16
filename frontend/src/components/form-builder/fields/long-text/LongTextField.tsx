import React from 'react';
import { Field } from '@/types';
import { FileText, Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LongTextFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const LongTextField: React.FC<LongTextFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const { t } = useTranslation();
  const options = field.options || {};
  const validation = field.validation || {};
  const { width, customWidth, hoverText, rows = 4, editorMode } = options;
  const { maxLength, hasMaxLength } = validation;
  const isRichText = editorMode === 'RICH_TEXT';
  const defaultPlaceholder = t('builder.placeholder.long_text');

  if (isRichText) {
    return (
      <div className="relative max-w-full group" title={hoverText} style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}>
        <div className={`w-full border ${fieldStyle.inputBorder} rounded-xl overflow-hidden bg-white shadow-sm resize-none transition-all duration-300 ${disabledClass} pointer-events-none group-hover/field:shadow-md`}>
           {/* Toolbar */}
           <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                 <Bold className="w-4 h-4 text-slate-500" />
                 <Italic className="w-4 h-4 text-slate-500" />
                 <Underline className="w-4 h-4 text-slate-500" />
              </div>
              
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                 <AlignLeft className="w-4 h-4 text-slate-500" />
                 <AlignCenter className="w-4 h-4 text-slate-500" />
                 <AlignRight className="w-4 h-4 text-slate-500" />
                 <AlignJustify className="w-4 h-4 text-slate-500" />
              </div>

              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                 <List className="w-4 h-4 text-slate-500" />
                 <ListOrdered className="w-4 h-4 text-slate-500" />
              </div>

              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                 <LinkIcon className="w-4 h-4 text-slate-500" />
              </div>

              <div className="flex items-center gap-1">
                  <div className="h-6 w-16 bg-white border border-slate-300 rounded text-[10px] flex items-center px-1 text-slate-500">
                    Normal
                  </div>
              </div>
           </div>
           {/* Content */}
           <div className="p-4 min-h-[100px] text-slate-400 text-base">
              {field.placeholder || defaultPlaceholder}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-full group" title={hoverText}>
      <div className="absolute left-4 top-4 pointer-events-none transition-colors duration-300 group-hover/field:text-black">
         <FileText className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
      </div>
      <textarea
        placeholder={field.placeholder || defaultPlaceholder}
        readOnly
        tabIndex={-1}
        rows={rows}
        maxLength={hasMaxLength ? maxLength : undefined}
        style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
        className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-purple-50/30 text-black text-base shadow-sm resize-none transition-all duration-300 ${disabledClass} pointer-events-none group-hover/field:bg-white group-hover/field:shadow-md`}
      />
    </div>
  );
};
