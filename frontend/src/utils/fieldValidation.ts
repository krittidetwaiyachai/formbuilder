import { stripHtml } from '@/lib/ui/utils';
import { TFunction } from 'i18next';

export const getRequiredMessage = (t: TFunction, fieldLabel: string): string => {
  return t('public.validation.required_field', { label: stripHtml(fieldLabel) });
};
