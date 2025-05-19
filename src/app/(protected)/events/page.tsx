'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setEvents, setLoading, setError } from '@/store/slices/eventsSlice';
import { eventService } from '@/services/eventService';
import Layout from '@/components/layout/Layout';
import EventCard from '@/components/events/EventCard';

export default function EventsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);

  const canCreateEvent = user?.role === 'organizer' || user?.role === 'admin';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        dispatch(setLoading(true));
        const data = await eventService.getAllEvents();
        dispatch(setEvents(data));
      } catch (err) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEvents();
  }, [dispatch]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('events.title')}</h1>
          {canCreateEvent && (
            <button
              onClick={() => router.push('/events/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('events.createEvent')}
            </button>
          )}
        </div>

        {Array.isArray(events) && events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">{t('events.noEvents')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(events) ? events : (events?.events || [])).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 