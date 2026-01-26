import { Field } from '@/types';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PreviewGroupFieldProps {
  field: Field;
  children?: React.ReactNode;
}

export function PreviewGroupField({ field, children }: PreviewGroupFieldProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <fieldset
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: 0,
        margin: '16px 0',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <legend
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          marginLeft: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
          cursor: 'pointer',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        <Layers size={16} style={{ color: '#6366f1' }} />
        {field.label || 'Field Group'}
      </legend>

      {!isCollapsed && (
        <div style={{ padding: '16px 20px' }}>
          {children || (
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              {t('public.group.no_fields', 'No fields in this group')}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
