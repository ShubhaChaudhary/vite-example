import { Meeting } from '../models/meeting';
import {
  formatDuration,
  intervalToDuration,
  isAfter,
  isValid,
  parseISO,
  Locale
} from 'date-fns';

export const timeDuration = (meeting: Partial<Meeting>, dateLocale: Locale) => {
  const startString = meeting?.started_at || meeting.scheduled_start_at;
  const endString = meeting?.ended_at || meeting.scheduled_end_at;
  const startsAt = startString ? parseISO(startString) : undefined;
  const endsAt = endString ? parseISO(endString) : undefined;

  const duration =
    startsAt &&
    isValid(startsAt) &&
    endsAt &&
    isValid(endsAt) &&
    isAfter(endsAt, startsAt)
      ? formatDuration(intervalToDuration({ start: startsAt, end: endsAt }), {
          format: ['days', 'hours', 'minutes'],
          locale: dateLocale
        })
      : undefined;

  return {
    startsAt,
    endsAt,
    duration
  };
};