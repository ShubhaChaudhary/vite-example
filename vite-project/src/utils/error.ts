import { Honeybadger } from '@honeybadger-io/react';

type Metadata = Record<string, Record<string, string | boolean | number>>;

type Severity = 'error' | 'warning' | 'info';

export const handleError = (
  err: Error,
  metadata: Metadata = {},
  severity: Severity = 'error'
) => {
  notify(err, metadata, severity);
};

export const notify = (
  err: Error,
  metadata: Metadata = {},
  severity: Severity = 'error'
) => {
  const HONEYBADGER_API_KEY = process.env.HONEYBADGER_API_KEY;

  if (HONEYBADGER_API_KEY) {
    Honeybadger.notify(err, {
      context: {
        severity,
        metadata
      }
    });
  }
};