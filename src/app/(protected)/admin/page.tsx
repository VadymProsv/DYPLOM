'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import Layout from '@/components/layout/Layout';
import Statistics from '@/components/admin/Statistics';
import UserManagement from '@/components/admin/UserManagement';
import EventManagement from '@/components/admin/EventManagement';
import OrganizerRequestsManagement from '@/components/admin/OrganizerRequestsManagement';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('statistics');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

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
    {
      id: 'organizerRequests',
      name: t('admin.organizerRequests.title', 'Заявки на організатора'),
      icon: UserGroupIcon,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('admin.title')}
          </h1>

          {/* Вкладки */}
          <div className="border-b border-gray-200 mb-8 overflow-x-auto">
            <nav className="-mb-px flex space-x-8 min-w-max" style={{ WebkitOverflowScrolling: 'touch' }}>
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

          {/* Вміст вкладки */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'statistics' && <Statistics />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'events' && <EventManagement />}
            {activeTab === 'organizerRequests' && <OrganizerRequestsManagement />}
          </div>
        </div>
      </div>
    </Layout>
  );
} 