import FormFieldRenderer from "@/components/form-preview/FormFieldRenderer";
import type { Field, Form } from "@/types";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  Control,
} from "react-hook-form";

interface ClassicLayoutProps {
  currentPageFields: Field[];
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  control: Control;
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
        const isShrunk =
          field.options && "shrink" in field.options && field.options.shrink;
        return (
          <div
            key={field.id}
            className={`${isShrunk ? "w-full md:w-[calc(50%-0.75rem)]" : "w-full"}`}
          >
            <FormFieldRenderer
              field={field}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              control={control}
              questionNumber={
                form.settings?.showQuestionNumber ? index + 1 : undefined
              }
              isPublic
            />
          </div>
        );
      })}
    </div>
  );
}
