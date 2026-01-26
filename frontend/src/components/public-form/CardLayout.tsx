
import FormFieldRenderer from '@/components/form-preview/FormFieldRenderer';
import { Form } from '@/types';

interface CardLayoutProps {
  currentField?: any;
  currentCardIndex: number;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  control: any;
  form: Form;
}

import { useTranslation } from 'react-i18next';

export function CardLayout({
  currentField,
  currentCardIndex,
  register,
  errors,
  watch,
  setValue,
  control,
  form,
}: CardLayoutProps) {
  const { t } = useTranslation();
  if (!currentField) return null;

  return (
    <div className="focus-within:ring-0 transition-all duration-300 w-full flex-1 flex flex-col justify-center px-8 md:px-12 py-8">
       <div className="w-full max-w-2xl mx-auto space-y-8">
         <FormFieldRenderer
           field={currentField}
           register={register}
           errors={errors}
           watch={watch}
           setValue={setValue}
           control={control}
           questionNumber={form.settings?.showQuestionNumber ? currentCardIndex + 1 : undefined}
           isPublic
         />
         
         <div className="pt-6 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/50 backdrop-blur-sm rounded-full text-xs font-medium text-gray-400">
                <span>{t('public.press', 'Press')}</span>
                <kbd className="font-sans font-bold text-gray-500">{t('public.press_enter')}</kbd>
            </div>
         </div>
       </div>
    </div>
  );
}
