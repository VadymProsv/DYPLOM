'use client';

import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import { 
  UserGroupIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('about.features.community.title', 'Волонтерська спільнота'),
      description: t('about.features.community.description', 'Об\'єднуємо людей, які бажають допомагати та робити добрі справи для нашої країни.'),
      icon: UserGroupIcon,
    },
    {
      title: t('about.features.charity.title', 'Благодійність'),
      description: t('about.features.charity.description', 'Створюємо можливості для збору коштів та матеріальної допомоги для тих, хто цього потребує.'),
      icon: HeartIcon,
    },
    {
      title: t('about.features.safety.title', 'Безпека'),
      description: t('about.features.safety.description', 'Забезпечуємо безпечну та прозору платформу для організації та проведення заходів.'),
      icon: ShieldCheckIcon,
    },
    {
      title: t('about.features.efficiency.title', 'Ефективність'),
      description: t('about.features.efficiency.description', 'Надаємо інструменти для ефективного управління заходами та координації учасників.'),
      icon: ChartBarIcon,
    },
  ];

  const values = [
    t('about.values.transparency', 'Прозорість та чесність у всіх процесах'),
    t('about.values.support', 'Взаємодопомога та підтримка'),
    t('about.values.efficiency', 'Ефективне використання ресурсів'),
    t('about.values.safety', 'Безпека та надійність'),
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('about.title', 'Про нас')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.description', 'EBlago - це платформа, яка об\'єднує людей для організації та проведення військових волонтерських і благодійних заходів. Наша мета - зробити процес організації допомоги простішим та ефективнішим.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-6 rounded-lg shadow-md">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('about.mission.title', 'Наша місія')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('about.mission.description', 'Ми віримо, що кожен може зробити свій внесок у розвиток суспільства. Наша платформа створена для того, щоб зробити цей процес максимально зручним та ефективним для всіх учасників.')}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('about.values.title', 'Наші цінності')}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            {values.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
} 