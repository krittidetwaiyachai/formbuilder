import { Search, ChevronDown } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

const STATUS_OPTIONS = ['All', 'DRAFT', 'PUBLISHED', 'ARCHIVED'];

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all outline-none placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border-2 border-gray-200">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === status
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
