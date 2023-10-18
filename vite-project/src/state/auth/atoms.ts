iimport { atom } from 'recoil';
import { handleError } from '../../utils/errors';
import { keycloakEvents, maybeGetAccessToken } from './keycloak';

/**
 * The access JWT, or `false` if the user is logged out.
 * The token validity is checked every minute and automatically
 * refreshes as necessary.
 *
 * notes auth until we are not removing it completely
 */

export const notesAuthTokenOptionalState = atom<string | false>({
  key: 'notesAuthTokenOptionalState',
  default: maybeGetAccessToken(),
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      const ONE_MINUTE_MS = 60 * 1000;
      let timeout: any | undefined;
      const checkToken = () => {
        maybeGetAccessToken()
          .then((token) => {
            setSelf(token);

            if (timeout) {
              clearTimeout(timeout);
            }

            // Don't schedule the next refresh check if the user is logged out.
            if (!token) {
              return;
            }

            timeout = setTimeout(checkToken, ONE_MINUTE_MS);
          })
          .catch(handleError);
      };

      // Restart the refresh check when a new token has been set
      // by the app (e.g. a new login).
      onSet((token) => {
        if (timeout) {
          clearTimeout(timeout);
        }

        // Don't schedule the next refresh check if the user was logged out.
        if (!token) {
          return;
        }

        timeout = setTimeout(checkToken, ONE_MINUTE_MS);
      });

      timeout = setTimeout(checkToken, ONE_MINUTE_MS);

      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  ]
});

// Dubber auth with the keycloak auth check
export const dubberAuthTokenOptionalState = atom<string | false>({
  key: 'dubberAuthTokenOptionalState',
  default: maybeGetAccessToken(),
  effects: [
    ({ setSelf }) => {
      const onAuthSuccess = (token?: string) => {
        setSelf(token || false);
      };

      const onAuthLogout = () => {
        setSelf(false);
      };

      keycloakEvents.on('authsuccess', onAuthSuccess);
      keycloakEvents.on('authlogout', onAuthLogout);

      return () => {
        keycloakEvents.off('authsuccess', onAuthSuccess);
        keycloakEvents.off('authlogout', onAuthLogout);
      };
    }
  ]
});