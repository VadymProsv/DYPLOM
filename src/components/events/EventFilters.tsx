import { useTranslation } from 'next-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { setFilters } from '@/store/slices/eventsSlice';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function EventFilters() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.events.filters);

  const handleFilterChange = (name: string, value: string) => {
    dispatch(setFilters({ [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Пошук */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('events.filters.search')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* Категорія */}
        <select
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">{t('events.filters.allCategories')}</option>
          <option value="military">{t('events.categories.military')}</option>
          <option value="medical">{t('events.categories.medical')}</option>
          <option value="humanitarian">{t('events.categories.humanitarian')}</option>
          <option value="educational">{t('events.categories.educational')}</option>
        </select>

        {/* Дата */}
        <input
          type="date"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
        />

        {/* Локація */}
        <input
          type="text"
          placeholder={t('events.filters.location')}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>
    </div>
  );
} 