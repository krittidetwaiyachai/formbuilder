import { Form } from '@/types';
import { useFormStore } from '@/store/formStore';
import { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/custom-select';
import { GraduationCap } from 'lucide-react';

interface FormSettingsPropertiesProps {
  currentForm: Form;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription: string;
  setFormDescription: (desc: string) => void;
  handleFormUpdate: (field: string, value: any) => void;
}

export function FormSettingsProperties({
  currentForm,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  handleFormUpdate,
}: FormSettingsPropertiesProps) {
  const settings = currentForm.settings || {};
  const [hasResponseLimit, setHasResponseLimit] = useState(!!settings.responseLimit);
  const [activeTab, setActiveTab] = useState<'general' | 'submission' | 'display'>('general');

  const updateSettings = (key: string, value: any) => {
    handleFormUpdate('settings', {
      ...settings,
      [key]: value,
    });
  };

  /* Custom Smooth Scroll Animation */
  const smoothScrollToElement = (element: HTMLElement) => {
    const container = element.closest('.overflow-y-auto') as HTMLElement; // Find parent scroll container
    if (!container) return;

    const targetPosition = element.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2); // Center alignment
    const startPosition = container.scrollTop;
    const distance = targetPosition - startPosition;
    const duration = 1200; // Duration in ms (slower than browser default ~300-500ms)
    let startTime: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);

      container.scrollTop = run;

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const { shouldScrollToQuizSettings, setShouldScrollToQuizSettings } = useFormStore();
  const quizSettingsRef = useRef<HTMLDivElement>(null);
  const prevIsQuiz = useRef(currentForm.isQuiz);
  
  useEffect(() => {
    // Check if Quiz Mode was just toggled ON (change from false to true)
    const isQuizToggledOn = !prevIsQuiz.current && currentForm.isQuiz;

    if (currentForm.isQuiz && quizSettingsRef.current) {
        // Scroll ONLY if requested explicitly via flag OR if just toggled ON
        if (shouldScrollToQuizSettings || isQuizToggledOn) {
            // Delay slightly to allow animation/render
            setTimeout(() => {
                // Use custom smooth scroll instead of native scrollIntoView
                smoothScrollToElement(quizSettingsRef.current!);
            }, 100);
            
            // Reset flag if it was used
            if (shouldScrollToQuizSettings) {
                setShouldScrollToQuizSettings(false);
            }
        }
    }

    prevIsQuiz.current = currentForm.isQuiz;
  }, [currentForm.isQuiz, shouldScrollToQuizSettings, setShouldScrollToQuizSettings]);

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md">
        {['general', 'submission', 'display'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase ${
              activeTab === tab
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  handleFormUpdate('title', e.target.value);
                }}
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
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  handleFormUpdate('description', e.target.value);
                }}
                rows={3}
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
                Status
              </label>
              <Select
                value={currentForm.status}
                onValueChange={(value) => handleFormUpdate('status', value)}
              >
                <SelectTrigger className="w-full bg-white border-gray-400">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footerText || ''}
                onChange={(e) => updateSettings('footerText', e.target.value)}
                placeholder="© 2024 Your Company. All rights reserved."
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Custom text displayed at the bottom of the form
              </p>
            </div>

            {/* Quiz Mode Toggle - Redesigned */}
            <div
              onClick={() => handleFormUpdate('isQuiz', !currentForm.isQuiz)}
              className={`
                relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 mb-6
                ${currentForm.isQuiz
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${currentForm.isQuiz ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}
                `}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold text-base ${currentForm.isQuiz ? 'text-black' : 'text-gray-700'}`}>
                    Quiz Mode
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Assign points and set correct answers</p>
                </div>
              </div>

              {/* Switch Toggle */}
              <div className={`
                w-12 h-7 rounded-full transition-colors relative shrink-0
                ${currentForm.isQuiz ? 'bg-black' : 'bg-gray-200'}
              `}>
                <div className={`
                  absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200
                  ${currentForm.isQuiz ? 'translate-x-5' : 'translate-x-0'}
                `} />
              </div>
            </div>

            {/* QUIZ SETTINGS - แสดงเมื่อเปิด Quiz Mode */}
            {currentForm.isQuiz && (
              <div 
                ref={quizSettingsRef}
                className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
              >
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Quiz Settings</h4>
                
                {/* Release Score Mode */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Release Score
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="releaseScoreMode"
                        value="immediately"
                        checked={!currentForm.quizSettings?.releaseScoreMode || currentForm.quizSettings?.releaseScoreMode === 'immediately'}
                        onChange={(e) => handleFormUpdate('quizSettings', {
                          ...currentForm.quizSettings,
                          releaseScoreMode: e.target.value as 'immediately' | 'manual'
                        })}
                        className="h-4 w-4 text-black focus:ring-black border-gray-400"
                      />
                      <span className="ml-2 text-sm text-black">Immediately after submission</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="releaseScoreMode"
                        value="manual"
                        checked={currentForm.quizSettings?.releaseScoreMode === 'manual'}
                        onChange={(e) => handleFormUpdate('quizSettings', {
                          ...currentForm.quizSettings,
                          releaseScoreMode: e.target.value as 'immediately' | 'manual'
                        })}
                        className="h-4 w-4 text-black focus:ring-black border-gray-400"
                      />
                      <span className="ml-2 text-sm text-black">Later, after manual review</span>
                    </label>
                  </div>
                </div>

                {/* Respondents Can See */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">Respondents Can See</p>
                  
                  <div className="space-y-3">
                    {/* Total Score */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Total Score
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentForm.quizSettings?.totalScore || 100}
                        onChange={(e) => handleFormUpdate('quizSettings', {
                          ...currentForm.quizSettings,
                          totalScore: parseInt(e.target.value) || 100
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Set the maximum score for this quiz (e.g., 50, 100, 200)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Show Score
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.showScore || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            showScore: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Display total score to respondents</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Show Correct Answers
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.showAnswer || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            showAnswer: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Show the correct answers</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Missed Questions
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.allowViewMissedQuestions || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            allowViewMissedQuestions: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Allow viewing questions answered incorrectly</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Point Values
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.showDetail || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            showDetail: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Show points for each question</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Show Explanation
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.showExplanation || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            showExplanation: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Display explanations for answers</p>
                    </div>
                  </div>
                </div>

                {/* Quiz Options */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">Quiz Options</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Shuffle Questions
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.shuffleQuestions || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            shuffleQuestions: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Randomize question order for each respondent</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Require Sign In
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentForm.quizSettings?.requireSignIn || false}
                          onChange={(e) => handleFormUpdate('quizSettings', {
                            ...currentForm.quizSettings,
                            requireSignIn: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <p className="mt-1 text-xs text-gray-500">Require users to log in before taking the quiz</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBMISSION TAB */}
        {activeTab === 'submission' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Submit Button Text
              </label>
              <input
                type="text"
                value={settings.submitButtonText || ''}
                onChange={(e) => updateSettings('submitButtonText', e.target.value)}
                placeholder="Submit"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Success Message
              </label>
              <textarea
                value={settings.successMessage || ''}
                onChange={(e) => updateSettings('successMessage', e.target.value)}
                rows={2}
                placeholder="Thank you! Your response has been recorded."
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Message shown after successful submission
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Allow Multiple Submissions
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMultipleSubmissions || false}
                  onChange={(e) => updateSettings('allowMultipleSubmissions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Allow users to submit the form multiple times
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Collect Email
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.collectEmail || false}
                  onChange={(e) => updateSettings('collectEmail', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Require respondents to enter their email address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Response Limit
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasResponseLimit}
                  onChange={(e) => {
                    setHasResponseLimit(e.target.checked);
                    if (!e.target.checked) {
                      updateSettings('responseLimit', undefined);
                    } else {
                      updateSettings('responseLimit', 100);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              {hasResponseLimit && (
                <div className="mt-2">
                  <input
                    type="number"
                    value={settings.responseLimit || 100}
                    onChange={(e) => updateSettings('responseLimit', parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    placeholder="Maximum responses"
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Limit the total number of responses accepted
              </p>
            </div>
          </div>
        )}

        {/* DISPLAY TAB */}
        {activeTab === 'display' && (
          <div className="space-y-4">
            {/* Form Layout */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Form Layout
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Classic Form Card */}
                <button
                  type="button"
                  onClick={() => updateSettings('formLayout', 'classic')}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    (!settings.formLayout || settings.formLayout === 'classic')
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="bg-blue-100 rounded-md p-2 mb-2 border border-blue-300">
                    <div className="space-y-1.5">
                      <div className="h-2 bg-blue-200 rounded w-full"></div>
                      <div className="h-2 bg-blue-200 rounded w-full"></div>
                      <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                      <div className="h-4 bg-green-500 rounded w-1/3 mt-2"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-black">Classic Form</div>
                    <div className="text-xs text-gray-500">All questions on one page</div>
                  </div>
                  {(!settings.formLayout || settings.formLayout === 'classic') && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Card Form Card */}
                <button
                  type="button"
                  onClick={() => updateSettings('formLayout', 'card')}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    settings.formLayout === 'card'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="bg-cyan-100 rounded-md p-2 mb-2 border border-cyan-300">
                    <div className="space-y-1.5">
                      <div className="h-2 bg-white rounded w-1/2"></div>
                      <div className="h-3 bg-green-400 rounded w-full"></div>
                      <div className="h-1.5 bg-blue-300 rounded w-2/3 mt-2"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-black">Card Form</div>
                    <div className="text-xs text-gray-500">Single question per page</div>
                  </div>
                  {settings.formLayout === 'card' && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Choose how questions are displayed to respondents
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Show Progress Bar
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showProgressBar || false}
                  onChange={(e) => updateSettings('showProgressBar', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Display progress indicator (e.g., "Question 3 of 10")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Show Question Number
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showQuestionNumber || false}
                  onChange={(e) => updateSettings('showQuestionNumber', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Prefix questions with numbers (1., 2., 3., etc.)
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
