import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Statistics from '@/components/admin/Statistics';
import UserManagement from '@/components/admin/UserManagement';
import EventManagement from '@/components/admin/EventManagement';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('statistics');

  const tabs = [
    {
      id: 'statistics',
      name: t('admin.statistics'),
      icon: ChartBarIcon,
    },
    {
      id: 'users',
      name: t('admin.users'),
      icon: UsersIcon,
    },
    {
      id: 'events',
      name: t('admin.events'),
      icon: CalendarIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('admin.dashboard')}
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${
                    activeTab === tab.id
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'statistics' && <Statistics />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'events' && <EventManagement />}
      </div>
    </div>
  );
} 