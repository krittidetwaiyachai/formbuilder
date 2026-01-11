import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Field, FieldType, Form } from '@/types';

interface QuizAnswerPopupProps {
  field: Field;
  currentForm: Form;
  allFields: Field[];
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onClose: () => void;
}

export default function QuizAnswerPopup({ field, currentForm, allFields, onUpdate, onClose }: QuizAnswerPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate remaining score
  const totalScore = currentForm?.quizSettings?.totalScore || 100;
  const usedScore = allFields
    .filter(f => f.id !== field.id)
    .reduce((sum, f) => sum + (f.score || 0), 0);
  const remainingScore = totalScore - usedScore;
  const maxAllowed = remainingScore + (field.score || 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleCheckboxToggle = (value: string, checked: boolean) => {
    const currentAnswers = (field.correctAnswer || '').split(',').filter(Boolean);
    let newAnswers = [...currentAnswers];

    if (checked) {
      if (!newAnswers.includes(value)) {
        newAnswers.push(value);
      }
    } else {
      newAnswers = newAnswers.filter(a => a !== value);
    }

    onUpdate(field.id, { correctAnswer: newAnswers.join(',') });
  };

  const renderAnswerSelector = () => {
    if (field.type === FieldType.RADIO || field.type === FieldType.DROPDOWN) {
      if (!field.options || field.options.length === 0) {
        return (
          <p className="text-sm text-gray-600">No options available. Add options first.</p>
        );
      }

      return (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Select correct option:</p>
          <select
            value={field.correctAnswer || ''}
            onChange={(e) => onUpdate(field.id, { correctAnswer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-800 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="">-- Select correct option --</option>
            {field.options.map((opt: any, idx: number) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === FieldType.CHECKBOX) {
      if (!field.options || field.options.length === 0) {
        return (
          <p className="text-sm text-gray-600">No options available. Add options first.</p>
        );
      }

      const correctAnswers = (field.correctAnswer || '').split(',').filter(Boolean);

      return (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Select all correct options:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {field.options.map((opt: any, idx: number) => {
              const isChecked = correctAnswers.includes(opt.value);
              return (
                <label
                  key={idx}
                  className="flex items-center gap-2 cursor-pointer hover:bg-yellow-200 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxToggle(opt.value, e.target.checked)}
                    className="h-4 w-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-900">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    // Text / Long Text / Number fields
    return (
      <div>
        <p className="text-sm font-medium text-gray-900 mb-2">Enter correct answer(s):</p>
        <input
          type="text"
          value={field.correctAnswer || ''}
          onChange={(e) => onUpdate(field.id, { correctAnswer: e.target.value })}
          placeholder="e.g., Bangkok, กรุงเทพ, กรุงเทพมหานคร"
          className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
        />
        <p className="text-xs text-gray-700 mt-2">
          💡 Separate multiple acceptable answers with commas. Any of these will be marked as correct.
        </p>
      </div>
    );
  };

  return (
    <div
      ref={popupRef}
      className="absolute left-0 right-0 mt-2 bg-yellow-300 border-2 border-yellow-400 rounded-lg p-4 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Quiz Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-yellow-400 rounded transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* Score Input */}
      <div className="mb-4 pb-4 border-b border-yellow-500">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Score
        </label>
        <input
          type="number"
          min="0"
          max={maxAllowed}
          value={field.score || 0}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            const clamped = Math.min(value, maxAllowed);
            onUpdate(field.id, { score: clamped });
          }}
          className="w-full px-3 py-2 border border-gray-800 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          onKeyDown={(e) => e.stopPropagation()}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-900 font-medium">
            Remaining: <span className="font-bold">{remainingScore}</span> / {totalScore}
          </span>
          {remainingScore < 0 && (
            <span className="text-red-700 font-semibold">⚠️ Exceeded!</span>
          )}
        </div>
      </div>

      {/* Correct Answer Section */}
      {renderAnswerSelector()}
    </div>
  );
}
