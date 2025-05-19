import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAppSelector } from '@/store';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OrganizerRequestForm() {
  const { t } = useTranslation('common');
  const { user } = useAppSelector((state) => state.profile);
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  // Перевірка наявності заявки
  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_URL}/api/users/organizer-request/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.data && res.data.status) {
          setRequestStatus(res.data.status);
        } else {
          setRequestStatus('none');
        }
      } catch {
        setRequestStatus('none');
      }
    };
    fetchRequestStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await axios.post(
        `${API_URL}/api/users/organizer-request`,
        {
          organizationName,
          phone,
          email,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (response.status === 201) {
        setSuccess(true);
        setOrganizationName('');
        setPhone('');
        setEmail('');
        setMessage('');
        setRequestStatus('pending');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'user') return null;

  // Повідомлення для різних статусів
  if (requestStatus === 'pending') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        {t('profile.organizerRequest.pendingMessage', 'Ваша заявка на розглядi. Очікуйте рішення адміністратора.')}
      </div>
    );
  }
  if (requestStatus === 'approved') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
        {t('profile.organizerRequest.approvedMessage', 'Ваша заявка вже схвалена. Ви вже організатор.')}
      </div>
    );
  }

  // Якщо статус rejected або none — показуємо форму
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t('profile.organizerRequest.title')}
      </h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {t('profile.organizerRequest.success')}
        </div>
      )}
      {/* Назва організації */}
      <div>
        <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
          {t('profile.organizerRequest.organizationName')}
          <span className="text-red-500">*</span>
        </label>
        <input type="text" id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required placeholder={t('profile.organizerRequest.organizationNamePlaceholder')} />
      </div>
      {/* Номер телефону */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          {t('profile.organizerRequest.phone')}
          <span className="text-red-500">*</span>
        </label>
        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required placeholder="+380 xx xxx xx xx" />
      </div>
      {/* Email організації */}
      <div>
        <label htmlFor="orgEmail" className="block text-sm font-medium text-gray-700">
          {t('profile.organizerRequest.orgEmail')}
          <span className="text-red-500">*</span>
        </label>
        <input type="email" id="orgEmail" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required placeholder={t('profile.organizerRequest.orgEmailPlaceholder')} />
      </div>
      {/* Супровідний лист */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          {t('profile.organizerRequest.message')}
          <span className="text-red-500">*</span>
        </label>
        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px]" required placeholder={t('profile.organizerRequest.messagePlaceholder')} />
      </div>
      {/* Кнопка відправки */}
      <div>
        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {loading ? t('common.sending') : t('profile.organizerRequest.submit')}
        </button>
      </div>
    </form>
  );
} 