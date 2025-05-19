import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/store';
import NotificationList from './NotificationList';

export default function NotificationIcon() {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        title={t('notifications.title')}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg overflow-hidden z-40 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {t('notifications.title')}
              </h3>
            </div>
            <NotificationList />
          </div>
        </>
      )}
    </div>
  );
} 