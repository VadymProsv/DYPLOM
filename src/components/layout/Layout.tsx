import { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import Header from './Header';
import Footer from './Footer';
import Notification from '../ui/Notification';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Notification />
    </div>
  );
} 