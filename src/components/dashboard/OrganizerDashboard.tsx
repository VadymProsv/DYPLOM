import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setEvents, setLoading, setError } from '@/store/slices/eventsSlice';
import { eventService } from '@/services/eventService';
import {
  CalendarIcon,
  UserGroupIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function OrganizerDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);
  const [activeTab, setActiveTab] = useState('events');

  const tabs = [
    {
      id: 'events',
      name: t('organizer.events'),
      icon: CalendarIcon,
    },
    {
      id: 'participants',
      name: t('organizer.participants'),
      icon: UserGroupIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('organizer.dashboard')}
        </h1>
        <button
          onClick={() => router.push('/events/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          {t('events.createEvent')}
        </button>
      </div>

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
        {activeTab === 'events' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-4">{t('common.loading')}</div>
            ) : error ? (
              <div className="text-center text-red-600 py-4">{error}</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">{t('events.noEvents')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {t('common.viewDetails')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            {/* Participant management content */}
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                {t('organizer.participantManagement')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 