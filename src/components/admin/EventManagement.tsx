import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { adminService } from '@/services/adminService';
import { Event } from '@/types';
import EventForm from '@/components/events/EventForm';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function EventManagement() {
  const { t } = useTranslation('common');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getEvents(page);
      if (page === 1) {
        setEvents(data.events);
      } else {
        setEvents((prev) => [...prev, ...data.events]);
      }
      setHasMore(data.hasMore);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [page]);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm(t('admin.confirmDeleteEvent', 'Ви впевнені, що хочете видалити цю подію?'))) return;
    setLoading(true);
    try {
      await adminService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId: string, status: string) => {
    setLoading(true);
    try {
      const updated = await adminService.updateEventStatus(eventId, status as any);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!editingEvent) return;
    setEditLoading(true);
    setError(null);
    try {
      const response = await adminService.updateEvent(editingEvent.id, formData);
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? response : e)));
      setEditingEvent(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to update event');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t('admin.events', 'Події')}</h2>
      {error && <div className="text-center py-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('events.title', 'Назва')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('events.organizer', 'Організатор')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('events.statusLabel', 'Статус')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('events.startDate', 'Дата початку')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions', 'Дії')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{event.organizer?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    event.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(`events.status.${event.status}`, event.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{event.startDate ? new Date(event.startDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-600 hover:text-blue-900"
                    title={t('admin.edit', 'Редагувати')}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-900"
                    title={t('admin.delete', 'Видалити')}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? t('common.loading', 'Завантаження...') : t('admin.loadMore', 'Завантажити ще')}
          </button>
        </div>
      )}
      {loading && <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" /></div>}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button onClick={handleEditCancel} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <h4 className="text-lg font-semibold mb-2">{t('admin.editEvent', 'Редагування події')}</h4>
            <EventForm
              initialData={editingEvent}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
            {editLoading && <div className="text-center py-2 text-blue-600">{t('common.loading')}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 