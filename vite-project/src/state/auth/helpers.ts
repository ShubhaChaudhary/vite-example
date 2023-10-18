import { useCallback } from 'react';
import { getAccessToken, storeAccessToken } from '.';
import api from '../../api';
import {
  bootstrappedApiAuthentication,
  bootstrappedToken
} from '../../bootstrap';
import { Session } from '../../utils/api';
import { useKeycloak, keycloakEnable } from './keycloak';

// Old notes auth will be rebundent in future
export const useAuthHelpers = () => {
  const notesLogout = useCallback(async () => {
    if (bootstrappedApiAuthentication) {
      const token = await getAccessToken();
      await api.auth.deleteAuth(token);
      await storeAccessToken(false);
    } else {
      await Session.destroy(bootstrappedToken);
    }
    window.location.href = '/login';
  }, []);

  const dubberLogout = useCallback(async () => {
    await useKeycloak?.keycloak.logout();
    window.location.href = '/login';
  }, []);

  // Conditionaly pick the notes vs dubber IDP auth
  const logout = keycloakEnable ? dubberLogout : notesLogout;

  return {
    logout
  };
};
