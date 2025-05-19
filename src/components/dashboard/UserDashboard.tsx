import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setEvents, setLoading, setError } from '@/store/slices/eventsSlice';
import { eventService } from '@/services/eventService';
import {
  CalendarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import EventCard from '@/components/events/EventCard';

export default function UserDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    {
      id: 'upcoming',
      name: t('user.upcomingEvents'),
      icon: CalendarIcon,
    },
    {
      id: 'registered',
      name: t('user.registeredEvents'),
      icon: ClipboardDocumentCheckIcon,
    },
  ];

  // Події, на які користувач зареєстрований
  const registeredEvents = events.filter(event =>
    event.participants.some(p => p.id === user?.id)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('user.dashboard')}
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
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-4">{t('common.loading')}</div>
            ) : error ? (
              <div className="text-center text-red-600 py-4">{error}</div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">{t('events.noEvents')}</p>
                <button
                  onClick={() => router.push('/events')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('events.browseEvents')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'registered' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-4">{t('common.loading')}</div>
            ) : error ? (
              <div className="text-center text-red-600 py-4">{error}</div>
            ) : registeredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">{t('user.registeredEventsList')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 