import { Form } from '@/types';
import { useRef, useEffect, useState } from 'react';
import { useFormStore } from '@/store/formStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/custom-select';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const settings = currentForm.settings || {};
  const [hasResponseLimit, setHasResponseLimit] = useState(!!settings.responseLimit);
  const [activeTab, setActiveTab] = useState<'general' | 'submission' | 'display'>('general');

  const updateSettings = (key: string, value: any) => {
    handleFormUpdate('settings', {
      ...settings,
      [key]: value,
    });
  };

  
  const toLocalDateTimeString = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

   
  const smoothScrollToElement = (element: HTMLElement) => {
    const container = element.closest('.overflow-y-auto') as HTMLElement; 
    if (!container) return;

    const targetPosition = element.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2); 
    const startPosition = container.scrollTop;
    const distance = targetPosition - startPosition;
    const duration = 1200; 
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
    
    const isQuizToggledOn = !prevIsQuiz.current && currentForm.isQuiz;

    if (currentForm.isQuiz && quizSettingsRef.current) {
        
        if (shouldScrollToQuizSettings || isQuizToggledOn) {
            
            setTimeout(() => {
                
                smoothScrollToElement(quizSettingsRef.current!);
            }, 100);
            
            
            if (shouldScrollToQuizSettings) {
                setShouldScrollToQuizSettings(false);
            }
        }
    }

    prevIsQuiz.current = currentForm.isQuiz;
  }, [currentForm.isQuiz, shouldScrollToQuizSettings, setShouldScrollToQuizSettings]);

  return (
    <>
      { }
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
            {t(`settings.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        { }
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.general.title')}
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
                {t('settings.general.description')}
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
                {t('settings.general.status')}
              </label>
              <Select
                value={currentForm.status || 'DRAFT'}
                onValueChange={(value) => handleFormUpdate('status', value)}
              >
                <SelectTrigger className="w-full bg-white border-gray-400">
                  <SelectValue placeholder={t('dashboard.filters.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">{t('dashboard.filters.draft')}</SelectItem>
                  <SelectItem value="PUBLISHED">{t('dashboard.filters.published')}</SelectItem>
                  <SelectItem value="ARCHIVED">{t('dashboard.filters.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.general.footer_text')}
              </label>
              <input
                type="text"
                value={settings.footerText || ''}
                onChange={(e) => updateSettings('footerText', e.target.value)}
                placeholder={t('builder.settings.footer_placeholder')}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('settings.general.footer_desc')}
              </p>
            </div>

            { }
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
                    {t('settings.general.quiz_mode')}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{t('settings.general.quiz_desc')}</p>
                </div>
              </div>

              { }
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

            { }
            {currentForm.isQuiz && (
              <div 
                ref={quizSettingsRef}
                className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
              >
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('settings.quiz.settings')}</h4>
                
                { }

                { }
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">{t('settings.quiz.respondents_see')}</p>
                  
                  <div className="space-y-3">
                    { }
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          {t('settings.quiz.total_score')}
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
                        <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.total_score_desc')}</p>
                    </div>

                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.show_score')}
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
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.show_score_desc')}</p>
                    </div>

                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.show_correct')}
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
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.show_correct_desc')}</p>
                    </div>

                    { }
                     <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.missed_questions')}
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
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.missed_desc')}</p>
                    </div>

                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.point_values')}
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
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.point_desc')}</p>
                    </div>

                    { }
                    <div>
                       <label className="block text-sm font-medium text-black mb-1">
                          {t('settings.quiz.show_explanation')}
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
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.explanation_desc')}</p>
                    </div>
                  </div>
                </div>

                { }
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">{t('settings.quiz.options')}</p>
                  
                  <div className="space-y-3">
                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                          {t('settings.quiz.shuffle')}
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
                       <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.shuffle_desc')}</p>
                    </div>

                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                          {t('settings.quiz.require_signin')}
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
                       <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.signin_desc')}</p>
                    </div>
                  </div>
                </div>

                { }
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase">{t('settings.quiz.timing')}</p>
                  
                  <div className="space-y-3">
                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.time_limit')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentForm.quizSettings?.timeLimit || ''}
                        onChange={(e) => handleFormUpdate('quizSettings', {
                          ...currentForm.quizSettings,
                          timeLimit: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        placeholder={t('builder.settings.no_time_limit')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.time_limit_desc')}</p>
                    </div>

                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.start_time')}
                      </label>
                      <input
                        type="datetime-local"
                        lang="en-GB"
                        step="60"
                        value={currentForm.quizSettings?.startTime ? toLocalDateTimeString(currentForm.quizSettings.startTime) : ''}
                        onChange={(e) => handleFormUpdate('quizSettings', {
                          ...currentForm.quizSettings,
                          startTime: e.target.value ? new Date(e.target.value).toISOString() : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      />
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.start_time_desc')}</p>
                    </div>

                    { }
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        {t('settings.quiz.end_time')}
                      </label>
                      <input
                        type="datetime-local"
                        lang="en-GB"
                        step="60"
                        value={currentForm.quizSettings?.endTime ? toLocalDateTimeString(currentForm.quizSettings.endTime) : ''}
                        onChange={(e) => handleFormUpdate('quizSettings', {
                          ...currentForm.quizSettings,
                          endTime: e.target.value ? new Date(e.target.value).toISOString() : undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      />
                      <p className="mt-1 text-xs text-gray-500">{t('settings.quiz.end_time_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        { }
        {activeTab === 'submission' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.submission.submit_text')}
              </label>
              <input
                type="text"
                value={settings.submitButtonText || ''}
                onChange={(e) => updateSettings('submitButtonText', e.target.value)}
                placeholder={t('settings.submission.btn_placeholder')}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.submission.success_msg')}
              </label>
              <textarea
                value={settings.successMessage || ''}
                onChange={(e) => updateSettings('successMessage', e.target.value)}
                rows={2}
                placeholder={t('settings.submission.success_placeholder')}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('settings.submission.success_desc')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.submission.allow_multiple')}
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
                {t('settings.submission.multiple_desc')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.submission.collect_email')}
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
                {t('settings.submission.email_desc')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.submission.response_limit')}
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
                    placeholder={t('builder.settings.max_responses_placeholder')}
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('settings.submission.limit_desc')}
              </p>
            </div>
          </div>
        )}

        { }
        {activeTab === 'display' && (
          <div className="space-y-4">
            { }
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('settings.display.layout')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                { }
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
                    <div className="text-xs font-semibold text-black">{t('settings.display.layout_classic')}</div>
                    <div className="text-xs text-gray-500">{t('settings.display.classic_desc')}</div>
                  </div>
                  {(!settings.formLayout || settings.formLayout === 'classic') && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                { }
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
                    <div className="text-xs font-semibold text-black">{t('settings.display.layout_card')}</div>
                    <div className="text-xs text-gray-500">{t('settings.display.card_desc')}</div>
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
                {t('settings.display.layout_desc')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.display.progress_bar')}
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
                {t('settings.display.progress_desc')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('settings.display.question_number')}
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
                {t('settings.display.number_desc')}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
