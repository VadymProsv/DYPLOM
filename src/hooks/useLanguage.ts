'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(newLang);
    Cookies.set('NEXT_LOCALE', newLang);
    document.documentElement.lang = newLang;
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    toggleLanguage,
  };
}; 