import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Field, FieldType, Form } from '@/types';
import { useTranslation } from 'react-i18next';

interface InlineQuizBarProps {
  field: Field;
  currentForm: Form;
  allFields: Field[];
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
}

export default function InlineQuizBar({ field, currentForm, allFields, onUpdate }: InlineQuizBarProps) {
  const { t } = useTranslation();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  
  
  const [localScore, setLocalScore] = useState<string | number>(field.score || 0);

  
  useEffect(() => {
     setLocalScore(field.score || 0);
  }, [field.score]);
  
  const scoreModalRef = useRef<HTMLDivElement>(null);
  const answerModalRef = useRef<HTMLDivElement>(null);
  const scoreButtonRef = useRef<HTMLButtonElement>(null);
  const answerButtonRef = useRef<HTMLButtonElement>(null);

  const totalScore = currentForm?.quizSettings?.totalScore || 100;
  const usedScore = allFields.filter(f => f.id !== field.id).reduce((sum, f) => sum + (f.score || 0), 0);
  const remainingScore = totalScore - usedScore;
  const maxAllowed = remainingScore + (field.score || 0);

  
  if (field.type === FieldType.GROUP) {
    return null;
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      
      if (
        showScoreModal &&
        scoreModalRef.current && 
        !scoreModalRef.current.contains(e.target as Node) &&
        scoreButtonRef.current &&
        !scoreButtonRef.current.contains(e.target as Node)
      ) {
        setShowScoreModal(false);
      }

      
      if (
        showAnswerModal &&
        answerModalRef.current && 
        !answerModalRef.current.contains(e.target as Node) &&
        answerButtonRef.current &&
        !answerButtonRef.current.contains(e.target as Node)
      ) {
        setShowAnswerModal(false);
        setNewAnswer('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showScoreModal, showAnswerModal]);

  const handleCheckboxToggle = (value: string, checked: boolean) => {
    const currentAnswers = (field.correctAnswer || '').split(',').filter(Boolean);
    let newAnswers = [...currentAnswers];
    if (checked) {
      if (!newAnswers.includes(value)) newAnswers.push(value);
    } else {
      newAnswers = newAnswers.filter(a => a !== value);
    }
    onUpdate(field.id, { correctAnswer: newAnswers.join(',') });
  };

  const addAnswer = () => {
    if (!newAnswer.trim()) return;
    const currentAnswers = (field.correctAnswer || '').split(',').filter(Boolean);
    if (!currentAnswers.includes(newAnswer.trim())) {
      currentAnswers.push(newAnswer.trim());
      onUpdate(field.id, { correctAnswer: currentAnswers.join(',') });
    }
    setNewAnswer('');
  };

  const removeAnswer = (answer: string) => {
    const currentAnswers = (field.correctAnswer || '').split(',').filter(Boolean);
    const newAnswers = currentAnswers.filter(a => a !== answer);
    onUpdate(field.id, { correctAnswer: newAnswers.join(',') });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAnswer();
    }
  };

  const getAnswerDisplay = () => {
    if (!field.correctAnswer) return t('builder.quiz.set_answer');
    const answers = field.correctAnswer.split(',').filter(Boolean);
    if (field.type === FieldType.CHECKBOX) {
      return answers.length > 1 ? `${answers.length} ${t('builder.quiz.options')}` : answers[0];
    }
    if (answers.length > 1) {
      return `${answers.length} ${t('builder.quiz.answers')}`;
    }
    return answers[0].length > 20 ? answers[0].substring(0, 20) + '...' : answers[0];
  };

  return (
    <div className="border-t border-indigo-200 bg-indigo-50/30 px-3 py-2 flex items-center gap-3 text-xs relative">
      { }
      <div className="relative">
        <button
          ref={scoreButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowScoreModal(!showScoreModal);
            setShowAnswerModal(false);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 hover:border-indigo-400 transition-colors shadow-sm"
        >

          <span className="font-semibold text-indigo-900">{field.score || 0}</span>
          <span className="text-gray-500">{t('builder.quiz.pts')}</span>
        </button>

        { }
        {showScoreModal && (
          <div
            ref={scoreModalRef}
            className="absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 left-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">{t('builder.quiz.score')}</label>
              <button onClick={() => setShowScoreModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={localScore}
                onChange={(e) => {
                  const val = e.target.value;
                  
                  
                  if (val !== "" && !/^\d+$/.test(val)) {
                    return;
                  }

                  setLocalScore(val);
                  
                  if (val === "") {
                     return;
                  }
                  
                  const value = parseInt(val, 10);
                  if (!isNaN(value)) {
                    
                    
                    const clamped = Math.min(value, maxAllowed);
                    
                    
                    onUpdate(field.id, { score: clamped });

                    
                    
                    
                    
                  }
                }}
                onBlur={() => {
                   if (localScore === "" || isNaN(parseInt(localScore as string, 10))) {
                      setLocalScore(field.score || 0);
                   } else {
                      
                      setLocalScore(field.score || 0);
                   }
                }}
                className="w-full px-2 py-1.5 pr-10 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{t('builder.quiz.pts')}</div>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {t('builder.quiz.remaining')} <span className="font-bold text-indigo-700">{remainingScore}</span> / {totalScore}
            </p>
          </div>
        )}
      </div>

      { }
      <div className="h-4 w-px bg-indigo-200" />

      { }
      <div className="relative flex-1 min-w-0">
        <button
          ref={answerButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowAnswerModal(!showAnswerModal);
            setShowScoreModal(false);
          }}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 hover:border-indigo-400 transition-colors shadow-sm"
        >

          <span className="font-medium text-gray-700 truncate flex-1 text-left">{getAnswerDisplay()}</span>
        </button>

        { }
        {showAnswerModal && (
          <div
            ref={answerModalRef}
            className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-3 left-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">{t('builder.quiz.correct_answer')}</label>
              <button onClick={() => setShowAnswerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            </div>

            {(field.type === FieldType.RADIO || field.type === FieldType.DROPDOWN) && field.options && field.options.length > 0 ? (
              <select
                value={field.correctAnswer || ''}
                onChange={(e) => onUpdate(field.id, { correctAnswer: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">{t('builder.quiz.select_placeholder')}</option>
                {field.options.map((opt: any, idx: number) => (
                  <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : field.type === FieldType.CHECKBOX && field.options && field.options.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {field.options.map((opt: any, idx: number) => {
                  const correctAnswers = (field.correctAnswer || '').split(',').filter(Boolean);
                  const isChecked = correctAnswers.includes(opt.value);
                  return (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckboxToggle(opt.value, e.target.checked)}
                        className="h-3.5 w-3.5 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              
              <div>
                { }
                {field.correctAnswer && field.correctAnswer.split(',').filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2 p-2 border border-gray-200 rounded bg-gray-50 max-h-32 overflow-y-auto">
                    {field.correctAnswer.split(',').filter(Boolean).map((answer, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium"
                      >
                        {answer}
                        <button
                          onClick={() => removeAnswer(answer)}
                          className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                { }
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('builder.quiz.add_answer')}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={addAnswer}
                    className="px-2 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {t('builder.quiz.answer_instruction')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
