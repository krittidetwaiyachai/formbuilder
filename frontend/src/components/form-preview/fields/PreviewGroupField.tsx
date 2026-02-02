import { Field } from '@/types';
import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PreviewGroupFieldProps {
  field: Field;
  children?: React.ReactNode;
}

export function PreviewGroupField({ field, children }: PreviewGroupFieldProps) {
  const { t } = useTranslation();

  return (
    <div className="group-field-wrapper w-full mb-4">
      {}

      {children ? (
        <div className="space-y-4 pl-0 md:pl-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
