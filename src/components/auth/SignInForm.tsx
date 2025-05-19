'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/store';
import { setUser, setToken } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

export default function SignInForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаємо помилку при введенні
    setError(null);
  };

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Form submission started:', {
        email: formData.email,
        hasPassword: !!formData.password,
        passwordLength: formData.password?.length
      });
      
      // Перевірка наявності обох полів
      if (!formData.email || !formData.password) {
        console.log('Form validation failed:', {
          hasEmail: !!formData.email,
          hasPassword: !!formData.password
        });
        setError(t('auth.errors.emailRequired'));
        return;
      }

      const response = await authService.login(formData.email, formData.password);
      console.log('Login successful:', {
        user: response.user,
        hasToken: !!response.token
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        dispatch(setToken(response.token));
        dispatch(setUser(response.user));
        router.replace('/');
      } else {
        setError(t('auth.errors.loginFailed'));
      }
    } catch (err: any) {
      console.error('Login form error:', {
        message: err.message,
        error: err
      });
      
      if (err.message) {
        if (err.message.includes('Invalid email or password')) {
          setError(t('auth.errors.invalidCredentials'));
        } else if (err.message.includes('Invalid email format')) {
          setError(t('auth.errors.invalidEmailFormat'));
        } else if (err.message.includes('Password is required')) {
          setError(t('auth.errors.passwordRequired'));
        } else if (err.message.includes('Email and password are required')) {
          setError(t('auth.errors.emailRequired'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('auth.errors.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.signin')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email')}
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
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.signin')}
            </button>
          </div>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-500">
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 