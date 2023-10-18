import { selector } from 'recoil';
import { localeState } from './atoms';
import { enUS, fr } from 'date-fns/locale';
import { isBrowserSupportLanguage } from './helpers';
import { currentUserOptionalState } from '../../state/currentUser';

const dateFnsLocales = {
  en: enUS,
  fr
};

/**
 * The current date-fns locale being used for date formatting in the UI.
 */
export const dateLocaleState = selector({
  key: 'dateLocaleState',
  get: ({ get }) => {
    const locale = get(localeState);

    return dateFnsLocales[locale] || dateFnsLocales.en;
  }
});

// Language Bannner

export const languageNotSupportedState = selector({
  key: 'languageNotSupportedState',
  get: ({ get }) => {
    const user = get(currentUserOptionalState);
    if (!user) return !isBrowserSupportLanguage();
    return !user.language && !isBrowserSupportLanguage();
  }
});