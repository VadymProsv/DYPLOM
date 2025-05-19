'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import I18nProvider from './I18nProvider';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <I18nProvider>
        {children}
      </I18nProvider>
    </Provider>
  );
} 