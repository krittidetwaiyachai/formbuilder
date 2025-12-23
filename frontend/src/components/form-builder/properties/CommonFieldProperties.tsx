import { Field, FieldType, Form } from '@/types';

interface CommonFieldPropertiesProps {
  field: Field;
  currentForm: Form;
  updateField: (id: string, updates: Partial<Field>) => void;
}

export function CommonFieldProperties({ field, currentForm, updateField }: CommonFieldPropertiesProps) {
  // Fields that have specific custom properties and don't use the generic block (or parts of it)
  // This list matches the exclusion logic in the original file
  const hasCustomRendering = [
    FieldType.FULLNAME,
    FieldType.EMAIL,
    FieldType.ADDRESS,
    FieldType.PHONE,
    FieldType.DATE,
    FieldType.HEADER,
    FieldType.TEXT,
    FieldType.PARAGRAPH,
    FieldType.TEXTAREA,
    FieldType.DROPDOWN,
    FieldType.RADIO,
    FieldType.CHECKBOX,
    FieldType.NUMBER,
    FieldType.TIME,
    FieldType.SUBMIT,
    FieldType.RATE
  ].includes(field.type);

  return (
    <>
      {!hasCustomRendering && (
        <>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
        </>
      )}

      {!hasCustomRendering && (
        <>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-black">
              Required
            </label>
          </div>
          {currentForm.isQuiz && (
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Correct Answer
                </label>
                <input
                  type="text"
                  value={field.correctAnswer || ''}
                  onChange={(e) =>
                    updateField(field.id, { correctAnswer: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Score
                </label>
                <input
                  type="number"
                  value={field.score || 0}
                  onChange={(e) =>
                    updateField(field.id, { score: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
