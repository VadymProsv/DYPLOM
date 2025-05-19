import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { hideNotification } from '@/store/slices/uiSlice';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const NOTIFICATION_DURATION = 5000; // 5 seconds

export default function Notification() {
  const dispatch = useAppDispatch();
  const { show, message, type } = useAppSelector(state => state.ui.notifications);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, NOTIFICATION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [show, dispatch]);

  if (!show) return null;

  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    error: <XCircleIcon className="h-6 w-6 text-red-400" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
    warning: <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />,
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center p-4 rounded-lg border ${colors[type]}`}>
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          className="ml-4 flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={() => dispatch(hideNotification())}
        >
          <span className="sr-only">Close</span>
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 