import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Edit2, Undo2, Redo2, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/types';
import { useFormStore } from '@/store/formStore';

interface FormBuilderHeaderProps {
  currentForm: Form | null;
  saving: boolean;
  lastSaved: Date | null;
  message: { type: 'success' | 'error'; text: string } | null;
  handleSave: (isAutoSave: boolean) => Promise<void>;
  updateForm: (updates: Partial<Form>) => void;
}

export default function FormBuilderHeader({
  currentForm,
  saving,
  lastSaved,
  message,
  handleSave,
  updateForm
}: FormBuilderHeaderProps) {
  const navigate = useNavigate();
  const { undo, redo, historyIndex, history } = useFormStore();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Sync title value when form updates
  useEffect(() => {
    if (currentForm) {
      setTitleValue(currentForm.title);
    }
  }, [currentForm?.title]);

  const handleTitleEdit = () => {
    if (!currentForm) return;
    setTitleValue(currentForm.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateForm({ title: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(currentForm?.title || '');
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                  className="text-xl font-bold text-black border border-gray-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-black select-text"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="text-black hover:text-gray-700 p-1"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="text-black hover:text-gray-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 
                  onClick={handleTitleEdit}
                  className="text-xl font-bold text-black cursor-pointer hover:text-gray-700"
                  title="Click to edit title"
                >
                  {currentForm?.title || 'Loading...'}
                </h1>
                <button
                  onClick={handleTitleEdit}
                  className="text-gray-500 hover:text-black p-1"
                  title="Edit title"
                  disabled={!currentForm}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <div
              className={`px-4 py-2 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-gray-200 text-black'
                  : 'bg-gray-100 text-black'
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex items-center text-sm mr-2">
            {saving ? (
              <span className="text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                Saving...
              </span>
            ) : !currentForm ? (
              <span className="text-gray-500 flex items-center gap-2">
                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                 Loading...
              </span>
            ) : lastSaved ? (
              <span className="text-gray-500 flex items-center">
                All changes saved at {lastSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น.
                <div className="ml-1.5 p-0.5 rounded-full bg-green-100">
                   <Check className="h-3 w-3 text-green-600" />
                </div>
              </span>
            ) : null}
          </div>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => window.open(`/forms/${currentForm?.id}/preview`, '_blank')}
            className="inline-flex items-center px-3 py-1.5 border border-gray-400 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
