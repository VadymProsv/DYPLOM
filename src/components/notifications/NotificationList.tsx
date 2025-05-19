import { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setNotifications,
  addNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  setLoading,
  setError,
  setHasMore,
  setPage,
} from '@/store/slices/notificationSlice';
import { notificationService } from '@/services/notificationService';

export default function NotificationList() {
  const { t, i18n } = useTranslation('common');
  const dispatch = useAppDispatch();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    page,
  } = useAppSelector((state) => state.notifications);
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const locale = i18n.language === 'uk' ? uk : enUS;

  useEffect(() => {
    const fetchNotifications = async () => {
      dispatch(setLoading(true));
      try {
        const data = await notificationService.getNotifications();
        dispatch(
          setNotifications({
            notifications: data.notifications,
            unreadCount: data.unreadCount,
          })
        );
        dispatch(setHasMore(data.hasMore));
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load notifications'
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchNotifications();
  }, [dispatch]);

  useEffect(() => {
    if (loadingRef.current && hasMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && hasMore) {
            dispatch(setPage(page + 1));
          }
        },
        { threshold: 1.0 }
      );

      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, page, dispatch]);

  useEffect(() => {
    if (page > 1) {
      const loadMoreNotifications = async () => {
        dispatch(setLoading(true));
        try {
          const data = await notificationService.getNotifications(page);
          dispatch(
            addNotifications({
              notifications: data.notifications,
              unreadCount: data.unreadCount,
            })
          );
          dispatch(setHasMore(data.hasMore));
        } catch (error) {
          dispatch(
            setError(
              error instanceof Error
                ? error.message
                : 'Failed to load more notifications'
            )
          );
        } finally {
          dispatch(setLoading(false));
        }
      };

      loadMoreNotifications();
    }
  }, [page, dispatch]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to mark notification as read'
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch(markAllAsRead());
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to mark all notifications as read'
        )
      );
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      dispatch(deleteNotification(notificationId));
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to delete notification'
        )
      );
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'PPp', { locale });
  };

  if (notifications.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BellIcon className="h-12 w-12 mx-auto mb-4" />
        <p>{t('notifications.noNotifications')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-between items-center px-4 py-2 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-600">
            {t('notifications.unreadCount', { count: unreadCount })}
          </span>
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('notifications.markAllAsRead')}
          </button>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 mb-4">{error}</div>
      )}

      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 ${
              !notification.read ? 'bg-blue-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDate(new Date(notification.createdAt))}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title={t('notifications.markAsRead')}
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title={t('notifications.delete')}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loadingRef} className="text-center py-4">
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto" />
          )}
        </div>
      )}
    </div>
  );
} 