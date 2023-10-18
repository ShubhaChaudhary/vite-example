import { format, isToday, isTomorrow, isYesterday, Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface CalendarFormatStrings {
  today: string;
  tomorrow: string;
  yesterday: string;
  fallback: string;
}

interface CalendarFormatOptions {
  locale?: Locale;
  timezone?: string;
}

/**
 * Formats the date based on the provided format strings and whether
 * the date is coming up soon or just passed.
 */
export const formatCalendar = (
  date: Date | number,
  formats: CalendarFormatStrings,
  { locale, timezone }: CalendarFormatOptions = {}
) => {
  const formatters: [(date: Date | number) => boolean, string][] = [
    [isToday, formats.today],
    [isTomorrow, formats.tomorrow],
    [isYesterday, formats.yesterday]
  ];

  const [, formatString] = formatters.find(([check]) => check(date)) || [
    true,
    formats.fallback
  ];

  if (timezone)
    return formatInTimeZone(date, timezone, formatString, { locale });
  return format(date, formatString, { locale });
};

interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
}

/**
 * Formats an amount of currency in a locale-aware way.
 *
 * @param amount The currency amount, in dollars.
 * @param param1 The formatting options, with currency and locale. Defaults to USD currency and browser-default locale.
 */
export const formatCurrency = (
  amount: number,
  { currency = 'USD', locale }: CurrencyFormatOptions = {}
) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  });

  return formatter.format(amount);
};

interface NumberFormatOptions extends Intl.NumberFormatOptions {
  locale?: string;
}

/**
 * Formats any number that isn't a currency in a locale-aware way.
 * @param number The number to be formatted.
 * @returns
 */
export const formatNumber = (
  number: number,
  { locale, ...options }: NumberFormatOptions = {}
) => {
  const formatter = new Intl.NumberFormat(locale, options);

  return formatter.format(number);
};

interface DateFormatOptions {
  timezone?: string;
  locale?: Locale;
}

export const formatDate = (
  date: Date,
  formatStr: string,
  { timezone, locale }: DateFormatOptions = {}
) => {
  if (timezone)
    return formatInTimeZone(date, timezone, formatStr, { locale: locale });

  return format(date, formatStr, { locale: locale });
};