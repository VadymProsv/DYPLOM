import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { setStatistics, setLoading, setError } from '@/store/slices/adminSlice';
import { adminService } from '@/services/adminService';
import {
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

export default function Statistics() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const adminState = useAppSelector((state) => {
    console.log('SELECTOR STATE', state);
    return state.admin;
  }) || {};
  const { statistics, loading, error } = adminState;

  useEffect(() => {
    const fetchStatistics = async () => {
      dispatch(setLoading(true));
      try {
        const data = await adminService.getStatistics();
        console.log('STATISTICS DATA FROM API', data);
        dispatch(setStatistics(data));
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : t('admin.errors.loadStatisticsFailed')
          )
        );
      }
    };

    fetchStatistics();
  }, [dispatch, t]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">{error}</div>
    );
  }

  if (!statistics) {
    console.log('NO STATISTICS', statistics);
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  console.log('statistics', statistics);

  const stats = [
    {
      name: t('admin.stats.totalUsers'),
      value: statistics.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: t('admin.stats.activeEvents'),
      value: statistics.activeEvents,
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: t('admin.stats.completedEvents'),
      value: statistics.completedEvents,
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
    },
    {
      name: t('admin.stats.totalParticipants'),
      value: statistics.totalParticipants,
      icon: UserGroupIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Основні показники */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Додаткові метрики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-gray-500 text-sm">{t('admin.stats.organizersCount', 'Організаторів')}</div>
          <div className="text-2xl font-bold">{statistics.organizersCount}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-gray-500 text-sm">{t('admin.stats.avgDuration', 'Середня тривалість (днів)')}</div>
          <div className="text-2xl font-bold">{statistics.avgDuration.toFixed(2)}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-gray-500 text-sm">{t('admin.stats.avgParticipants', 'Середня кількість учасників')}</div>
          <div className="text-2xl font-bold">{statistics.avgParticipants.toFixed(2)}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-gray-500 text-sm">{t('admin.stats.avgEventsPerUser', 'Середня кількість подій на користувача')}</div>
          <div className="text-2xl font-bold">{statistics.avgEventsPerUser.toFixed(2)}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-gray-500 text-sm">{t('admin.stats.avgFillRate', 'Середній % заповненості')}</div>
          <div className="text-2xl font-bold">{(statistics.avgFillRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Діаграма: тривалість подій */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.stats.eventDurationDist', 'Розподіл тривалості подій')}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statistics.eventDurations.map((d, i) => ({ name: `Подія ${i + 1}`, value: d }))}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Діаграма: кількість учасників на подіях */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.stats.participantsDist', 'Кількість учасників на подіях')}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statistics.participantsPerEvent.map((d, i) => ({ name: `Подія ${i + 1}`, value: d }))}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Діаграма: події по місяцях */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.stats.eventsByMonth', 'Події по місяцях')}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={Object.entries(statistics.eventsByMonth).map(([month, count]) => ({ month, count }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Діаграма: категорії подій (pie chart) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.stats.categoryPie', 'Категорії подій')}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={Object.entries(statistics.categoryStats).map(([cat, count]) => ({ name: t(`events.categories.${cat}`), value: count }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {Object.keys(statistics.categoryStats).map((cat, idx) => (
                <Cell key={cat} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][idx % 4]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Статистика по категоріях (progress bar) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('admin.stats.categoryDistribution')}
        </h3>
        <div className="space-y-4">
          {Object.entries(statistics.categoryStats).map(([category, count]) => (
            <div key={category} className="relative">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {t(`events.categories.${category.toLowerCase()}`)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {count}
                </span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${(count / statistics.totalEvents) * 100}%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 