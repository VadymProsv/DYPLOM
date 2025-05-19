import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppDispatch } from '@/store';
import { setLoading, setError, setUser, setToken } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { showNotification } from '@/store/slices/uiSlice';

export default function SignUpForm() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      dispatch(setError('Passwords do not match'));
      dispatch(showNotification({
        message: t('auth.passwordsDoNotMatch'),
        type: 'error'
      }));
      return;
    }

    dispatch(setLoading(true));
    
    try {
      const { confirmPassword, ...signUpData } = formData;
      console.log('Registration attempt:', { ...signUpData, password: '[REDACTED]' });
      const response = await authService.signUp(signUpData);
      console.log('Registration response:', response);
      
      dispatch(setUser(response.user));
      dispatch(setToken(response.token));
      dispatch(showNotification({
        message: t('auth.signUpSuccess'),
        type: 'success'
      }));
      router.push('/events');
    } catch (error) {
      console.error('Registration error:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Registration failed'));
      dispatch(showNotification({
        message: t('auth.signUpError'),
        type: 'error'
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.signUp')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} method="POST" autoComplete="off">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                {t('auth.name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.name')}
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email')}
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={dispatch(setLoading)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('auth.signUp')}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-gray-600">{t('auth.hasAccount')}</span>{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.signIn')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 