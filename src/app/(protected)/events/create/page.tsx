import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/store';
import { addEvent } from '@/store/slices/eventsSlice';
import { eventService } from '@/services/eventService';
import Layout from '@/components/layout/Layout';
import Map from '@/components/maps/GoogleMap';
import PlacesAutocomplete from '@/components/maps/PlacesAutocomplete';
import { Event } from '@/types';

export default function CreateEventPage() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'military',
    startDate: '',
    endDate: '',
    location: {
      address: '',
      coordinates: {
        lat: 50.4501,
        lng: 30.5234
      }
    },
    maxParticipants: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await eventService.createEvent(formData);
      dispatch(addEvent(response));
      router.push('/events');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        address,
        coordinates
      }
    }));
  };

  const handleMapClick = (coordinates: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates
      }
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('events.createEvent')}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                {t('events.title')}
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t('events.description')}
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                {t('events.category')}
              </label>
              <select
                name="category"
                id="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="military">{t('events.categories.military')}</option>
                <option value="medical">{t('events.categories.medical')}</option>
                <option value="humanitarian">{t('events.categories.humanitarian')}</option>
                <option value="educational">{t('events.categories.educational')}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  {t('events.startDate')}
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  {t('events.endDate')}
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('events.location')}
              </label>
              <PlacesAutocomplete
                onSelect={handleLocationSelect}
                defaultValue={formData.location.address}
                placeholder={t('events.locationPlaceholder')}
                className="mb-4"
              />
              <div className="h-[300px] w-full rounded-lg overflow-hidden">
                <Map
                  center={formData.location.coordinates}
                  markerPosition={formData.location.coordinates}
                  onLocationSelect={handleMapClick}
                  zoom={13}
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                {t('events.maxParticipants')}
              </label>
              <input
                type="number"
                name="maxParticipants"
                id="maxParticipants"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? t('common.creating') : t('common.create')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
} 