import { isValid, Locale } from 'date-fns';
import { Namespace, TFunction } from 'react-i18next';
import { formatCalendar, formatDate } from '../common';

interface I18NCalendarFormatOptions {
  t?: TFunction<
    Namespace<
      | 'meetings'
      | 'auth'
      | 'channels'
      | 'common'
      | 'glossary'
      | 'nav'
      | 'onboarding'
      | 'settings'
      | 'validation'
    >,
    undefined
  >;
  locale?: Locale;
  timezone?: string;
}

/**
 * This formats the date with localised forms of today, tomorrow and yesterday,
 * or falls back to an absolute localised date.
 *
 * @see formatI18NCalendar
 * @param date The date to format.
 * @param param1 The formatting options, including the i18next translation function to use for displaying
 * today/tomorrow/yesterday, the user's locale, and the user's timezone. Defaults to local time if no timezone provided.
 */
export const formatI18NCalendar = (
  date: Date | number,
  { t, locale, timezone }: I18NCalendarFormatOptions = {}
) =>
  formatCalendar(
    date,
    {
      // date-fns ignores formatting in single quotes, but translations
      // can contain them. So we replace those with double single quotes which are ignored by date-fns.
      today: `'${t!('today').replace(/'/g, `''`)}'`,
      tomorrow: `'${t!('tomorrow').replace(/'/g, `''`)}'`,
      yesterday: `'${t!('yesterday').replace(/'/g, `''`)}'`,
      fallback: 'PPPP'
    },
    { locale, timezone }
  );

export const formatMeetingDate = (
  startsAt: Date,
  locale: Locale,
  timezone: string
) => {
  if (!isValid(startsAt)) return;

  const currentYear = new Date().getFullYear();

  return formatDate(
    startsAt,
    `eeee d LLL,${startsAt.getFullYear() !== currentYear ? ' Y, ' : ''} p`,
    { timezone: timezone, locale: locale }
  );
};