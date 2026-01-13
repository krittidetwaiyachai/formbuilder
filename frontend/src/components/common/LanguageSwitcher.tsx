import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button 
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-50"
        aria-label={t('switch_language')}
      >
        <Globe className="h-4 w-4" />
        <span>{i18n.language === 'th' ? 'TH' : 'EN'}</span>
      </button>

      <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button
          onClick={() => changeLanguage('en')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${i18n.language === 'en' ? 'text-primary font-medium' : 'text-gray-700'}`}
        >
          <span className="text-xs font-bold text-gray-500 w-6">EN</span>
          {t('english')}
        </button>
        <button
          onClick={() => changeLanguage('th')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${i18n.language === 'th' ? 'text-primary font-medium' : 'text-gray-700'}`}
        >
          <span className="text-xs font-bold text-gray-500 w-6">TH</span>
          {t('thai')}
        </button>
      </div>
    </div>
  );
}
