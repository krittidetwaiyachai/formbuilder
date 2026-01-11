import { useState } from 'react';
import { Form } from '@/types';
import { 
  Check, 
  Palette,
  ExternalLink,
  ChevronDown,
  ThumbsUp,
  Heart,
  Star,
  Trophy,
  PartyPopper,
  Rocket,
  Sparkles
} from 'lucide-react';

interface SpecialPagePropertiesProps {
  currentPage: number;
  currentForm: Form;
  handleFormUpdate: (field: string, value: any) => void;
}

export function SpecialPageProperties({ currentPage, currentForm, handleFormUpdate }: SpecialPagePropertiesProps) {
  const isWelcome = currentPage === -1;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    style: true,
    actions: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const availableIcons = [
    { id: 'rocket', label: 'Rocket', icon: Rocket },
    { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { id: 'check', label: 'Check', icon: Check },
    { id: 'thumbsUp', label: 'Thumbs Up', icon: ThumbsUp },
    { id: 'heart', label: 'Heart', icon: Heart },
    { id: 'star', label: 'Star', icon: Star },
    { id: 'trophy', label: 'Trophy', icon: Trophy },
    { id: 'party', label: 'Party', icon: PartyPopper },
  ] as const;

  const iconColors = [
    { id: 'green', label: 'Green', color: 'bg-gradient-to-br from-emerald-400 to-green-500' },
    { id: 'blue', label: 'Blue', color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
    { id: 'purple', label: 'Purple', color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
    { id: 'orange', label: 'Orange', color: 'bg-gradient-to-br from-orange-400 to-orange-500' },
    { id: 'pink', label: 'Pink', color: 'bg-gradient-to-br from-pink-400 to-pink-500' },
    { id: 'red', label: 'Red', color: 'bg-gradient-to-br from-red-400 to-red-500' },
    { id: 'yellow', label: 'Yellow', color: 'bg-gradient-to-br from-yellow-400 to-yellow-500' },
    { id: 'gray', label: 'Gray', color: 'bg-gradient-to-br from-gray-600 to-gray-800' },
    { id: 'white', label: 'White', color: 'bg-white border border-gray-200 shadow-sm' },
  ];

  const activeSettings = isWelcome ? currentForm.welcomeSettings : currentForm.thankYouSettings;

  const updateSetting = (key: string, value: any) => {
      const settingType = isWelcome ? 'welcomeSettings' : 'thankYouSettings';
      const currentSettings = isWelcome ? currentForm.welcomeSettings : currentForm.thankYouSettings;
      handleFormUpdate(settingType, { ...currentSettings, [key]: value });
  };

  const SectionHeader = ({ title, section, icon: Icon }: { title: string; section: string; icon: any }) => (
    <button 
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-2 group"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</h3>
      </div>
      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* STYLE SECTION (Merged with Icon selection) */}
        <div className="border-b border-gray-100 pb-4">
          <SectionHeader title="Appearance" section="style" icon={Palette} />
          {expandedSections.style && (
            <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              
              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons.map(item => (
                    <button
                      key={item.id}
                      onClick={() => updateSetting('icon', item.id)}
                      className={`
                        aspect-square rounded-md border flex items-center justify-center transition-all
                        ${((activeSettings as any)?.icon || (isWelcome ? 'sparkles' : 'check')) === item.id 
                          ? 'border-black bg-gray-50 text-black' 
                          : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}
                      `}
                      title={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Color */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Icon Color</label>
                <div className="flex gap-2">
                  {iconColors.map(color => (
                    <button
                      key={color.id}
                      onClick={() => updateSetting('iconColor', color.id)}
                      className={`
                        w-8 h-8 rounded-full ${color.color} flex items-center justify-center transition-all
                        ${activeSettings?.iconColor === color.id || (!activeSettings?.iconColor && color.id === (isWelcome ? 'blue' : 'green'))
                          ? 'ring-2 ring-offset-2 ring-black' 
                          : 'opacity-60 hover:opacity-100 scale-90 hover:scale-100'}
                      `}
                      title={color.label}
                    >
                      {(activeSettings?.iconColor === color.id || (!activeSettings?.iconColor && color.id === (isWelcome ? 'blue' : 'green'))) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


      {/* ACTIONS SECTION */}
      {!isWelcome && (
        <div className="border-b border-gray-100 pb-4">
          <SectionHeader title="Actions" section="actions" icon={ExternalLink} />
          {expandedSections.actions && (
            <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Auto Redirect */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">Auto-redirect</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={currentForm.thankYouSettings?.autoRedirect || false}
                      onChange={(e) => updateSetting('autoRedirect', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                  </div>
                </label>

                {currentForm.thankYouSettings?.autoRedirect && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Redirect URL</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="https://google.com"
                        value={currentForm.thankYouSettings?.redirectUrl || ''}
                        onChange={(e) => updateSetting('redirectUrl', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Delay (seconds)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="3"
                        value={currentForm.thankYouSettings?.redirectDelay || 3}
                        onChange={(e) => updateSetting('redirectDelay', parseInt(e.target.value) || 0)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confetti Toggle */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">Confetti Effect</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={currentForm.thankYouSettings?.showConfetti ?? false}
                      onChange={(e) => updateSetting('showConfetti', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                  </div>
                </label>
              </div>

              {/* Show Button */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">Show Button</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={currentForm.thankYouSettings?.showButton ?? false}
                      onChange={(e) => updateSetting('showButton', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                  </div>
                </label>

                {currentForm.thankYouSettings?.showButton && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="Back to Home"
                        value={currentForm.thankYouSettings?.buttonText || ''}
                        onChange={(e) => updateSetting('buttonText', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Button Link</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="https://yourwebsite.com"
                        value={currentForm.thankYouSettings?.buttonLink || ''}
                        onChange={(e) => updateSetting('buttonLink', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WELCOME PAGE OPTIONS */}
      {isWelcome && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-600">Show Start Button</span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={currentForm.welcomeSettings?.showStartButton ?? true}
                onChange={(e) => updateSetting('showStartButton', e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
