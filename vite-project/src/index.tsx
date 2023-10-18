import 'element-closest-polyfill';
import 'raf/polyfill';
import 'whatwg-fetch';
import './i18n';
import './errorMonitoring';
import './styles.css';

import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from 'styled-components';
import { RecoilRoot } from 'recoil';

import theme from './utils/theme';
import App from './screens/App/App';
import AppLoading from './screens/AppLoading';
import GlobalStyles from './screens/GlobalStyles';
import history from './history';
import { notify } from './utils/errors';
import AppErrorBoundary from './components/ErrorBoundary/AppErrorBoundary';
import AppHead from './screens/App/AppHead';
import logger from './utils/logger';
import ErrorFallback from './components/ErrorFallback/ErrorFallback';

if (
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  process.env.OTEL_EXPORTER_CONSOLE
) {
  import('./instrumentation').then(({ collectTraces }) => collectTraces());
}

if (process.env.PUSH_GATEWAY_METRICS_ENDPOINT) {
  import('./instrumentation').then(({ collectMetrics }) => collectMetrics());
}

if (process.env.LOGROCKET_PROJECT) {
  Promise.all([import('logrocket'), import('logrocket-react')])
    .then(([{ default: LogRocket }, { default: setupLogRocketReact }]) => {
      setupLogRocketReact(LogRocket);
      LogRocket.init(process.env.LOGROCKET_PROJECT!, {
        network: {
          requestSanitizer: (request) => {
            delete request.body;
            delete request.headers['Cookie'];

            return request;
          },

          responseSanitizer: (response) => {
            delete response.body;
            delete response.headers['Cookie'];

            return response;
          }
        }
      });
    })
    .catch(logger.error);
}

const node = document.getElementById('root');
const root = createRoot(node!);

root.render(
  <AppErrorBoundary FallbackComponent={ErrorFallback}>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <HelmetProvider>
          <GlobalStyles />

          <Suspense fallback={<AppLoading />}>
            <AppHead />
            <App />
          </Suspense>
        </HelmetProvider>
      </ThemeProvider>
    </RecoilRoot>
  </AppErrorBoundary>
);

try {
  navigator.serviceWorker?.addEventListener('message', (e) => {
    if (
      e.data.command == 'notification.clicked' &&
      e.data &&
      e.data.payload &&
      e.data.payload.data
    ) {
      const payload = e.data.payload;

      if (!payload.action) {
        history.push(payload.data.path);
      } else {
        const button = payload.buttons.find(
          (button: any) => button.action === payload.action
        );
        const path = button.url.substring(e.origin.length);

        if (path) {
          switch (button.action) {
            case 'notifications-action': {
              const newWin = window.open(button.url, '_blank');
              if (!(newWin && newWin.top)) {
                // popup has been blocked
                history.push(path);
              }
              break;
            }
            default:
              history.push(path);
              break;
          }
        } else {
          window.open(button.url, '_blank');
        }
      }
    }
  });
} catch (ex: any) {
  notify(ex);
}