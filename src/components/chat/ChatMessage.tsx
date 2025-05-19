import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { ChatMessage as ChatMessageType } from '@/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/store';
import Image from 'next/image';

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export default function ChatMessage({ message, onEdit, onDelete }: ChatMessageProps) {
  const { t, i18n } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { user } = useAppSelector((state) => state.auth);
  const locale = i18n.language === 'uk' ? uk : enUS;

  const isOwner = user?.id === message.user.id;
  const canModify = isOwner || user?.role === 'admin';

  const handleEdit = () => {
    if (isEditing) {
      onEdit(message.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPp', { locale });
  };

  return (
    <div className={`flex gap-3 ${isOwner ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        <Image
          src={message.user.avatar || '/default-avatar.svg'}
          alt={message.user.name}
          width={40}
          height={40}
          className="rounded-full"
          unoptimized
        />
      </div>
      <div className={`