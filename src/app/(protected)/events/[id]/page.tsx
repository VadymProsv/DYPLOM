'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedEvent } from '@/store/slices/eventsSlice';
import { eventService } from '@/services/eventService';
import Layout from '@/components/layout/Layout';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import EventForm from '@/components/events/EventForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EventDetailsPage() {
  const { t, i18n } = useTranslation('common');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { selectedEvent } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const locale = i18n.language === 'uk' ? uk : enUS;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const data = await eventService.getEventById(id as string);
        dispatch(setSelectedEvent(data));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, dispatch]);

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPp', { locale });
  };

  const isRegistered = selectedEvent?.participants.some(
    (participant) => participant.id === user?.id
  );

  const handleRegistration = async () => {
    if (!selectedEvent || registering) return;

    setRegistering(true);
    try {
      if (isRegistered) {
        await eventService.unregisterFromEvent(selectedEvent.id);
      } else {
        await eventService.registerForEvent(selectedEvent.id);
      }
      // Оновлюємо дані події після реєстрації/скасування
      const updatedEvent = await eventService.getEventById(selectedEvent.id);
      dispatch(setSelectedEvent(updatedEvent));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : isRegistered
          ? t('events.errors.unregisterFailed')
          : t('events.errors.registerFailed')
      );
    } finally {
      setRegistering(false);
    }
  };

  // Видалення події
  const handleDeleteEvent = async () => {
    if (!window.confirm(t('events.confirmDelete'))) return;
    try {
      await eventService.deleteEvent(selectedEvent.id);
      router.push('/profile');
    } catch (error) {
      setError(error instanceof Error ? error.message : t('events.errors.deleteFailed'));
    }
  };

  // Оновлення події
  const handleUpdateEvent = async (formData: FormData) => {
    try {
      await eventService.updateEvent(selectedEvent.id, formData);
      setShowEditForm(false);
      // Оновити дані події
      const updatedEvent = await eventService.getEventById(selectedEvent.id);
      dispatch(setSelectedEvent(updatedEvent));
    } catch (error) {
      setError(error instanceof Error ? error.message : t('events.errors.updateFailed'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !selectedEvent) {
    return (
      <Layout>
        <div className="text-center text-red-600 min-h-[60vh] flex flex-col justify-center">
          <p>{error || t('events.errors.notFound')}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            {t('common.back')}
          </button>
        </div>
      </Layout>
    );
  }

  const canRegister =
    selectedEvent.status === 'upcoming' &&
    (!selectedEvent.maxParticipants ||
      selectedEvent.participants.length < selectedEvent.maxParticipants);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Кнопка назад */}
          <button
            onClick={() => router.push('/events')}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t('common.backToEvents', 'Назад до всіх подій')}
          </button>
          {/* Заголовок та статус */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedEvent.title}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedEvent.status === 'upcoming'
                    ? 'bg-green-100 text-green-800'
                    : selectedEvent.status === 'ongoing'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedEvent.status === 'completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {t(`events.status.${selectedEvent.status}`)}
              </span>
              {user && user.id === selectedEvent.organizer.id && (
                <>
                  <button
                    className="ml-2 p-2 bg-gray-100 rounded hover:bg-blue-100"
                    title={t('events.edit')}
                    onClick={() => setShowEditForm(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.788l-4 1 1-4 14.362-14.3z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 bg-gray-100 rounded hover:bg-red-100"
                    title={t('events.delete')}
                    onClick={handleDeleteEvent}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Основна інформація */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedEvent.image && (
              <img
                src={selectedEvent.image.startsWith('/uploads') ? `${API_URL}${selectedEvent.image}` : selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover object-center border-b"
              />
            )}
            <div className="p-6">
              {/* Опис */}
              <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

              {/* Деталі */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{formatDate(selectedEvent.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{formatDate(selectedEvent.endDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{selectedEvent.location.address}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <TagIcon className="h-5 w-5 mr-2" />
                    <span>
                      {t(`events.categories.${selectedEvent.category}`)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>
                      {selectedEvent.participants.length}
                      {selectedEvent.maxParticipants &&
                        ` / ${selectedEvent.maxParticipants}`}{' '}
                      {t('events.participants')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Організатор */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('events.organizer')}
                </h3>
                <div className="flex items-center">
                  <img
                    src={selectedEvent.organizer.avatar && selectedEvent.organizer.avatar.startsWith('/uploads') ? `${API_URL}${selectedEvent.organizer.avatar}` : selectedEvent.organizer.avatar || '/default-avatar.svg'}
                    alt={selectedEvent.organizer.name}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedEvent.organizer.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Кнопка реєстрації */}
              {user && user.id !== selectedEvent.organizer.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {canRegister ? (
                    <button
                      onClick={handleRegistration}
                      disabled={registering}
                      className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${
                          isRegistered
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                    >
                      {registering
                        ? t('common.loading')
                        : isRegistered
                        ? t('events.unregister')
                        : t('events.register')}
                    </button>
                  ) : (
                    <p className="text-center text-gray-500">
                      {selectedEvent.status !== 'upcoming'
                        ? t(`events.status.${selectedEvent.status}`)
                        : t('events.full')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Список учасників */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('events.participants')} ({selectedEvent.participants.length})
            </h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                {selectedEvent.participants.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={participant.avatar && participant.avatar.startsWith('/uploads') ? `${API_URL}${participant.avatar}` : participant.avatar || '/default-avatar.svg'}
                          alt={participant.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="text-sm text-gray-900">
                          {participant.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    {t('events.noParticipants')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальне вікно редагування події */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-3xl leading-none p-2 cursor-pointer"
              aria-label="Close modal"
              onClick={() => setShowEditForm(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {t('events.editEvent')}
            </h2>
            <EventForm
              initialData={selectedEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
} 