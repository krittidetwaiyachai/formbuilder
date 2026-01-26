import { Search } from 'lucide-react';
import {  useTranslation } from 'react-i18next';


interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: SearchFiltersProps) {
  const { t } = useTranslation();
  
  const STATUS_OPTIONS = [
    { key: 'All', label: t('dashboard.filters.all') },
    { key: 'DRAFT', label: t('dashboard.filters.draft') },
    { key: 'PUBLISHED', label: t('dashboard.filters.published') },
    { key: 'ARCHIVED', label: t('dashboard.filters.archived') }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        { }
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder={t('dashboard.search_placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none placeholder:text-gray-400 shadow-sm hover:border-gray-300"
          />
        </div>

        { }
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto no-scrollbar">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status.key}
              onClick={() => onFilterChange(status.key)}
              className={`flex-1 md:flex-none min-w-[80px] px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === status.key
                  ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


