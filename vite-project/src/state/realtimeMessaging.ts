import Centrifuge from 'centrifuge';
import mitt from 'mitt';
import logger from '../utils/logger';
import regionData from '../common/api/regionData';

export const realtimeEvents = mitt();

const clients: Record<string, Centrifuge | undefined> = {};

const setupMessaging =
  (key: string, appChannel = false) =>
  (token: string, channel: string) => {
    if (!regionData.CENTRIFUGE_URL) {
      logger.warn('No centrifuge URL configured, ignoring setup...');

      return () => {};
    }

    if (!clients[key]) {
      clients[key] = new Centrifuge(regionData.CENTRIFUGE_URL, {
        minRetry: 1000,
        maxRetry: 60000,
        debug: process.env.NODE_ENV !== 'production',
        refreshAttempts: 0
      });
    }

    const client = clients[key]!;

    if (client.isConnected()) {
      client.disconnect();
      client.removeAllListeners();
    }

    client.setToken(token);
    client.connect();
    client.on('connect', () => {
      realtimeEvents.emit('connect');
    });

    client.on('disconnect', (ctx) => {
      realtimeEvents.emit('disconnect');

      // We only care if Centrifugo has given up and it wasn't disconnected by the app.
      if (ctx.reconnect || ctx.reason === 'client') {
        return;
      }

      logger.warn(ctx, 'Centrifuge disconnected');
    });

    const appSubscription = !appChannel
      ? undefined
      : client.subscribe('app', {
          publish: (ctx) => {
            realtimeEvents.emit('publish', ctx.data);
          },

          error: (ctx) => {
            realtimeEvents.emit('error', ctx.error);
            logger.error(ctx, `Centrifuge subscription error`);
          }
        });

    const channelSubscription = client.subscribe(channel, {
      publish: (ctx) => {
        realtimeEvents.emit('publish', ctx.data);
      },

      error: (ctx) => {
        realtimeEvents.emit('error', ctx.error);
        logger.error(ctx, `Centrifuge subscription error`);
      }
    });

    return () => {
      appSubscription?.unsubscribe();
      channelSubscription.unsubscribe();
      client.disconnect();
      client.removeAllListeners();

      delete clients[key];
    };
  };

const isMessagingSetup = (key: string) => () => !!clients[key];

export const setupUserMessaging = setupMessaging('user', true);
export const setupMeetingMessaging = setupMessaging('meeting');
export const isUserMessagingSetup = isMessagingSetup('user');
export const isMeetingMessagingSetup = isMessagingSetup('meeting');

export const refreshConnection = () => {
  for (const key of Object.keys(clients)) {
    const client = clients[key];

    if (!client || client.isConnected()) {
      continue;
    }

    client.connect();
  }
};
