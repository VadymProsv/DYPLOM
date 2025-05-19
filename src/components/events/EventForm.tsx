import { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';

export interface EventFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function EventForm({ initialData, onSubmit, onCancel }: EventFormProps) {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.startDate ? initialData.startDate.slice(0, 16) : '');
  const [location, setLocation] = useState(initialData?.location?.address || '');
  const [maxParticipants, setMaxParticipants] = useState(initialData?.maxParticipants || '');
  const [contact, setContact] = useState(initialData?.contact || '');
  const [category, setCategory] = useState(initialData?.category || 'military');
  const [endDate, setEndDate] = useState(initialData?.endDate ? initialData.endDate.slice(0, 16) : '');
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('startDate', date);
    formData.append('endDate', endDate);
    formData.append('location', JSON.stringify({ address: location }));
    if (maxParticipants) formData.append('maxParticipants', maxParticipants.toString());
    if (contact) formData.append('contact', contact);
    if (imageFile) formData.append('image', imageFile);
    if (removeImage) formData.append('removeImage', 'true');
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[80vh]">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.title')}
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('events.placeholders.title')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.description')}
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] placeholder:text-sm pl-2"
          required
          placeholder={t('events.placeholders.description')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.date')}
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('events.placeholders.date')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.location')}
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('events.placeholders.location')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.maxParticipants')}
        </label>
        <input
          type="number"
          value={maxParticipants}
          onChange={e => setMaxParticipants(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-sm pl-2"
          min={1}
          placeholder={t('events.placeholders.maxParticipants')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.contact')}
        </label>
        <input
          type="text"
          value={contact}
          onChange={e => setContact(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-sm pl-2"
          placeholder={t('events.placeholders.contact')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.category')}
        </label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        >
          <option value="military">{t('events.categories.military')}</option>
          <option value="medical">{t('events.categories.medical')}</option>
          <option value="humanitarian">{t('events.categories.humanitarian')}</option>
          <option value="educational">{t('events.categories.educational')}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.endDate')}
        </label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('events.endDate')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('events.image')}
        </label>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={e => {
            setImageFile(e.target.files?.[0] || null);
            setRemoveImage(false);
          }}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {(initialData?.image && !imageFile && !removeImage) && (
          <div className="mt-2 flex items-center gap-2">
            <img src={initialData.image} alt="event" className="h-24 rounded object-cover" />
            <button
              type="button"
              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              onClick={() => { setRemoveImage(true); setImageFile(null); }}
            >
              {t('events.removeImage')}
            </button>
          </div>
        )}
        {imageFile && (
          <img src={URL.createObjectURL(imageFile)} alt="preview" className="mt-2 h-24 rounded object-cover" />
        )}
        {removeImage && (
          <div className="mt-2 text-xs text-red-600">{t('events.imageWillBeRemoved')}</div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('events.saveEvent')}
        </button>
      </div>
    </form>
  );
} 