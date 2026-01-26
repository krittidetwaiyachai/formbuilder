import { Field, FieldType, Form } from '@/types';
import { stripHtml } from '@/lib/ui/utils';
import { useTranslation } from 'react-i18next';

interface CommonFieldPropertiesProps {
  field: Field;
  currentForm: Form;
  updateField: (id: string, updates: Partial<Field>) => void;
}

export function CommonFieldProperties({ field, currentForm, updateField }: CommonFieldPropertiesProps) {
  const { t } = useTranslation();
  
  
  
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
              {t('builder.properties.field_label')}
            </label>
            <input
              type="text"
              value={stripHtml(field.label)}
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
              {t('builder.properties.placeholder')}
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

      {!hasCustomRendering && field.type !== FieldType.DIVIDER && (
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
              {t('builder.properties.required')}
            </label>
          </div>
          {currentForm.isQuiz && (
            <div className="space-y-4 p-4 bg-white border-2 border-indigo-200 rounded-xl mt-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-indigo-900 flex items-center gap-2 text-sm">
                  {t('builder.properties.quiz_settings')}
                </h4>
              </div>
              
              { }
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('builder.properties.score')}
                </label>
                {(() => {
                  const totalScore = currentForm.quizSettings?.totalScore || 100;
                  const usedScore = currentForm.fields
                    ?.filter(f => f.id !== field.id)
                    ?.reduce((sum, f) => sum + (f.score || 0), 0) || 0;
                  const remainingScore = totalScore - usedScore;
                  const maxAllowed = remainingScore + (field.score || 0);
                  
                  return (
                    <>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={maxAllowed}
                          value={field.score || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const clamped = Math.min(value, maxAllowed);
                            updateField(field.id, { score: clamped });
                          }}
                          className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                          {t('builder.properties.points_suffix')}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {t('builder.properties.remaining_score')} <span className="font-bold text-indigo-700">{remainingScore}</span> / {totalScore}
                        </span>
                        {remainingScore < 0 && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-semibold">
                            {t('builder.properties.score_exceeded')}
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              
              { }
              <div className="border-t border-gray-200"></div>
              
              { }
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('builder.properties.correct_answer')}
                </label>
                {(field.type === FieldType.RADIO || field.type === FieldType.DROPDOWN) && field.options && field.options.length > 0 ? (
                  <select
                    value={field.correctAnswer || ''}
                    onChange={(e) => updateField(field.id, { correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="">{t('builder.properties.select_correct_option')}</option>
                    {field.options.map((opt: any, idx: number) => (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === FieldType.CHECKBOX && field.options && field.options.length > 0 ? (
                  <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-2">{t('builder.properties.select_all_correct')}</p>
                    {field.options.map((opt: any, idx: number) => {
                      const correctAnswers = (field.correctAnswer || '').split(',').filter(Boolean);
                      const isChecked = correctAnswers.includes(opt.value);
                      
                      return (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let newAnswers = correctAnswers.filter(a => a !== opt.value);
                              if (e.target.checked) {
                                newAnswers.push(opt.value);
                              }
                              updateField(field.id, { correctAnswer: newAnswers.join(',') });
                            }}
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={field.correctAnswer || ''}
                      onChange={(e) => updateField(field.id, { correctAnswer: e.target.value })}
                      placeholder={t('builder.properties.enter_correct_answer')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                          e.stopPropagation();
                        }
                      }}
                    />
                    <p className="mt-2 text-xs text-gray-600 flex items-start gap-1">
                      <span>💡</span>
                      <span>{t('builder.properties.separate_answers_commas')}</span>
                    </p>
                  </>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {field.type === FieldType.CHECKBOX 
                    ? t('builder.properties.checkbox_correct_hint') 
                    : t('builder.properties.text_correct_hint')}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
