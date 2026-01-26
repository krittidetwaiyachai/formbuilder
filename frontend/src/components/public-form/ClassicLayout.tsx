
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
    <div className="flex flex-wrap gap-x-6 gap-y-6">
      {currentPageFields.map((field, index) => {
        const isShrunk = field.options?.shrink; 
        return (
          <div 
            key={field.id} 
            className={`${isShrunk ? 'w-full md:w-[calc(50%-0.75rem)]' : 'w-full'}`}
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
    </div>
  );
}
