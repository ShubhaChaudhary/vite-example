import {
    ConsoleSpanExporter,
    BatchSpanProcessor,
    ReadableSpan
  } from '@opentelemetry/sdk-trace-base';
  import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
  import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
  import { ZoneContextManager } from '@opentelemetry/context-zone';
  import { registerInstrumentations } from '@opentelemetry/instrumentation';
  import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
  import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
  import { Resource } from '@opentelemetry/resources';
  import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
  import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
  import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
  import logger from './utils/logger';
  import { maybeGetAccessToken } from './state/auth';
  import { handleError } from './utils/errors';
  import { LongTaskInstrumentation } from '@opentelemetry/instrumentation-long-task';
  import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
  import { getLCP, getCLS, getFID } from 'web-vitals';
  import prom, { Labels } from 'promjs';
  import { Histogram } from 'promjs/histogram';
  import { debounce } from 'lodash';
  
  // Overrides the default OTLP trace exporter to send the current auth token.
  // This is required because the auth header can usually only be set once at initialisation.
  class AuthAwareOTLPTraceExporter extends OTLPTraceExporter {
    send(
      objects: ReadableSpan[],
      onSuccess: () => void,
      onError: (error: Error) => void
    ) {
      maybeGetAccessToken()
        .then((token) => {
          if (!token) {
            logger.debug('User logged out, throwing away trace...');
            return;
          }
  
          // We cast as any to set protected values.
          const this_ = this as any;
  
          this_._useXHR = true;
          this_._headers = {
            ...this_.headers,
  
            Authorization: `Bearer ${token}`
          };
  
          super.send(objects, onSuccess, onError);
        })
        .catch(handleError);
    }
  }
  
  export const collectTraces = () => {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME || 'notes-web-app',
      [SemanticResourceAttributes.SERVICE_VERSION]:
        process.env.OTEL_SERVICE_VERSION || ''
    });
  
    const provider = new WebTracerProvider({
      resource
    });
  
    if (process.env.OTEL_EXPORTER_CONSOLE) {
      provider.addSpanProcessor(
        new BatchSpanProcessor(new ConsoleSpanExporter())
      );
    }
  
    if (process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
      const otlpTraceExporter = new AuthAwareOTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        concurrencyLimit: 10
      });
  
      provider.addSpanProcessor(
        new BatchSpanProcessor(otlpTraceExporter, {
          maxQueueSize: 100,
          maxExportBatchSize: 10,
          scheduledDelayMillis: 500,
          exportTimeoutMillis: 30000
        })
      );
    }
  
    provider.register({
      contextManager: new ZoneContextManager()
    });
  
    registerInstrumentations({
      instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation(),
        new XMLHttpRequestInstrumentation(),
        new UserInteractionInstrumentation(),
        new LongTaskInstrumentation({
          observerCallback: (span) => {
            span.setAttribute('location.pathname', window.location.pathname);
          }
        })
      ]
    });
  
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
    logger.info('Started collecting traces');
  };
  
  const registry = prom();
  const webVitalCLSHistogram = registry.create(
    'histogram',
    'web_vital_cls',
    'The cumulative-layout-shift of the web app.'
  );
  const webVitalFIDHistogram = registry.create(
    'histogram',
    'web_vital_fid_seconds',
    'The first-input-delay of the web app, in seconds.'
  );
  const webVitalLCPHistogram = registry.create(
    'histogram',
    'web_vital_lcp_seconds',
    'The time to largest contentful pain for the web app, in seconds.'
  );
  
  const pushMetrics = async () => {
    const token = await maybeGetAccessToken();
  
    if (!token || !process.env.PUSH_GATEWAY_METRICS_ENDPOINT) {
      return;
    }
  
    try {
      // NOTE: This is done separately to the common API lib, as this could be a non-Notes API endpoint
      // (e.g. hitting the push gateway directly).
      await fetch(process.env.PUSH_GATEWAY_METRICS_ENDPOINT, {
        keepalive: true,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Authorization: `Bearer ${token}`
        },
        body: registry.metrics()
      });
  
      logger.info({ metrics: registry.metrics() }, 'Pushed metrics');
    } catch (err: any) {
      handleError(err);
    }
  };
  
  const PUSH_METRICS_DEBOUNCE_MS = 3000;
  const debouncedPushMetrics = debounce(pushMetrics, PUSH_METRICS_DEBOUNCE_MS);
  const observeMetric = (metric: Histogram, value: number, labels?: Labels) => {
    metric.observe(value, labels);
    debouncedPushMetrics();
  };
  
  export const collectMetrics = () => {
    getCLS((metric) => observeMetric(webVitalCLSHistogram, metric.value));
    getFID((metric) => observeMetric(webVitalFIDHistogram, metric.value / 1000));
    getLCP((metric) => observeMetric(webVitalLCPHistogram, metric.value / 1000));
  };