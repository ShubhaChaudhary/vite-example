import { Team } from './models/team';

const containerElem = document.getElementById('root');
const tokenElem: HTMLMetaElement | null =
  document.head.querySelector('[name=csrf-token]');

export const bootstrappedToken = tokenElem?.content as string;

export const bootstrappedTeam: Team | undefined = containerElem?.hasAttribute(
  'data-team'
)
  ? JSON.parse(containerElem?.getAttribute('data-team') as string)
  : undefined;

export const bootstrappedApiAuthentication = containerElem?.hasAttribute(
  'data-api-authentication'
)
  ? containerElem.getAttribute('data-api-authentication') === 'true'
  : false;