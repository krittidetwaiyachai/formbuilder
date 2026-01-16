import React from 'react';
import { Field } from '@/types';
import { RotateCcw, Printer } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  // We don't really need register/errors for submit button unless we want to disable it based on errors
}

export const PreviewSubmitField: React.FC<PreviewFieldProps> = ({ field }) => {
  const options = field.options || {};
  const buttonAlign = options.buttonAlign || 'AUTO'; // 'AUTO' | 'LEFT' | 'CENTER' | 'RIGHT'
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
    <div className={`mb-4 flex flex-wrap gap-2 ${getAlignmentClass()}`}>
      {/* Main Submit Button */}
       <button 
         type="submit"
         className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 font-medium`}
       >
         {field.label || 'Submit'}
         {/* <Send className="w-4 h-4" /> */}
       </button>

       {/* Reset Button (Optional) */}
       {resetButton && (
           <button 
             type="reset"
             className={`px-4 py-3 bg-white text-gray-600 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 font-medium`}
           >
             <RotateCcw className="w-4 h-4" />
             Clear Form
           </button>
       )}

        {/* Print Button (Optional) */}
       {printButton && (
           <button 
             type="button"
             onClick={() => window.print()}
             className={`px-4 py-3 bg-white text-gray-600 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 font-medium`}
           >
             <Printer className="w-4 h-4" />
             Print Form
           </button>
       )}
    </div>
  );
};
