import React from 'react';
import { Form } from '@/types';
import { Check } from 'lucide-react';

interface ThankYouScreenEditorProps {
  currentForm: Form | null;
  updateForm: (updates: Partial<Form>) => void;
}

export default function ThankYouScreenEditor({ currentForm, updateForm }: ThankYouScreenEditorProps) {
  if (!currentForm) return null;

  return (
    <div className="flex items-center justify-center min-h-full p-8 animate-in fade-in duration-500">
      <div className="aspect-video w-full max-w-4xl bg-white shadow-lg rounded-xl border border-gray-100 flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
        
        {/* Mail/Check Icon Composition */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center transform rotate-3">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -top-4 -right-4 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-md border-4 border-white">
            <Check className="w-8 h-8 text-white stroke-[3px]" />
          </div>
        </div>

        {/* Inline Editable Title */}
        <div className="relative group">
          <input
            type="text"
            className="block w-full text-center text-4xl font-extrabold text-gray-800 border-none bg-transparent focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200"
            value={currentForm?.thankYouSettings?.title || ''}
            onChange={(e) => updateForm({
              thankYouSettings: {
                title: e.target.value,
                message: currentForm?.thankYouSettings?.message || '',
                buttonText: currentForm?.thankYouSettings?.buttonText || 'Back to Home'
              }
            })}
            placeholder="Thank You!"
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors" />
        </div>

        {/* Inline Editable Message */}
        <div className="relative group">
          <textarea
            className="block w-full text-center text-xl text-gray-500 border-none bg-transparent focus:ring-0 resize-none min-h-[80px] placeholder-gray-300 focus:placeholder-gray-200"
            value={currentForm?.thankYouSettings?.message || ''}
            onChange={(e) => updateForm({
              thankYouSettings: {
                ...currentForm?.thankYouSettings,
                title: currentForm?.thankYouSettings?.title || '',
                buttonText: currentForm?.thankYouSettings?.buttonText || 'Back to Home',
                message: e.target.value
              }
            })}
            placeholder="Your submission has been received."
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors" />
        </div>
      </div>
    </div>
  );
}
