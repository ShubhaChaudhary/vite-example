import { mapValues, pickBy } from 'lodash';
import auth from './auth';
import billing from './billing';
import channels from './channels';
import events from './events';
import meetings from './meetings';
import moments from './moments';
import settings from './settings';
import tags from './tags';
import templates from './templates';
import uploads from './uploads';
import user from './user';

export interface APIConfig {
  baseUrl: string;
}

// SEE: https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
export class APIError extends Error {
  res: Response;

  constructor(msg: string, res: Response) {
    super(msg);
    Object.setPrototypeOf(this, APIError.prototype);

    this.res = res;
  }
}

// A utility for asserting that a fetch response is OK,
// since fetch only rejects on network errors.
// We raise an APIError which can be caught and handle by error boundaries.
export const requireOk = (res: Response) => {
  if (!res.ok) {
    throw new APIError(`HTTP fetch not OK: ${res.url} (${res.status})`, res);
  }

  return res;
};

// Builds a request URL with sanitized query parameters.
export const buildUrl = (
  url: string,
  query?: Record<string, string | number | boolean | undefined>
) => {
  const cleanedQuery = mapValues(
    pickBy(query, (val) => typeof val !== 'undefined'),
    (val) => val && val.toString()
  ) as Record<string, string>;

  return `${url}${
    query ? `?${new URLSearchParams(cleanedQuery).toString()}` : ''
  }`;
};

// Builds a fetch request with common headers and other request init options.
export const buildRequest = (
  token: string | false,
  request: RequestInit = {}
): RequestInit => ({
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',

    ...request.headers
  },

  ...request
});

export default (config: APIConfig) => ({
  auth: auth(config),
  billing: billing(config),
  channels: channels(config),
  meetings: meetings(config),
  moments: moments(config),
  settings: settings(config),
  events: events(config),
  tags: tags(config),
  templates: templates(config),
  uploads: uploads(config),
  user: user(config)
});