import { selector } from 'recoil';
import {
  notesAuthTokenOptionalState,
  dubberAuthTokenOptionalState
} from './atoms';
import { keycloakEnable } from './keycloak';

// This will redundent once we are using the dubber IDP
export const authTokenOptionalState = selector<string | false>({
  key: 'authTokenOptionalState',
  get: ({ get }) => {
    return keycloakEnable
      ? get(dubberAuthTokenOptionalState)
      : get(notesAuthTokenOptionalState);
  }
});

export const authLoggedInState = selector<boolean>({
  key: 'authLoggedInState',
  get: ({ get }) => !!get(authTokenOptionalState)
});