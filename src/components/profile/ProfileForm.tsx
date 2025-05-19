import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUser, setError } from '@/store/slices/profileSlice';
import { userService } from '@/services/userService';
import { CameraIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProfileForm() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.profile);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      console.log('User avatar from store (useEffect):', user.avatar);
      const avatarUrl = user.avatar
        ? user.avatar.startsWith('/uploads')
          ? `${API_URL}${user.avatar}`
          : user.avatar
        : '/default-avatar.svg';
      console.log('Constructed previewUrl (useEffect):', avatarUrl);
      setPreviewUrl(avatarUrl);
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setLoading(true);
        const updatedUser = await userService.updateProfile({ avatar: file });
        console.log('Updated user object from backend (handleAvatarChange):', updatedUser);
        setPreviewUrl(
          updatedUser.avatar && updatedUser.avatar.startsWith('/uploads')
            ? `${API_URL}${updatedUser.avatar}`
            : updatedUser.avatar || '/default-avatar.svg'
        );
        console.log('Constructed previewUrl after upload (handleAvatarChange):', previewUrl);
        dispatch(updateUser(updatedUser));
      } catch (error) {
        console.error('Error uploading avatar:', error);
        dispatch(setError(error instanceof Error ? error.message : 'Failed to upload avatar'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updatedUser = await userService.updateProfile({
        name: name !== user.name ? name : undefined,
        email: email !== user.email ? email : undefined,
      });
      dispatch(updateUser(updatedUser));
      dispatch(setError(null));
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : t('profile.errors.updateFailed')
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Аватар */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
            <Image
              src={previewUrl || '/default-avatar.svg'}
              alt={user.name || 'Profile'}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
          >
            <CameraIcon className="h-5 w-5 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {t('profile.clickToChange')}
        </p>
      </div>

      {/* Ім'я */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          {t('auth.name')}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          {t('auth.email')}
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      {/* Кнопка збереження */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? t('common.updating') : t('common.save')}
        </button>
      </div>
    </form>
  );
} 