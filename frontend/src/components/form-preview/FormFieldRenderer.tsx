import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { PreviewTextField } from './fields/PreviewTextField';
import { PreviewEmailField } from './fields/PreviewEmailField';
import { PreviewPhoneField } from './fields/PreviewPhoneField';
import { PreviewNumberField } from './fields/PreviewNumberField';
import { PreviewTextAreaField } from './fields/PreviewTextAreaField';
import { PreviewSelectField } from './fields/PreviewSelectField';
import { PreviewDateField } from './fields/PreviewDateField';
import { PreviewRateField } from './fields/PreviewRateField';
import { PreviewHeaderField } from './fields/PreviewHeaderField';
import { PreviewFullNameField } from './fields/PreviewFullNameField';
import { PreviewAddressField } from './fields/PreviewAddressField';
import { PreviewParagraphField } from './fields/PreviewParagraphField';
import { PreviewSubmitField } from './fields/PreviewSubmitField';

interface FormFieldRendererProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  watch?: ReturnType<typeof useForm>['watch'];
  setValue?: ReturnType<typeof useForm>['setValue'];
}

export default function FormFieldRenderer({
  field,
  register,
  errors,
  watch,
  setValue,
}: FormFieldRendererProps) {
  
  const commonProps = { field, register, errors };

  switch (field.type) {
    case FieldType.TEXT:
      return <PreviewTextField {...commonProps} />;
    
    case FieldType.EMAIL:
      return <PreviewEmailField {...commonProps} />;
    
    case FieldType.PHONE:
      return <PreviewPhoneField {...commonProps} />;
    
    case FieldType.NUMBER:
      return <PreviewNumberField {...commonProps} />;
    
    case FieldType.TEXTAREA:
      return <PreviewTextAreaField {...commonProps} />;
    
    case FieldType.DROPDOWN:
    case FieldType.RADIO:
    case FieldType.CHECKBOX:
      if (!watch) return null; // Should ideally always be present
      return <PreviewSelectField {...commonProps} watch={watch} />;
    
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

    default:
      return null;
  }
}
