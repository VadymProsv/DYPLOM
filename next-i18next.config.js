/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'uk',
    locales: ['uk', 'en'],
  },
  defaultNS: 'common',
  localePath: './src/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}; 