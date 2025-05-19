import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAppDispatch } from '@/store';
import { setError } from '@/store/slices/profileSlice';
import { userService } from '@/services/userService';

export default function ChangePasswordForm() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(setError(t('auth.errors.passwordMismatch')));
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      dispatch(setError(null));
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : t('profile.errors.changePasswordFailed')
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Поточний пароль */}
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700"
        >
          {t('profile.currentPassword')}
        </label>
        <input
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('profile.placeholders.currentPassword')}
        />
      </div>

      {/* Новий пароль */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700"
        >
          {t('profile.newPassword')}
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('profile.placeholders.newPassword')}
        />
      </div>

      {/* Підтвердження нового пароля */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          {t('auth.confirmPassword')}
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-sm pl-2"
          required
          placeholder={t('profile.placeholders.confirmPassword')}
        />
      </div>

      {/* Повідомлення про успіх */}
      {success && (
        <div className="text-green-600 text-sm">
          {t('profile.passwordChanged')}
        </div>
      )}

      {/* Кнопка зміни пароля */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? t('common.updating') : t('profile.changePassword')}
        </button>
      </div>
    </form>
  );
} 