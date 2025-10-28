import axios from 'axios';

/**
 * Call a protected API endpoint using an access token from Auth0.
 * @param {object} params
 * @param {Function} params.getAccessTokenSilently - Auth0 helper to retrieve tokens.
 * @param {string} params.audience - API audience to use for the token request.
 * @returns {Promise<any>}
 */
export async function callProtectedApi({ getAccessTokenSilently, audience }) {
  if (typeof getAccessTokenSilently !== 'function') {
    throw new Error('getAccessTokenSilently must be a function.');
  }

  const token = await getAccessTokenSilently({
    authorizationParams: {
      audience,
      scope: 'read:messages profile email openid',
    },
  });

  const apiUrl = `${audience.replace(/\/$/, '')}/api/messages`;

  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}