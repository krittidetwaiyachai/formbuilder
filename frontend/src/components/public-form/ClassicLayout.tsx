
import FormFieldRenderer from '@/components/form-preview/FormFieldRenderer';
import { Form } from '@/types';

interface ClassicLayoutProps {
  currentPageFields: any[];
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  control: any;
  form: Form;
}

export function ClassicLayout({
  currentPageFields,
  register,
  errors,
  watch,
  setValue,
  control,
  form,
}: ClassicLayoutProps) {
  return (
    <>
      {currentPageFields.map((field, index) => {
        const isShrunk = field.shrink;
        return (
          <div 
            key={field.id} 
            className={`${isShrunk ? 'w-full md:w-[calc(50%-0.75rem)]' : 'w-full'} pb-6 border-b border-gray-50 last:border-0 last:pb-0`}
          >
            <FormFieldRenderer
              field={field}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              control={control}
              questionNumber={form.settings?.showQuestionNumber ? index + 1 : undefined}
              isPublic
            />
          </div>
        );
      })}
    </>
  );
}
