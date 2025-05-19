import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppSelector } from '@/store';
import { Event } from '@/types';
import ukLocale from '@fullcalendar/core/locales/uk';
import enLocale from '@fullcalendar/core/locales/en-gb';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    category: string;
    status: string;
    location: string;
  };
}

export default function Calendar() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const { events } = useAppSelector((state) => state.events);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const formattedEvents = events.map((event: Event) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      backgroundColor: getCategoryColor(event.category),
      borderColor: getCategoryColor(event.category),
      textColor: '#ffffff',
      extendedProps: {
        category: event.category,
        status: event.status,
        location: event.location.address,
      },
    }));
    setCalendarEvents(formattedEvents);
  }, [events]);

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'military':
        return '#4f46e5'; // indigo-600
      case 'medical':
        return '#dc2626'; // red-600
      case 'humanitarian':
        return '#16a34a'; // green-600
      case 'educational':
        return '#ca8a04'; // yellow-600
      default:
        return '#6b7280'; // gray-500
    }
  };

  const handleEventClick = (info: any) => {
    router.push(`/events/${info.event.id}`);
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="p-1">
        <div className="font-medium">{eventInfo.event.title}</div>
        <div className="text-xs opacity-75">
          {eventInfo.event.extendedProps.location}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        locale={i18n.language === 'uk' ? ukLocale : enLocale}
        events={calendarEvents}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false,
        }}
        buttonText={{
          today: t('calendar.today'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
        }}
        allDayText={t('calendar.allDay')}
        firstDay={1}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
      />

      {/* Легенда категорій */}
      <div className="mt-4 flex flex-wrap gap-4">
        {['military', 'medical', 'humanitarian', 'educational'].map((category) => (
          <div key={category} className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{ backgroundColor: getCategoryColor(category) }}
            />
            <span className="text-sm text-gray-600">
              {t(`events.categories.${category}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 