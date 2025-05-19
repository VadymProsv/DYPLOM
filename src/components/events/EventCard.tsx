import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Event } from '@/types';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'uk' ? uk : enUS;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'PPp', { locale });
  };

  const organizer = typeof event.organizer === 'object'
    ? event.organizer
    : { name: '—', avatar: '/default-avatar.svg' };

  const avatarUrl = organizer.avatar && organizer.avatar.startsWith('/uploads')
    ? `${API_URL}${organizer.avatar}`
    : organizer.avatar || '/default-avatar.svg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/events/${event.id}`} className="block">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {event.title}
            </h3>
            <span className={`px-2 py-1 rounded text-sm ${
              event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
              event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
              event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {t(`events.status.${event.status}`)}
            </span>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-gray-500">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span>{formatDate(event.startDate)}</span>
            </div>

            <div className="flex items-center text-gray-500">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>{event.location.address}</span>
            </div>

            <div className="flex items-center text-gray-500">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              <span>
                {event.participants.length}
                {event.maxParticipants && ` / ${event.maxParticipants}`}
                {' '}
                {t('events.participants')}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <Image
              src={avatarUrl}
              alt={organizer.name}
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
            <span className="text-sm text-gray-600">
              {organizer.name}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
} 