import { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setMessages,
  addMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setLoading,
  setError,
  setHasMore,
  setPage,
} from '@/store/slices/chatSlice';
import { chatService } from '@/services/chatService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatProps {
  eventId: string;
}

export default function Chat({ eventId }: ChatProps) {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { messages, loading, error, hasMore, page } = useAppSelector(
    (state) => state.chat
  );
  const { user } = useAppSelector((state) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      dispatch(setLoading(true));
      try {
        const data = await chatService.getMessages(eventId);
        dispatch(setMessages(data.messages));
        dispatch(setHasMore(data.hasMore));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'Failed to load messages'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchMessages();
  }, [eventId, dispatch]);

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
      const loadMoreMessages = async () => {
        dispatch(setLoading(true));
        try {
          const data = await chatService.getMessages(eventId, page);
          dispatch(addMessages(data.messages));
          dispatch(setHasMore(data.hasMore));
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'Failed to load more messages'));
        } finally {
          dispatch(setLoading(false));
        }
      };

      loadMoreMessages();
    }
  }, [page, eventId, dispatch]);

  const handleSend = async (content: string, attachments?: File[]) => {
    try {
      const message = await chatService.sendMessage(eventId, content, attachments);
      dispatch(addMessage(message));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to send message'));
    }
  };

  const handleEdit = async (messageId: string, content: string) => {
    try {
      const message = await chatService.editMessage(eventId, messageId, content);
      dispatch(updateMessage(message));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to edit message'));
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await chatService.deleteMessage(eventId, messageId);
      dispatch(deleteMessage(messageId));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to delete message'));
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('chat.signInToChat')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Індикатор завантаження більше повідомлень */}
        {hasMore && (
          <div ref={loadingRef} className="text-center py-2">
            {loading && <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>}
          </div>
        )}

        {/* Повідомлення про помилку */}
        {error && (
          <div className="text-center text-red-600 mb-4">
            {error}
          </div>
        )}

        {/* Список повідомлень */}
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Референс для автоскролу */}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле введення */}
      <ChatInput onSend={handleSend} />
    </div>
  );
} 