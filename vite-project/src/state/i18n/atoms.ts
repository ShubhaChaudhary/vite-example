import { atom } from 'recoil';
import i18n from '../../i18n';
import { loadEffect } from '../effects';
import { parse } from 'qs';
import { currentUserOptionalState } from '../../state/currentUser';
import { LocaleCode } from '../../common/types/users';
import { isBrowserSupportLanguage } from './helpers';
/**
 * The current locale being used for the UI.
 */
export const localeState = atom<LocaleCode>({
  key: 'localeState',
  effects: [
    loadEffect(async () => {
      const query = parse(location.search.substring(1));
      const queryLng = query.lng;

      return typeof queryLng === 'string'
        ? (queryLng as LocaleCode)
        : ('en' as LocaleCode);
    }),

    ({ getPromise, setSelf, onSet }) => {
      getPromise(currentUserOptionalState).then((currentUser) => {
        if (!currentUser) {
          return;
        }
        const defaultLanguage = isBrowserSupportLanguage() ?? 'en';
        const lng = currentUser.language || defaultLanguage;
        if (lng === '') {
          return;
        }

        setSelf(lng as LocaleCode);
        i18n.changeLanguage(lng);
      });

      onSet((lng) => i18n.changeLanguage(lng));
    }
  ]
});