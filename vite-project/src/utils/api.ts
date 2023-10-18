import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';

const baseUrl = '';

class Session {
  static create(csrfToken: string, email: string) {
    const url = `${baseUrl}/login.json`;

    const options: AxiosRequestConfig = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      },
      data: { email },
      url
    };
    return axios(options);
  }

  static validate(
    csrfToken: string,
    email: string
  ): AxiosPromise<{ valid: boolean; provider?: string | null }> {
    const url = `${baseUrl}/sessions/validate`;

    const options: AxiosRequestConfig = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      },
      data: { email },
      url
    };
    return axios(options);
  }

  static destroy(authToken: string) {
    const url = `${baseUrl}/sign_out`;

    const options: AxiosRequestConfig = {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': authToken,
        'X-Requested-With': 'XMLHttpRequest'
      },
      url
    };
    return axios(options);
  }
}

export { Session };