import React from 'react';
import { Field } from '@/types';
import { Send, RotateCcw, Printer } from 'lucide-react';

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
  const options = field.options || {};
  const buttonAlign = options.buttonAlign || 'AUTO'; // 'AUTO' | 'LEFT' | 'CENTER' | 'RIGHT'
  const resetButton = options.resetButton || false;
  const printButton = options.printButton || false;
//   const saveAndContinue = options.saveAndContinue || false;

  const getAlignmentClass = () => {
      switch(buttonAlign) {
          case 'LEFT': return 'justify-start';
          case 'CENTER': return 'justify-center';
          case 'RIGHT': return 'justify-end';
          case 'AUTO': default: return 'justify-start'; // or maybe generic default logic
      }
  };

  return (
    <div className={`relative max-w-full flex flex-wrap gap-2 ${getAlignmentClass()}`}>
        {/* Main Submit Button */}
       <button 
         type="submit"
         className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow-sm text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 ${disabledClass}`}
       >
         {field.label || 'Submit'}
         <Send className="w-4 h-4" />
       </button>
       
       {/* Reset Button (Optional) */}
       {resetButton && (
           <button 
             type="button"
             className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 shadow-sm text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2 ${disabledClass}`}
           >
             <RotateCcw className="w-3 h-3" />
             Clear Form
           </button>
       )}

        {/* Print Button (Optional) */}
       {printButton && (
           <button 
             type="button"
             className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 shadow-sm text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2 ${disabledClass}`}
           >
             <Printer className="w-3 h-3" />
             Print
           </button>
       )}
    </div>
  );
};
