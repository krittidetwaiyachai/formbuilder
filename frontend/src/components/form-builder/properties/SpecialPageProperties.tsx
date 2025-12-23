import { Form } from '@/types';

interface SpecialPagePropertiesProps {
  currentPage: number;
  currentForm: Form;
  handleFormUpdate: (field: string, value: any) => void;
}

export function SpecialPageProperties({ currentPage, currentForm, handleFormUpdate }: SpecialPagePropertiesProps) {
  const isWelcome = currentPage === -1;
  
  // Layout Options Definition
  const layouts = [
    { id: 'simple', label: 'Simple Centered', icon: <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 bg-gray-200 rounded-md"></div><div className="w-12 h-2 bg-gray-200 rounded"></div></div> },
    { id: 'split-left', label: 'Split Left', icon: <div className="flex items-center gap-2"><div className="w-6 h-10 bg-gray-200 rounded-md"></div><div className="w-8 h-2 bg-gray-200 rounded"></div></div> },
    { id: 'split-right', label: 'Split Right', icon: <div className="flex items-center gap-2"><div className="w-8 h-2 bg-gray-200 rounded"></div><div className="w-6 h-10 bg-gray-200 rounded-md"></div></div> },
    { id: 'cover', label: 'Cover Image', icon: <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md"><div className="w-8 h-8 bg-white/50 rounded-full"></div></div> },
  ] as const;
  
  const activeSettings = isWelcome ? currentForm.welcomeSettings : currentForm.thankYouSettings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Select Layout</h3>
        <div className="grid grid-cols-2 gap-3">
          {layouts.map(layout => (
            <button
              key={layout.id}
              onClick={() => handleFormUpdate(isWelcome ? 'welcomeSettings' : 'thankYouSettings', { ...(isWelcome ? currentForm.welcomeSettings : currentForm.thankYouSettings), layout: layout.id })}
              className={`
                                      relative aspect-[4/3] rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all hover:bg-gray-50
                                      ${activeSettings?.layout === layout.id ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200'}
                                  `}
            >
              {layout.icon}
              <span className="text-xs font-medium text-gray-600">{layout.label}</span>
              {activeSettings?.layout === layout.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>


      {/* Additional Options based on Page Type */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        {!isWelcome && (
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={currentForm.thankYouSettings?.autoRedirect || false}
                  onChange={(e) => handleFormUpdate('thankYouSettings', { ...currentForm.thankYouSettings, autoRedirect: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </div>
              <span className="text-sm font-medium text-gray-600">Auto-redirect</span>
            </label>

            {currentForm.thankYouSettings?.autoRedirect && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="block text-xs font-medium text-gray-500 mb-1">Redirect URL</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                  placeholder="https://google.com"
                  value={currentForm.thankYouSettings?.redirectUrl || ''}
                  onChange={(e) => handleFormUpdate('thankYouSettings', { ...currentForm.thankYouSettings, redirectUrl: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        )}

        {isWelcome && (
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={currentForm.welcomeSettings?.showStartButton ?? true}
                  onChange={(e) => handleFormUpdate('welcomeSettings', { ...currentForm.welcomeSettings, showStartButton: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </div>
              <span className="text-sm font-medium text-gray-600">Show Start Button</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
