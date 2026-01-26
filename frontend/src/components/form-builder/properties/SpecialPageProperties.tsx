import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    { id: 'rocket', label: t('builder.special.icon.rocket'), icon: Rocket },
    { id: 'sparkles', label: t('builder.special.icon.sparkles'), icon: Sparkles },
    { id: 'check', label: t('builder.special.icon.check'), icon: Check },
    { id: 'thumbsUp', label: t('builder.special.icon.thumbs_up'), icon: ThumbsUp },
    { id: 'heart', label: t('builder.special.icon.heart'), icon: Heart },
    { id: 'star', label: t('builder.special.icon.star'), icon: Star },
    { id: 'trophy', label: t('builder.special.icon.trophy'), icon: Trophy },
    { id: 'party', label: t('builder.special.icon.party'), icon: PartyPopper },
  ] as const;

  const iconColors = [
    { id: 'green', label: t('builder.special.color.green'), color: 'bg-gradient-to-br from-emerald-400 to-green-500' },
    { id: 'blue', label: t('builder.special.color.blue'), color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
    { id: 'purple', label: t('builder.special.color.purple'), color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
    { id: 'orange', label: t('builder.special.color.orange'), color: 'bg-gradient-to-br from-orange-400 to-orange-500' },
    { id: 'pink', label: t('builder.special.color.pink'), color: 'bg-gradient-to-br from-pink-400 to-pink-500' },
    { id: 'red', label: t('builder.special.color.red'), color: 'bg-gradient-to-br from-red-400 to-red-500' },
    { id: 'yellow', label: t('builder.special.color.yellow'), color: 'bg-gradient-to-br from-yellow-400 to-yellow-500' },
    { id: 'gray', label: t('builder.special.color.gray'), color: 'bg-gradient-to-br from-gray-600 to-gray-800' },
    { id: 'white', label: t('builder.special.color.white'), color: 'bg-white border border-gray-200 shadow-sm' },
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
      { }
        <div className="border-b border-gray-100 pb-4">
          <SectionHeader title={t('builder.special_page.appearance')} section="style" icon={Palette} />
          {expandedSections.style && (
            <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              
              { }
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t('builder.special_page.icon')}</label>
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

              { }
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t('builder.special_page.icon_color')}</label>
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


      { }
      {!isWelcome && (
        <div className="border-b border-gray-100 pb-4">
          <SectionHeader title={t('builder.special_page.actions')} section="actions" icon={ExternalLink} />
          {expandedSections.actions && (
            <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              { }
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">{t('builder.special_page.auto_redirect')}</span>
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
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t('builder.special_page.redirect_url')}</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder={t('builder.special_page.redirect_url_placeholder')}
                        value={currentForm.thankYouSettings?.redirectUrl || ''}
                        onChange={(e) => updateSetting('redirectUrl', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t('builder.special_page.delay_seconds')}</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder={t('builder.special_page.delay_placeholder')}
                        value={currentForm.thankYouSettings?.redirectDelay || 3}
                        onChange={(e) => updateSetting('redirectDelay', parseInt(e.target.value) || 0)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>

              { }
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">{t('builder.special_page.confetti_effect')}</span>
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

              { }
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">{t('builder.special_page.show_button')}</span>
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
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t('builder.special_page.button_text')}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder={t('builder.special_page.back_to_home')}
                        value={currentForm.thankYouSettings?.buttonText || ''}
                        onChange={(e) => updateSetting('buttonText', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t('builder.special_page.button_link')}</label>
                      <input
                        type="url"
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder={t('builder.special_page.button_link_placeholder')}
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

      { }
      {isWelcome && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-600">{t('builder.special_page.show_start_button')}</span>
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
