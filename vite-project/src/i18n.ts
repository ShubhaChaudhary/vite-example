import i18n from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import enLocaleAuth from '../locales/en/auth.json';
import enLocaleChannels from '../locales/en/channels.json';
import enLocaleCommon from '../locales/en/common.json';
import enLocaleGlossary from '../locales/en/glossary.json';
import enLocaleMeetings from '../locales/en/meetings.json';
import enLocaleNav from '../locales/en/nav.json';
import enLocaleOnboarding from '../locales/en/onboarding.json';
import enLocaleSettings from '../locales/en/settings.json';
import enLocaleValidation from '../locales/en/validation.json';
import enLocaleEmbedded from '../locales/en/embedded.json';

import { handleError } from './utils/errors';

const enLocale: Record<string, Record<string, string>> = {
  auth: enLocaleAuth,
  channels: enLocaleChannels,
  common: enLocaleCommon,
  glossary: enLocaleGlossary,
  meetings: enLocaleMeetings,
  nav: enLocaleNav,
  onboarding: enLocaleOnboarding,
  settings: enLocaleSettings,
  validation: enLocaleValidation,
  embedded: enLocaleEmbedded
};

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language, namespace, callback) => {
      // US English is always included in-memory to ensure it's available for fallback.
      if (language === 'en') {
        return callback(null, enLocale[namespace]);
      }

      import(`../locales/${language}/${namespace}.json`)
        .then((resources) => {
          callback(null, resources);
        })
        .catch((error) => {
          callback(error, null);
        });
    })
  )
  .init({
    ns: [
      'auth',
      'common',
      'channels',
      'glossary',
      'meetings',
      'nav',
      'onboarding',
      'settings',
      'validation',
      'embedded'
    ],
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  })
  .catch(handleError);

export default i18n;