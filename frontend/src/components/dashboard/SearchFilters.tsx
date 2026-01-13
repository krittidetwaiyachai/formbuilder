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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('dashboard.search_placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all outline-none placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border-2 border-gray-200">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.key}
            onClick={() => onFilterChange(status.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === status.key
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
