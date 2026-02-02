import { useTranslation } from "react-i18next";
import { stripHtml } from '@/lib/ui/utils';

interface ValueRendererProps {
  value: any;
}

export default function ValueRenderer({ value }: ValueRendererProps) {
  const { t } = useTranslation();

  if (value === null || value === undefined) return <span className="text-gray-300 italic">{t('activity.values.empty')}</span>;
  if (typeof value === 'boolean') return value ? <span className="text-emerald-600 font-medium">{t('activity.values.enable')}</span> : <span className="text-gray-500">{t('activity.values.disable')}</span>;
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-300 italic">{t('activity.values.empty')}</span>;
      
      if (value[0] && typeof value[0] === 'object' && ('label' in value[0] || 'value' in value[0])) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((opt: any, i: number) => {
              const display = opt?.label ?? opt?.value ?? (typeof opt === 'object' ? JSON.stringify(opt) : opt);
              return (
                <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                  {typeof display === 'object' ? t('activity.values.invalid') : display}
                </span>
              );
            })}
          </div>
        );
      }
      return <span className="text-xs text-gray-600">{value.length} {t('activity.values.items')}</span>;
    }
    
    if (value.items && Array.isArray(value.items)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.items.map((opt: any, i: number) => {
             const display = opt?.label ?? opt?.value ?? (typeof opt === 'object' ? JSON.stringify(opt) : opt);
             return (
              <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                {typeof display === 'object' ? t('activity.values.invalid') : display}
              </span>
             );
          })}
          {value.subLabel && (
            <span className="text-xs text-gray-500 italic">({value.subLabel})</span>
          )}
        </div>
      );
    }
    
    const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined && v !== '' && k !== 'items');
    if (entries.length === 0) return <span className="text-gray-300 italic">{t('activity.values.empty')}</span>;
    
    return (
      <div className="space-y-0.5">
        {entries.map(([key, value]: [string, any], i: number) => {
          const readableKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          
          return (
            <div key={i} className="text-xs">
              <span className="text-gray-500">{readableKey}:</span>{' '}
              <span className="text-gray-700 font-medium">
                {typeof value === 'boolean' ? (value ? t('activity.values.enable') : t('activity.values.disable')) : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  
  return <>{stripHtml(String(value))}</>;
}
