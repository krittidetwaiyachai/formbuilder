import React from 'react';
import { Field } from '@/types';
import { Send, RotateCcw, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubmitFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const SubmitField: React.FC<SubmitFieldProps> = ({ field, disabledClass = "opacity-60 cursor-pointer" }) => {
  const { t } = useTranslation();
  const options = field.options || {};
  const buttonAlign = options.buttonAlign || 'AUTO'; 
  const resetButton = options.resetButton || false;
  const printButton = options.printButton || false;


  const getAlignmentClass = () => {
      switch(buttonAlign) {
          case 'LEFT': return 'justify-start';
          case 'CENTER': return 'justify-center';
          case 'RIGHT': return 'justify-end';
          case 'AUTO': default: return 'justify-start'; 
      }
  };

  return (
    <div className={`relative max-w-full flex flex-wrap gap-2 ${getAlignmentClass()}`}>
        { }
       <button 
         type="submit"
         className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow-sm text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 ${disabledClass}`}
       >
         {field.label || t('builder.submit.default_label')}
         <Send className="w-4 h-4" />
       </button>
       
       { }
       {resetButton && (
           <button 
             type="button"
             className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 shadow-sm text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2 ${disabledClass}`}
           >
             <RotateCcw className="w-3 h-3" />
             {t('builder.submit.clear_form')}
           </button>
       )}

        { }
       {printButton && (
           <button 
             type="button"
             className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 shadow-sm text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2 ${disabledClass}`}
           >
             <Printer className="w-3 h-3" />
             {t('builder.submit.print')}
           </button>
       )}
    </div>
  );
};
