'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout, setUserFromToken } from '@/store/slices/authSlice';

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentLanguage, toggleLanguage } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        dispatch(setUserFromToken(token));
      } catch (error) {
        console.error('Error setting user from token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    router.push('/');
  };

  const handleMenuItemClick = (path: string) => {
    if (pathname === path) {
      setIsMenuOpen(false);
    } else {
      router.push(path);
    }
  };

  const userMenuItems = [
    {
      label: t('nav.profile'),
      icon: UserCircleIcon,
      onClick: () => router.push('/profile'),
    },
    ...(user?.role === 'admin' ? [{
      label: t('nav.admin'),
      icon: ChartBarIcon,
      onClick: () => router.push('/admin'),
    }] : []),
    {
      label: t('auth.signout'),
      icon: ArrowRightOnRectangleIcon,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            {t('common.appName')}
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="hover:text-blue-200">
              {t('nav.events')}
            </Link>
            {user && (
              <>
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 hover:text-blue-200">
                    <span>{user.name}</span>
                    <UserCircleIcon className="h-6 w-6" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    {userMenuItems.map((item) => (
                      <Menu.Item key={item.label}>
                        {({ active }) => (
                          <button
                            onClick={item.onClick}
                            className={`
                              flex items-center w-full px-4 py-2 text-sm
                              ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                            `}
                          >
                            <item.icon className="h-5 w-5 mr-2" />
                            {item.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>
              </>
            )}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded border border-white hover:bg-blue-500"
            >
              {currentLanguage === 'uk' ? 'EN' : 'UK'}
            </button>
            {!user && (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 rounded border border-white hover:bg-blue-500"
                >
                  {t('auth.signin')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded bg-white text-blue-600 hover:bg-blue-50"
                >
                  {t('auth.signup')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link href="/events" className="block hover:text-blue-200">
              {t('nav.events')}
            </Link>
            {user && (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block text-base font-medium hover:text-blue-200"
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                <Link href="/profile" className="block hover:text-blue-200">
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left hover:text-blue-200"
                >
                  {t('auth.signout')}
                </button>
              </>
            )}
            <button
              onClick={toggleLanguage}
              className="block w-full text-left hover:text-blue-200"
            >
              {currentLanguage === 'uk' ? 'English' : 'Українська'}
            </button>
            {!user && (
              <div className="space-y-2">
                <Link
                  href="/signin"
                  className="block px-4 py-2 rounded border border-white hover:bg-blue-500 text-center"
                >
                  {t('auth.signin')}
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 rounded bg-white text-blue-600 hover:bg-blue-50 text-center"
                >
                  {t('auth.signup')}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
} 