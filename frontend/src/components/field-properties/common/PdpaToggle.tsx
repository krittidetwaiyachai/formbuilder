import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PdpaToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const PdpaToggle = ({ value, onChange }: PdpaToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
            <div className="mt-1">
                 <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-0.5">
                <label className="block text-sm font-medium text-black">{t('builder.properties.pdpa_title')}</label>
                <div className="text-[0.8rem] text-muted-foreground text-gray-500">
                    {t('builder.properties.pdpa_desc')}
                </div>
            </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
        </label>
      </div>
    </div>
  );
};
