import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';

interface LinkDialogProps {
  isOpen: boolean;
  initialValue?: string;
  onConfirm: (url: string) => void;
  onCancel: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({ 
  isOpen, 
  initialValue = '', 
  onConfirm, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim());
    }
  };

  const dialogContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in"
        onClick={onCancel}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('builder.insert_link')}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('builder.url')}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('common.url_placeholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t('builder.insert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dialogContent, document.body);
};
