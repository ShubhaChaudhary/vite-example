import { differenceInMilliseconds, parseISO } from 'date-fns';
import qs from 'qs';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { formatTime } from './time';

export const useQuery = <T = qs.ParsedQs>(): T =>
  qs.parse(useLocation().search, {
    ignoreQueryPrefix: true
  }) as any;

export const useCallbackRef = (): [
  HTMLElement | undefined,
  (node?: HTMLElement | null) => void
] => {
  const [ref, setRef] = useState<HTMLElement | undefined>();
  const setRefCallback = useCallback((node?: HTMLElement | null) => {
    if (node) setRef(node);
  }, []);

  return [ref, setRefCallback];
};

const ONE_SECOND_MS = 1000;
export const useTimer = (from: string, tick = ONE_SECOND_MS) => {
  const fromDate = useMemo(() => parseISO(from), [from]);
  const initialTime = useMemo(
    () => formatTime(differenceInMilliseconds(new Date(), fromDate)),
    [fromDate]
  );
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime(differenceInMilliseconds(new Date(), fromDate)));
    }, tick);

    return () => {
      clearInterval(interval);
    };
  }, [fromDate]);

  return time;
};