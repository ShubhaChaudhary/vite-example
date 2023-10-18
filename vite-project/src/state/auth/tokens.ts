// This file will not be needed when we are going to use the dubber IDP completely

import decode from 'jwt-decode';
import { handleError } from '../../utils/errors';
import { bootstrappedApiAuthentication } from '../../bootstrap';
import api from '../../api';
import { APIError } from '../../common';
import localforage from 'localforage';

/**
 * Checks whether an access JWT will not expire before a certain date.
 *
 * @param token The JWT.
 * @param until The date to check whether the JWT will be valid up to.
 * @returns Whether the JWT will expire before that date, or `false` if it has already expired.
 */
export const isAccessTokenValidUntil = (token: string, until: Date) => {
  try {
    const payload: { exp: number } = decode(token);
    const exp = new Date(payload.exp * 1000);

    return exp.getTime() > until.getTime();
  } catch (err: any) {
    handleError(err, {}, 'warning');

    return false;
  }
};

/**
 * Refresh the access token.
 *
 * @returns A promise that resolves to a new access token, or false if the user is logged out.
 */
const refreshAccessToken = async (): Promise<string | false> => {
  if (!bootstrappedApiAuthentication) {
    const res = await fetch('/settings/token.json');
    const auth = res.headers.get('Authorization');

    if (res.status === 401) {
      return false;
    }

    if (!res.ok) {
      throw new APIError(`HTTP fetch not OK: ${res.url} (${res.status})`, res);
    }

    return auth ? auth.split(' ')[1] : false;
  }

  try {
    const { token } = await api.auth.refreshAccessToken();

    return token;
  } catch (err: any) {
    if (err instanceof APIError && err.res.status === 401) {
      return false;
    }

    return Promise.reject(err);
  }
};

const ACCESS_TOKEN_KEY = 'notes_access_token';
const getStoredAccessToken = async (): Promise<string | false | undefined> => {
  try {
    const token = await localforage.getItem(ACCESS_TOKEN_KEY);

    return typeof token === 'string' ? token : undefined;
  } catch (err: any) {
    return;
  }
};

export const storeAccessToken = async (token: string | false) => {
  accessTokenPromise = Promise.resolve(token);

  if (token) {
    return localforage.setItem(ACCESS_TOKEN_KEY, token).catch(handleError);
  }

  return localforage.removeItem(ACCESS_TOKEN_KEY).catch(handleError);
};

/**
 * The current resolved or resolving access token.
 * If set to `false`, then the user is logged out.
 * If set to `undefined`, then it hasn't been loaded yet.
 */
let accessTokenPromise: Promise<string | false | undefined> =
  getStoredAccessToken();

/**
 * The amount of time to wait before an access token is set to expire before refreshing it.
 */
const EXPIRY_THRESHOLD_MS = 3 * 60 * 1000;

/**
 * Gets the current access token if valid, or refreshes a new one if needed.
 *
 * @returns A valid short-lived access token, or `false` if the user is logged out..env
 */
export const maybeGetAccessTokenNotes = async (): Promise<string | false> => {
  try {
    const accessToken = await accessTokenPromise;

    if (
      typeof accessToken === 'undefined' ||
      (typeof accessToken === 'string' &&
        !isAccessTokenValidUntil(
          accessToken,
          new Date(new Date().getTime() + EXPIRY_THRESHOLD_MS)
        ))
    ) {
      storeAccessToken(await refreshAccessToken());

      await accessTokenPromise;
    }
  } catch (err: any) {
    handleError(err);
    storeAccessToken(await refreshAccessToken());
  }

  return accessTokenPromise.then((value) =>
    typeof value === 'undefined' ? false : value
  );
};

export const getAccessTokenNotes = async (): Promise<string> => {
  const token = await maybeGetAccessTokenNotes();

  if (!token) {
    throw new Error('Access token missing');
  }

  return token;
};
