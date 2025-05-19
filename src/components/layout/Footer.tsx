import { useTranslation } from 'next-i18next';
import Link from 'next/link';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{t('common.appName')}</h3>
            <p className="text-gray-400">
              {t('footer.description', 'Платформа для організації військових волонтерських і благочинних заходів')}
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks', 'Швидкі посилання')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  {t('footer.home', 'Головна')}
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white">
                  {t('events.title')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  {t('footer.about', 'Про нас')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contacts', 'Контакти')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>{t('footer.email', 'Email')}: support@eblago.ua</li>
              <li>{t('footer.phone', 'Телефон')}: +380 (XX) XXX-XX-XX</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {t('common.appName')}. {t('footer.copyright', 'Всі права захищено.')}</p>
        </div>
      </div>
    </footer>
  );
} 