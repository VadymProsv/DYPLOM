'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setUser } from '@/store/slices/profileSlice';
import { userService } from '@/services/userService';
import Layout from '@/components/layout/Layout';
import ProfileForm from '@/components/profile/ProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import OrganizerRequestForm from '@/components/profile/OrganizerRequestForm';
import UserEvents from '@/components/profile/UserEvents';

export default function ProfilePage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.profile);
  console.log('USER PROFILE:', user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await userService.getUserProfile();
        if (isMounted) {
          dispatch(setUser(data));
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          if (error instanceof Error && error.message === 'Unauthorized access') {
            router.push('/auth/signin');
          } else {
            setError(error instanceof Error ? error.message : 'Failed to load profile');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('profile.title')}
          </h1>

          {/* Основна інформація профілю */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('profile.personalInfo')}
            </h2>
            <ProfileForm />
          </div>

          {/* Зміна пароля */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('profile.security')}
            </h2>
            <ChangePasswordForm />
          </div>

          {/* Форма подачі заявки на роль організатора */}
          {user.role === 'user' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <OrganizerRequestForm />
            </div>
          )}

          {/* Інтерфейс подій для всіх користувачів */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <UserEvents />
          </div>
        </div>
      </div>
    </Layout>
  );
} 