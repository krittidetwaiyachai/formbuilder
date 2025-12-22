import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Mail, Phone, Hash, FileText, ChevronDown, Calendar, Clock, Star, Type, Heading, User, MapPin, AlignLeft, Send, Minus, ChevronRight, FileX } from 'lucide-react';

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
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  switch (field.type) {
    case FieldType.TEXT:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Type className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.EMAIL:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <input
              type="email"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-300 rounded-xl bg-gradient-to-br from-blue-50 to-white text-black text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.PHONE:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Phone className="h-4 w-4 text-green-500" />
            </div>
            <input
              type="tel"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.NUMBER:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Hash className="h-5 w-5 text-green-600 font-bold" />
            </div>
            <input
              type="number"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg bg-gradient-to-r from-green-50 via-white to-green-50 text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.TEXTAREA:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-4 pointer-events-none">
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
            <textarea
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border-2 border-purple-300 rounded-xl bg-gradient-to-br from-purple-50 to-white text-black text-sm shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.DROPDOWN:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-orange-500" />
            </div>
            <select
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className="w-full pl-4 pr-10 py-3 border-2 border-orange-300 rounded-xl bg-gradient-to-br from-orange-50 to-white text-black text-sm shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="">Select an option</option>
              {field.options?.map((opt: any, index: number) => (
                <option key={index} value={opt.value}>
                  {opt.label || opt.value}
                </option>
              ))}
            </select>
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.RADIO:
      return (
        <div className="mb-4">
          <p className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </p>
          <div className="space-y-3 p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border-2 border-pink-200 shadow-sm">
            {field.options?.map((opt: any, index: number) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    id={`${fieldName}_${index}`}
                    value={opt.value}
                    {...register(fieldName, {
                      required: field.required ? `${field.label} is required` : false,
                    })}
                    className="w-5 h-5 text-pink-500 border-2 border-pink-300 focus:ring-2 focus:ring-pink-400 appearance-none rounded-full checked:bg-pink-500 checked:border-pink-500 cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-pink-500 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
                </div>
                <span className="text-sm font-medium text-gray-700 cursor-pointer">{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.CHECKBOX:
      const checkboxValue = watch ? watch(fieldName) : [];
      const isChecked = (value: string) => {
        if (Array.isArray(checkboxValue)) {
          return checkboxValue.includes(value);
        }
        return false;
      };
      
      return (
        <div className="mb-4">
          <p className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </p>
          <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border-2 border-indigo-200 shadow-sm">
            {field.options?.map((opt: any, index: number) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id={`${fieldName}_${index}`}
                    value={opt.value}
                    {...register(fieldName, {
                      required: field.required ? `${field.label} is required` : false,
                    })}
                    className="w-5 h-5 text-indigo-600 border-2 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-400 appearance-none checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer"
                  />
                  {isChecked(opt.value) && (
                    <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 cursor-pointer">{opt.label || opt.value}</span>
              </label>
            ))}
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.DATE:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="h-4 w-4 text-teal-500" />
            </div>
            <input
              type="date"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className="w-full pl-10 pr-4 py-3 border-2 border-teal-300 rounded-xl bg-gradient-to-br from-teal-50 to-white text-black text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.TIME:
      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Clock className="h-4 w-4 text-cyan-500" />
            </div>
            <input
              type="time"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className="w-full pl-10 pr-4 py-3 border-2 border-cyan-300 rounded-xl bg-gradient-to-br from-cyan-50 to-white text-black text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.RATE:
      const [rating, setRating] = useState<number | null>(null);
      const fieldValue = watch ? watch(fieldName) : null;
      
      useEffect(() => {
        if (fieldValue) {
          setRating(Number(fieldValue));
        }
      }, [fieldValue]);

      const handleStarClick = (star: number) => {
        setRating(star);
        if (setValue) {
          setValue(fieldName, star.toString(), { shouldValidate: true });
        }
      };

      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={(e) => {
                  const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                  stars?.forEach((s, idx) => {
                    if (idx < star) {
                      s.querySelector('svg')?.classList.add('scale-110');
                    }
                  });
                }}
                onMouseLeave={(e) => {
                  const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                  stars?.forEach((s) => {
                    s.querySelector('svg')?.classList.remove('scale-110');
                  });
                }}
              >
                <svg
                  className={`w-8 h-8 transition-all duration-150 ${
                    rating && star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 fill-gray-300'
                  } hover:text-yellow-400 hover:fill-yellow-400`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          <input
            type="hidden"
            {...register(fieldName, {
              required: field.required ? `${field.label} is required` : false,
            })}
            value={rating || ''}
          />
          {fieldError && (
            <p className="mt-1 text-sm text-gray-700">{fieldError.message}</p>
          )}
        </div>
      );

    case FieldType.HEADER:
      const headerValidation = field.validation as any;
      const headerSize = headerValidation?.size || 'DEFAULT';
      const headerAlignment = headerValidation?.alignment || 'LEFT';
      const headerSubheading = field.placeholder || '';
      
      const getHeaderSizeClass = () => {
        switch (headerSize) {
          case 'LARGE':
            return 'text-4xl';
          case 'SMALL':
            return 'text-xl';
          default:
            return 'text-2xl';
        }
      };
      
      const getHeaderAlignmentClass = () => {
        switch (headerAlignment) {
          case 'CENTER':
            return 'text-center';
          case 'RIGHT':
            return 'text-right';
          default:
            return 'text-left';
        }
      };
      
      return (
        <div className="mb-6">
          <h2 className={`${getHeaderSizeClass()} font-bold text-black ${getHeaderAlignmentClass()}`}>
            {field.label || 'Heading'}
          </h2>
          {headerSubheading && (
            <p className={`text-sm text-gray-600 mt-2 ${getHeaderAlignmentClass()}`}>
              {headerSubheading}
            </p>
          )}
        </div>
      );

    case FieldType.FULLNAME:
      return (
        <div className="mb-4">
          <p className="block text-sm font-medium text-black mb-2">
            {field.label || 'Full Name'}
            {field.required && <span className="text-black ml-1">*</span>}
          </p>
          <div className="space-y-3 max-w-md">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id={`${fieldName}_first`}
                {...register(`${fieldName}_first`, {
                  required: field.required ? 'First name is required' : false,
                })}
                placeholder="First Name"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id={`${fieldName}_last`}
                {...register(`${fieldName}_last`, {
                  required: field.required ? 'Last name is required' : false,
                })}
                placeholder="Last Name"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>
          </div>
        </div>
      );

    case FieldType.ADDRESS:
      return (
        <div className="mb-4">
          <p className="block text-sm font-medium text-black mb-2">
            {field.label || 'Address'}
            {field.required && <span className="text-black ml-1">*</span>}
          </p>
          <div className="space-y-3 max-w-md">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id={`${fieldName}_street`}
                {...register(`${fieldName}_street`, {
                  required: field.required ? 'Street address is required' : false,
                })}
                placeholder="Street Address"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                id={`${fieldName}_city`}
                {...register(`${fieldName}_city`)}
                placeholder="City"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
              <input
                type="text"
                id={`${fieldName}_state`}
                {...register(`${fieldName}_state`)}
                placeholder="State"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>
            <input
              type="text"
              id={`${fieldName}_zip`}
              {...register(`${fieldName}_zip`)}
              placeholder="ZIP Code"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            />
          </div>
        </div>
      );

    case FieldType.PARAGRAPH:
      return (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {field.placeholder || field.label || 'This is a paragraph. You can add descriptive text here to provide instructions or additional information to your form users.'}
          </p>
        </div>
      );

    case FieldType.SUBMIT:
      // Submit button is handled separately in FormPreviewPage, so we can return null or a placeholder
      return null;

    case FieldType.DIVIDER:
      return (
        <div className="my-6">
          <hr className="border-t-2 border-gray-300" />
        </div>
      );

    case FieldType.SECTION_COLLAPSE:
      const [isCollapsed, setIsCollapsed] = useState(true);
      return (
        <div className="mb-4">
          <div
            className="border-2 border-gray-300 rounded-lg p-4 max-w-md cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-black">{field.label || 'Section Title'}</h3>
              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
            </div>
            {!isCollapsed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Section content goes here...</p>
              </div>
            )}
          </div>
        </div>
      );

    case FieldType.PAGE_BREAK:
      return (
        <div className="my-8 border-t-2 border-dashed border-gray-400">
          <div className="flex items-center justify-center gap-2 text-gray-500 mt-4">
            <FileX className="h-5 w-5" />
            <span className="text-sm font-medium">Page Break</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

