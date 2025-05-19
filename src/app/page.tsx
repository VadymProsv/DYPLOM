'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useAppSelector, useAppDispatch } from '@/store';
import { useEffect } from 'react';
import { setUserFromToken } from '@/store/slices/authSlice';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setUserFromToken(token));
    }
  }, [dispatch]);

  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {t('common.appName')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          {t('home.description', 'Платформа для організації військових волонтерських і благочинних заходів')}
        </p>
        <div className="flex flex-col items-center gap-4 justify-center">
          <Link
            href="/events"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('nav.events')}
          </Link>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-6 py-2 bg-blue-100 text-blue-700 rounded-md font-medium shadow hover:bg-blue-200 transition-colors text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
              {t('nav.admin')}
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.features.title', 'Наші можливості')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{t('home.features.organization.title', 'Організація подій')}</h3>
              <p className="text-gray-600">
                {t('home.features.organization.description', 'Створюйте та керуйте волонтерськими заходами легко та ефективно')}
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{t('home.features.coordination.title', 'Координація учасників')}</h3>
              <p className="text-gray-600">
                {t('home.features.coordination.description', 'Зручна система реєстрації та комунікації між організаторами та учасниками')}
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{t('home.features.analytics.title', 'Аналітика')}</h3>
              <p className="text-gray-600">
                {t('home.features.analytics.description', 'Отримуйте детальну статистику та аналітику по вашим заходам')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 