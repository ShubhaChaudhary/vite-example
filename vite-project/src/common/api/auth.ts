import { APIConfig, buildRequest, buildUrl, requireOk } from '.';
import { APIError } from '..';

interface RefreshAccessTokenResponse {
  token: string;
}

export default ({ baseUrl }: APIConfig) => ({
  async deleteAuth(token: string): Promise<void> {
    requireOk(
      await fetch(
        buildUrl(`${baseUrl}/auth`),
        buildRequest(token, { method: 'DELETE' })
      )
    );
  },

  async refreshAccessToken(): Promise<RefreshAccessTokenResponse> {
    const res = await fetch(
      buildUrl(`${baseUrl}/auth/refresh_token`),
      buildRequest(false, {
        method: 'GET'
      })
    );

    const auth = res.headers.get('Authorization');
    const token = auth ? auth.split(' ')[1] : undefined;

    if (!token) {
      throw new APIError('Missing access token response', res);
    }

    return {
      token
    };
  }
});