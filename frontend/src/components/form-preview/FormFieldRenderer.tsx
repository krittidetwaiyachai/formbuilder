import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { TextPreview } from './fields/TextPreview';
import { EmailPreview } from './fields/EmailPreview';
import { PreviewPhoneField } from './fields/PreviewPhoneField';
import { NumberPreview } from './fields/NumberPreview';
import { PreviewTextAreaField } from './fields/PreviewTextAreaField';
import { PreviewSelectField } from './fields/PreviewSelectField';
import { PreviewDateField } from './fields/PreviewDateField';
import { PreviewRateField } from './fields/PreviewRateField';
import { PreviewHeaderField } from './fields/PreviewHeaderField';
import { PreviewFullNameField } from './fields/PreviewFullNameField';
import { PreviewAddressField } from './fields/PreviewAddressField';
import { PreviewParagraphField } from './fields/PreviewParagraphField';
import { PreviewSubmitField } from './fields/PreviewSubmitField';
import { PreviewGroupField } from './fields/PreviewGroupField';
import { PreviewMatrixField } from './fields/PreviewMatrixField';
import { PreviewTableField } from './fields/PreviewTableField';

interface FormFieldRendererProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  watch?: ReturnType<typeof useForm>['watch'];
  setValue?: ReturnType<typeof useForm>['setValue'];
  control?: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export default function FormFieldRenderer({
  field,
  register,
  errors,
  watch,
  setValue,
  control,
  questionNumber,
  isPublic,
}: FormFieldRendererProps) {
  
  const commonProps = { field, register, errors, questionNumber, isPublic };

  switch (field.type) {
    case FieldType.TEXT:
      return <TextPreview {...commonProps} />;
    
    case FieldType.EMAIL:
      return <EmailPreview {...commonProps} />;
    
    case FieldType.PHONE:
      return <PreviewPhoneField {...commonProps} />;
    
    case FieldType.NUMBER:
      return <NumberPreview {...commonProps} />;
    
    case FieldType.TEXTAREA:
    case FieldType.TEXTAREA:
      return <PreviewTextAreaField {...commonProps} watch={watch} setValue={setValue} />;
    
    case FieldType.DROPDOWN:
    case FieldType.RADIO:
    case FieldType.CHECKBOX:
      if (!watch || !setValue) return null;
      return <PreviewSelectField {...commonProps} watch={watch} setValue={setValue} />;
    
    case FieldType.MATRIX:
      if (!watch || !setValue) return null;
      return <PreviewMatrixField {...commonProps} watch={watch} setValue={setValue} />;

    case FieldType.TABLE:
      if (!watch || !control) return null; // Using control for useFieldArray
      return <PreviewTableField {...commonProps} control={control} />;

    
    case FieldType.DATE:
    case FieldType.TIME:
      return <PreviewDateField {...commonProps} />;
    
    case FieldType.RATE:
      if (!watch || !setValue) return null;
      return <PreviewRateField {...commonProps} watch={watch} setValue={setValue} />;
    
    case FieldType.HEADER:
    case FieldType.DIVIDER:
    case FieldType.SECTION_COLLAPSE:
    case FieldType.PAGE_BREAK:
      return <PreviewHeaderField field={field} />;
    
    case FieldType.PARAGRAPH:
      return <PreviewParagraphField field={field} />;
    
    case FieldType.FULLNAME:
      return <PreviewFullNameField {...commonProps} />;
    
    case FieldType.ADDRESS:
      return <PreviewAddressField {...commonProps} />;

    case FieldType.SUBMIT:
      return <PreviewSubmitField {...commonProps} />;

    case FieldType.GROUP:
      return <PreviewGroupField field={field} />;

    default:
      return null;
  }
}

