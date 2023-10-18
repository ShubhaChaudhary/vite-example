import { isBefore, parseISO } from 'date-fns';
import { Meeting } from '..';

/**
 * Checks whether a specific date is after the date a meeting was scheduled to end.
 *
 * @param date The date to compare to.
 * @param meeting The slim meeting to check.
 * @returns Whether the date is after the meeting
 */
export const isAfterScheduledEnd = (date: Date, meeting: Meeting) => {
  if (meeting.status !== 'scheduled' || !meeting.scheduled_end_at) {
    return false;
  }

  return isBefore(parseISO(meeting.scheduled_end_at), date);
};
