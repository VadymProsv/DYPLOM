import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { setEvents, setLoading, setError } from '@/store/slices/profileSlice';
import { userService } from '@/services/userService';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import EventForm from '@/components/events/EventForm';
import { eventService } from '@/services/eventService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function UserEvents() {
  const { t, i18n } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.profile);
  const locale = i18n.language === 'uk' ? uk : enUS;
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      dispatch(setLoading(true));
      try {
        const data = await userService.getUserEvents();
        dispatch(setEvents(data));
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : t('profile.errors.loadEventsFailed')
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEvents();
  }, [dispatch, t]);

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPp', { locale });
  };

  // Додаємо функцію для створення події
  const handleCreateEvent = async (data) => {
    try {
      await eventService.createEvent(data);
      setShowEventForm(false);
      setEditEvent(null);
      // Оновити список подій після створення
      const updated = await userService.getUserEvents();
      dispatch(setEvents(updated));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Помилка створення події');
    }
  };

  // Оновлення події
  const handleUpdateEvent = async (id, data) => {
    try {
      await eventService.updateEvent(id, data);
      setShowEventForm(false);
      setEditEvent(null);
      const updated = await userService.getUserEvents();
      dispatch(setEvents(updated));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Помилка редагування події');
    }
  };

  // Відфільтрувати події, які організовує поточний користувач
  const myOrganizingEvents = events.organizing.filter(event => {
    if (!event.organizer) return false;
    // organizer може бути як об'єкт, так і id
    return (event.organizer.id || event.organizer._id || event.organizer) === user?.id;
  });

  // Видалення події
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm(t('events.confirmDelete'))) return;
    try {
      await eventService.deleteEvent(eventId);
      // Оновити список подій після видалення
      const updated = await userService.getUserEvents();
      dispatch(setEvents(updated));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Помилка видалення події');
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Події, які організовує користувач (тільки для організатора) */}
      {user?.role === 'organizer' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('profile.organizingEvents')}
            </h3>
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => { setEditEvent(null); setShowEventForm(true); }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('events.createEvent')}
            </button>
          </div>
          {myOrganizingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {myOrganizingEvents.map((event) => (
                <div key={event.id} className="relative group bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <Link
                    href={`/events/${event.id}`}
                    className="block p-4"
                  >
                    {event.image && (
                      <img
                        src={event.image.startsWith('/uploads') ? `${API_URL}${event.image}` : event.image}
                        alt={event.title}
                        className="w-full h-40 object-cover object-center rounded mb-2"
                      />
                    )}
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        {event.location.address}
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 mr-2" />
                        {event.participants.length}
                        {event.maxParticipants && ` / ${event.maxParticipants}`}
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      className="p-2 bg-gray-100 rounded hover:bg-blue-100"
                      title={t('events.edit')}
                      onClick={() => { setEditEvent(event); setShowEventForm(true); }}
                    >
                      <PencilIcon className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 rounded hover:bg-red-100"
                      title={t('events.delete')}
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('profile.noOrganizingEvents')}</p>
          )}
        </div>
      )}

      {/* Події, в яких бере участь користувач */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('profile.participatingEvents')}
        </h3>
        {events.participating.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {events.participating.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="relative group bg-white rounded-lg shadow hover:shadow-md transition-shadow block"
              >
                {event.image && (
                  <img
                    src={event.image.startsWith('/uploads') ? `${API_URL}${event.image}` : event.image}
                    alt={event.title}
                    className="w-full h-40 object-cover object-center rounded mb-2"
                  />
                )}
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {event.title}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {event.location.address}
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      {event.participants.length}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t('profile.noParticipatingEvents')}</p>
        )}
      </div>

      {/* Модальне вікно для створення/редагування події (тільки для організатора) */}
      {user?.role === 'organizer' && showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-3xl leading-none p-2 cursor-pointer"
              aria-label="Close modal"
              onClick={() => { setShowEventForm(false); setEditEvent(null); }}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editEvent ? t('events.editEvent') : t('events.createEvent')}
            </h2>
            <EventForm
              initialData={editEvent}
              onSubmit={editEvent
                ? (formData) => handleUpdateEvent(editEvent.id, formData)
                : handleCreateEvent}
              onCancel={() => { setShowEventForm(false); setEditEvent(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 