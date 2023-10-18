mport Keycloak from 'keycloak-js';
import mitt from 'mitt';
import logger from '../../utils/logger';
import regionData from '../../common/api/regionData';
import { maybeGetAccessTokenNotes, getAccessTokenNotes } from './tokens';

export const keycloakEnable = process.env.ENABLE_DUBBER_IDP_AUTH === 'true';

export const keycloakEvents = mitt();

const setupKeycloak = () => {
  if (!keycloakEnable) return undefined;
  const keycloak = new Keycloak({
    url: `${regionData.DUBBER_IDP_HOSTNAME}/auth`,
    realm: 'dubber',
    clientId: 'dubber-spa'
  });

  const initPromise = keycloak
    .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
      silentCheckSsoFallback: false,
      flow: 'implicit'
    })
    .catch((err) => {
      logger.error(err, 'Failed to initialise Keycloak');
    });

  keycloak.onAuthSuccess = () => {
    logger.debug('Auth successful');
    keycloakEvents.emit('authsuccess', keycloak.token);
  };

  keycloak.onTokenExpired = () => {
    logger.warn('Token expired, attempting refresh');
    keycloakEvents.emit('tokenexpired');
    keycloak.updateToken(60).catch((err) => {
      logger.error(err, 'Failed to update token after session has expiry');
    });
  };

  keycloak.onAuthLogout = () => {
    logger.info('Logging out');
    keycloakEvents.emit('authlogout');
  };

  return {
    initPromise,
    keycloak
  };
};

export const useKeycloak = setupKeycloak();

export const maybeGetAccessTokenDubber = async (): Promise<string | false> => {
  // Ensure Keycloak has been initialised before resolving.
  await useKeycloak?.initPromise;

  return useKeycloak?.keycloak.token || false;
};

export const getAccessTokenDubber = async (): Promise<string> => {
  const token = await maybeGetAccessTokenDubber();

  if (!token) {
    throw new Error('Access token missing');
  }

  return token;
};

// dynamically pick the token based on the environment variable
export const maybeGetAccessToken = keycloakEnable
  ? maybeGetAccessTokenDubber
  : maybeGetAccessTokenNotes;

export const getAccessToken = keycloakEnable
  ? getAccessTokenDubber
  : getAccessTokenNotes;