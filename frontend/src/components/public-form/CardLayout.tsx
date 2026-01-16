
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
  if (!currentField) return null;

  return (
    <div className="focus-within:ring-0 transition-all duration-300 w-full">
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
    </div>
  );
}
