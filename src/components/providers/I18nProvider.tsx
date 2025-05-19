'use client';

import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/app/i18n/client';

export default function I18nProvider({ children }: { children: ReactNode }) {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
} 