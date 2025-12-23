import React from 'react';
import { Form } from '@/types';

interface WelcomeScreenEditorProps {
  currentForm: Form | null;
  updateForm: (updates: Partial<Form>) => void;
}

export default function WelcomeScreenEditor({ currentForm, updateForm }: WelcomeScreenEditorProps) {
  if (!currentForm) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon Placeholder */}
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Inline Editable Title */}
        <div className="relative group">
          <input
            type="text"
            className="block w-full text-center text-4xl font-extrabold text-gray-900 border-none bg-transparent focus:ring-0 placeholder-gray-300 focus:placeholder-gray-200"
            value={currentForm?.welcomeSettings?.title || ''}
            onChange={(e) => updateForm({
              welcomeSettings: {
                ...currentForm?.welcomeSettings,
                title: e.target.value,
                description: currentForm?.welcomeSettings?.description || '',
                buttonText: currentForm?.welcomeSettings?.buttonText || 'Start',
                showStartButton: currentForm?.welcomeSettings?.showStartButton ?? true
              }
            })}
            placeholder="Click to edit title"
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors" />
        </div>

        {/* Inline Editable Description */}
        <div className="relative group">
          <textarea
            className="block w-full text-center text-xl text-gray-500 border-none bg-transparent focus:ring-0 resize-none min-h-[100px] placeholder-gray-300 focus:placeholder-gray-200"
            value={currentForm?.welcomeSettings?.description || ''}
            onChange={(e) => updateForm({
              welcomeSettings: {
                ...currentForm?.welcomeSettings,
                title: currentForm?.welcomeSettings?.title || '',
                buttonText: currentForm?.welcomeSettings?.buttonText || 'Start',
                showStartButton: currentForm?.welcomeSettings?.showStartButton ?? true,
                description: e.target.value
              }
            })}
            placeholder="Click to add a description..."
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-dashed group-hover:border-gray-200 rounded-lg pointer-events-none transition-colors" />
        </div>

        {/* Start Button */}
        {currentForm?.welcomeSettings?.showStartButton !== false && (
          <div className="flex justify-center pt-4">
            <div className="relative group">
              <input
                type="text"
                className="block w-48 text-center text-lg font-bold text-white bg-blue-600 rounded-full py-3 px-8 shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-text border-none"
                value={currentForm?.welcomeSettings?.buttonText || 'Start'}
                onChange={(e) => updateForm({
                  welcomeSettings: {
                    ...currentForm?.welcomeSettings,
                    title: currentForm?.welcomeSettings?.title || '',
                    description: currentForm?.welcomeSettings?.description || '',
                    showStartButton: currentForm?.welcomeSettings?.showStartButton ?? true,
                    buttonText: e.target.value
                  }
                })}
              />
              <div className="absolute -inset-2 border-2 border-transparent group-hover:border-dashed group-hover:border-blue-200 rounded-full pointer-events-none transition-colors" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
