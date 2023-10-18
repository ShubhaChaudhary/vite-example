import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true;
    resources: {
      auth: typeof import('../../locales/en/auth.json');
      channels: typeof import('../../locales/en/channels.json');
      common: typeof import('../../locales/en/common.json');
      glossary: typeof import('../../locales/en/glossary.json');
      meetings: typeof import('../../locales/en/meetings.json');
      nav: typeof import('../../locales/en/nav.json');
      onboarding: typeof import('../../locales/en/onboarding.json');
      settings: typeof import('../../locales/en/settings.json');
      validation: typeof import('../../locales/en/validation.json');
      embedded: typeof import('../../locales/en/embedded.json');
    };
  }
}