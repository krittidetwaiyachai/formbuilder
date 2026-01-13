import { useTranslation } from 'react-i18next';

interface PropertiesTabsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  tabs?: string[];
}

export const PropertiesTabs = ({ activeTab, setActiveTab, tabs = ['general', 'options', 'advanced'] }: PropertiesTabsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase whitespace-nowrap ${
            activeTab === tab
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          {t(`builder.tabs.${tab}`)}
        </button>
      ))}
    </div>
  );
};
