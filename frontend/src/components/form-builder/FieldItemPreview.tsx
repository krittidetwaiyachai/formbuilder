import { Field, FieldType } from '@/types';
import { Trash2 } from 'lucide-react';

interface FieldItemPreviewProps {
  field: Field;
}

export default function FieldItemPreview({ field }: FieldItemPreviewProps) {
  const renderFieldPreview = () => {
    const baseInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black";
    const disabledClass = "opacity-60 cursor-not-allowed";

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.PHONE:
        return (
          <input
            type={field.type === FieldType.EMAIL ? 'email' : field.type === FieldType.PHONE ? 'tel' : 'text'}
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
      
      case FieldType.TEXTAREA:
        return (
          <textarea
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            rows={3}
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
      
      case FieldType.NUMBER:
        return (
          <input
            type="number"
            placeholder={field.placeholder || 'Enter number...'}
            disabled
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
      
      case FieldType.DROPDOWN:
        const getDropdownOptions = () => {
          if (!field.options) return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
          if (Array.isArray(field.options)) {
            if (field.options.length > 0 && typeof field.options[0] === 'object') {
              return field.options;
            }
            return field.options.map((opt: string) => ({ label: opt, value: opt }));
          }
          return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
        };
        const dropdownOptions = getDropdownOptions();
        return (
          <select
            disabled
            className={`${baseInputClass} ${disabledClass}`}
          >
            <option value="">{field.placeholder || 'Select an option...'}</option>
            {dropdownOptions.map((opt: any, idx: number) => (
              <option key={idx} value={opt.value || opt.label || opt}>{opt.label || opt.value || opt}</option>
            ))}
          </select>
        );
      
      case FieldType.RADIO:
        const getRadioOptions = () => {
          if (!field.options) return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
          if (Array.isArray(field.options)) {
            if (field.options.length > 0 && typeof field.options[0] === 'object') {
              return field.options;
            }
            return field.options.map((opt: string) => ({ label: opt, value: opt }));
          }
          return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
        };
        const radioOptions = getRadioOptions();
        return (
          <div className="space-y-2">
            {radioOptions.map((opt: any, idx: number) => (
              <label key={idx} className="flex items-center gap-2 cursor-not-allowed opacity-60">
                <input
                  type="radio"
                  name={`preview-${field.id}`}
                  disabled
                  className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                />
                <span className="text-sm text-black">{opt.label || opt.value || opt}</span>
              </label>
            ))}
          </div>
        );
      
      case FieldType.CHECKBOX:
        const getCheckboxOptions = () => {
          if (!field.options) return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
          if (Array.isArray(field.options)) {
            if (field.options.length > 0 && typeof field.options[0] === 'object') {
              return field.options;
            }
            return field.options.map((opt: string) => ({ label: opt, value: opt }));
          }
          return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
        };
        const checkboxOptions = getCheckboxOptions();
        return (
          <div className="space-y-2">
            {checkboxOptions.map((opt: any, idx: number) => (
              <label key={idx} className="flex items-center gap-2 cursor-not-allowed opacity-60">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-black">{opt.label || opt.value || opt}</span>
              </label>
            ))}
          </div>
        );
      
      case FieldType.DATE:
        return (
          <input
            type="date"
            disabled
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
      
      case FieldType.TIME:
        return (
          <input
            type="time"
            disabled
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className={`${baseInputClass} ${disabledClass}`}
          />
        );
    }
  };

  return (
    <div
      className="bg-white border rounded-xl shadow-sm transition-colors border-gray-200"
      style={{ pointerEvents: 'none' }}
    >
      <div className="cursor-grab text-gray-400 px-4 pt-3 pb-2">
        <div className="w-8 h-0.5 bg-gray-400 mx-auto"></div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="font-medium text-black">{field.label}</div>
          </div>
          <div className="flex items-center gap-2">
            {field.required && (
              <span className="text-xs text-white font-medium bg-black px-2 py-0.5 rounded">Required</span>
            )}
          </div>
        </div>
        <div>
          {renderFieldPreview()}
        </div>
      </div>
    </div>
  );
}

