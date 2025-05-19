import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function UnauthorizedPage() {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('error.unauthorized')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('error.unauthorizedMessage')}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('common.backToHome')}
        </Link>
      </div>
    </Layout>
  );
} 