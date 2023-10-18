import { AtomEffect, RecoilValue } from 'recoil';
import { realtimeEvents } from './realtimeMessaging';
import { RealtimeMessage } from '../models/realtimeMessaging';
import { handleError } from '../utils/errors';
import logger from '../utils/logger';
import localforage from 'localforage';

export const syncWithStorage =
  <T>(key: string): AtomEffect<T> =>
  ({ onSet, trigger, setSelf }) => {
    if (typeof window.localStorage === 'undefined') {
      return;
    }

    if (trigger === 'get' && typeof localStorage[key] !== 'undefined') {
      try {
        setSelf(JSON.parse(localStorage[key]));
      } catch (err: any) {
        // Do nothing.
      }
    }

    onSet((value) => {
      localStorage[key] = JSON.stringify(value);
    });
  };

export const syncFromRealtime =
  <T>(
    cb: (
      msg: RealtimeMessage,
      setSelf: (param: T | Promise<T> | ((param: T) => T)) => void,
      getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S>
    ) => void
  ): AtomEffect<T> =>
  ({ setSelf, getPromise }) => {
    const onPublish = (msg?: RealtimeMessage) => {
      if (!msg) {
        return;
      }

      cb(msg, setSelf as any, getPromise as any);
    };

    realtimeEvents.on('publish', onPublish);

    return () => {
      realtimeEvents.off('publish', onPublish);
    };
  };

/**
 * An Atom Effect for loading data from a remote service.
 * The data will be loaded on every initial use of the atom.
 * Resetting the atom's value to default will not load any data.
 *
 * @param loader A function that creates a promise to load the data.
 */
export const loadEffect =
  <T>(
    loader: (
      helpers: Pick<Parameters<AtomEffect<T>>[0], 'getPromise' | 'getLoadable'>
    ) => Promise<T>
  ): AtomEffect<T> =>
  ({ setSelf, getPromise, getLoadable, trigger }) => {
    if (trigger == 'set') {
      return;
    }

    // Requests the latest data in the background. Errors are intentionally unhandled
    // so they bubble up to the nearest ErrorBoundary.
    setSelf(loader({ getPromise, getLoadable }));
  };

/** Options for the swrEffect Atom Effect. */
interface SwrEffectOptions {
  /** The key to use for SWR caching. */
  cacheKey: string;
}

/**
 * An Atom Effect for loading data from a remote service with SWR caching.
 *
 * If a cached value is available, that will be used for the current atom initialisation.
 * The latest data will be fetched in the background and cached for the next page load.
 *
 * If there's no cached value, the latest data will be loaded and cached.
 *
 * @param loader A function that creates a promise to load the data.
 * @param options The options to use while loading.
 */
export const swrEffect =
  <T>(
    loader: (
      helpers: Pick<Parameters<AtomEffect<T>>[0], 'getPromise' | 'getLoadable'>
    ) => Promise<T>,
    { cacheKey }: SwrEffectOptions
  ): AtomEffect<T> =>
  ({ setSelf, getPromise, getLoadable, trigger }) => {
    if (trigger == 'set') {
      return;
    }

    const load = async () => {
      const data = await loader({ getPromise, getLoadable });

      // Cache for next page load
      localforage
        .setItem(cacheKey, data)
        .then(() => {
          logger.info({ key: cacheKey }, 'Wrote SWR atom value to storage');
        })
        .catch(handleError);

      return data;
    };

    const init = async () => {
      try {
        const cachedData = await localforage.getItem<T | null>(cacheKey);

        // No cached data, load the latest data
        if (!cachedData) {
          return load();
        }

        logger.info({ key: cacheKey }, 'Loaded SWR atom value from storage');

        // Cached data, load the latest data in the background and then return the cached data.
        load().catch(handleError);

        return cachedData;
      } catch (err: any) {
        handleError(err);

        return load();
      }
    };

    setSelf(init());
  };