import { useState } from 'react';
import { useFormStore } from '@/store/formStore';
import DeviceFrame from '@/components/form-preview/DeviceFrame';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import PublicFormRenderer from '@/components/public-form/PublicFormRenderer';

import { useTranslation } from 'react-i18next';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function FormPreviewPage() {
  const { t } = useTranslation();
  const { currentForm } = useFormStore();
  const [device, setDevice] = useState<DeviceType>('desktop');

  if (!currentForm) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">{t('public.form_not_found_title')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 select-none">
      { }
      <div className="bg-white/40 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                device === 'desktop'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">{t('public.preview.desktop', 'Desktop')}</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                device === 'tablet'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Tablet className="h-4 w-4" />
              <span className="hidden sm:inline">{t('public.preview.tablet', 'Tablet')}</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                device === 'mobile'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">{t('public.preview.mobile', 'Mobile')}</span>
            </button>
          </div>
        </div>
      </div>

      { }
      <div className="flex-1 overflow-auto flex items-start justify-center bg-gray-100 p-4">
        <DeviceFrame device={device}>
          <PublicFormRenderer form={currentForm} isPreview={true} viewMode={device} />
        </DeviceFrame>
      </div>
    </div>
  );
}
