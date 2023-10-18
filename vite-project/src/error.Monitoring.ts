import { Honeybadger } from '@honeybadger-io/react';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import logger from './utils/logger';

const HONEYBADGER_API_KEY = process.env.HONEYBADGER_API_KEY;
const BUGSNAG_API_KEY = process.env.BUGSNAG_API_KEY;
const NOTIV_ENV = process.env.NOTIV_ENV || 'development';
const NOTIV_REGION = process.env.NOTIV_REGION;
const GITHUB_VERSION = process.env.GITHUB_VERSION;

const shouldLogOnly = (message: string, stack: string) =>
  message.includes('Failed to fetch') ||
  message.includes('HTTP fetch not OK') ||
  message.includes('NetworkError') ||
  message.includes('Database connection is closing') ||
  stack.includes('googletagmanager.com') ||
  stack.includes('googleads') ||
  stack.includes('intercomcdn.com');

if (HONEYBADGER_API_KEY) {
  Honeybadger.configure({
    apiKey: HONEYBADGER_API_KEY,
    environment: NOTIV_ENV,
    revision: GITHUB_VERSION,
    developmentEnvironments: ['development', 'test']
  });

  Honeybadger.beforeNotify((notice) => {
    logger.error(notice);

    if (shouldLogOnly(notice.message, notice.stack)) {
      return false;
    }
  });
}

if (BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginReact()],
    releaseStage: `${NOTIV_ENV}${NOTIV_REGION ? `-${NOTIV_REGION}` : ''}`,
    appVersion: GITHUB_VERSION || undefined,
    onError: (event) => {
      if (!event.originalError) {
        return;
      }

      logger.error(event.originalError);

      if (
        typeof event.originalError.message === 'string' &&
        shouldLogOnly(
          event.originalError.message,
          event.originalError.stack || ''
        )
      ) {
        return false;
      }
    }
  });
}
