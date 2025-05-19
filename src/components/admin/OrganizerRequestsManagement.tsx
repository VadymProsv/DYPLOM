import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { organizerRequestService, OrganizerRequest } from '@/services/organizerRequestService';

interface OrganizerRequestWithUser extends OrganizerRequest {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrganizerRequestsManagement() {
  const { t } = useTranslation('common');
  const [requests, setRequests] = useState<OrganizerRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<OrganizerRequestWithUser | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await organizerRequestService.getAllRequests();
      setRequests(Array.isArray(data) ? data : data.requests || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await organizerRequestService.approveRequest(id);
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await organizerRequestService.rejectRequest(id);
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    }
  };

  const handleView = async (id: string) => {
    try {
      const req = await organizerRequestService.getRequestById(id);
      setSelectedRequest(req);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request details');
    }
  };

  const closeModal = () => setSelectedRequest(null);

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{t('admin.organizerRequests.title', 'Заявки на організатора')}</h3>
      {requests.length === 0 ? (
        <p className="text-center text-gray-600">{t('admin.organizerRequests.noRequests', 'Немає нових заявок.')}</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {requests.map((request, idx) => (
            <li key={request.id || `request-${idx}`} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('admin.organizerRequests.user', 'Користувач')}: {typeof request.user === 'object' && request.user !== null ? (request.user.name || request.userId) : (request.user || request.userId)} ({typeof request.user === 'object' && request.user !== null ? (request.user.email || '') : ''})</p>
                  <p className="text-sm text-gray-600">{t('admin.organizerRequests.organization', 'Організація')}: {typeof request.organizationName === 'object' ? JSON.stringify(request.organizationName) : request.organizationName}</p>
                  <p className="text-sm text-gray-600">{t('admin.organizerRequests.phone', 'Телефон')}: {typeof request.phone === 'object' ? JSON.stringify(request.phone) : request.phone}</p>
                  {request.message && (
                    <p className="text-sm text-gray-600">{t('admin.organizerRequests.message', 'Повідомлення')}: {typeof request.message === 'object' ? JSON.stringify(request.message) : request.message}</p>
                  )}
                  <p className={`text-sm font-semibold ${
                    request.status === 'pending' ? 'text-yellow-600' :
                    request.status === 'approved' ? 'text-green-600' :
                    'text-red-600'
                  }`}>{t(`admin.organizerRequests.status.${request.status}`, request.status)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(request.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('admin.organizerRequests.view', 'Переглянути')}
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {t('admin.organizerRequests.approve', 'Схвалити')}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {t('admin.organizerRequests.reject', 'Відхилити')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Модалка для деталей заявки */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
            <h4 className="text-lg font-semibold mb-2">{t('admin.organizerRequests.details', 'Деталі заявки')}</h4>
            <p><b>{t('admin.organizerRequests.user', 'Користувач')}:</b> {typeof selectedRequest.user === 'object' && selectedRequest.user !== null ? (selectedRequest.user.name || selectedRequest.userId) : (selectedRequest.user || selectedRequest.userId)} ({typeof selectedRequest.user === 'object' && selectedRequest.user !== null ? (selectedRequest.user.email || '') : ''})</p>
            <p><b>{t('admin.organizerRequests.organization', 'Організація')}:</b> {typeof selectedRequest.organizationName === 'object' ? JSON.stringify(selectedRequest.organizationName) : selectedRequest.organizationName}</p>
            <p><b>{t('admin.organizerRequests.phone', 'Телефон')}:</b> {typeof selectedRequest.phone === 'object' ? JSON.stringify(selectedRequest.phone) : selectedRequest.phone}</p>
            <p><b>{t('admin.organizerRequests.email', 'Email')}:</b> {typeof selectedRequest.email === 'object' ? JSON.stringify(selectedRequest.email) : selectedRequest.email}</p>
            {selectedRequest.message && <p><b>{t('admin.organizerRequests.message', 'Повідомлення')}:</b> {typeof selectedRequest.message === 'object' ? JSON.stringify(selectedRequest.message) : selectedRequest.message}</p>}
            <p><b>{t('admin.organizerRequests.status.label', 'Статус')}:</b> {t(`admin.organizerRequests.status.${selectedRequest.status}`, selectedRequest.status)}</p>
            <div className="mt-4 flex space-x-2">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => { handleApprove(selectedRequest.id); closeModal(); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    {t('admin.organizerRequests.approve', 'Схвалити')}
                  </button>
                  <button
                    onClick={() => { handleReject(selectedRequest.id); closeModal(); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    {t('admin.organizerRequests.reject', 'Відхилити')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 