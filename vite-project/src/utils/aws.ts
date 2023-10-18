import qs from 'qs';
import { add, differenceInMilliseconds, parseISO } from 'date-fns';

const getSignedDurationRemaining = (url: string) => {
  const i = url.indexOf('?');

  if (i === -1) {
    return 0;
  }

  const query = qs.parse(url.substr(i + 1));
  const date = parseISO(query['X-Amz-Date'] as string);
  const expiresSeconds = parseInt(query['X-Amz-Expires'] as string, 10);
  const expiresAt = add(date, { seconds: expiresSeconds });

  return Math.max(0, differenceInMilliseconds(expiresAt, new Date()));
};

export const hasSignedExpired = (url: string) => {
  if (!url.match(/amazonaws\.com/i)) {
    return false;
  }

  return getSignedDurationRemaining(url) <= 0;
};