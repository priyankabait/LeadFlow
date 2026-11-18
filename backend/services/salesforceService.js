'use strict';

const axios = require('axios');
const sfConfig = require('../config/salesforce');
const logger = require('../utils/logger');

// ─── Token Store ─────────────────────────────────────────────────────────────
// All tokens stay server-side — never sent to the browser.
const tokenStore = new Map();

const getTokens = () => tokenStore.get('default') || null;

const setTokens = (tokens) => {
  tokenStore.set('default', tokens);
};

const clearTokens = () => {
  tokenStore.delete('default');
};

// ─── Token Refresh ────────────────────────────────────────────────────────────
const refreshAccessToken = async () => {
  const tokens = getTokens();
  if (!tokens || !tokens.refresh_token) {
    throw new Error('No refresh token available — please reconnect Salesforce.');
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', sfConfig.clientId);
  params.append('client_secret', sfConfig.clientSecret);
  params.append('refresh_token', tokens.refresh_token);

  const response = await axios.post(
    `${sfConfig.loginUrl}/services/oauth2/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const updatedTokens = {
    ...tokens,
    access_token: response.data.access_token,
    issued_at: response.data.issued_at || String(Date.now())
  };

  setTokens(updatedTokens);
  logger.info('Salesforce access token refreshed successfully');
  return updatedTokens;
};

// ─── Core Authenticated Request ───────────────────────────────────────────────
/**
 * Makes an authenticated request to the Salesforce REST API.
 * Automatically retries once on 401 by refreshing the access token first.
 *
 * For the OAuth2 userinfo endpoint (/services/oauth2/userinfo) the base URL
 * is the loginUrl, not the instance_url.
 */
const makeRequest = async (method, endpoint, data = null) => {
  let tokens = getTokens();
  if (!tokens) {
    throw new Error('Not connected to Salesforce. Please authenticate first.');
  }

  // The userinfo endpoint lives on the login server, not the instance
  const baseUrl = endpoint.startsWith('/services/oauth2/')
    ? sfConfig.loginUrl
    : tokens.instance_url;

  const buildConfig = (tkn) => ({
    method,
    url: `${baseUrl}${endpoint}`,
    headers: {
      Authorization: `${tkn.token_type || 'Bearer'} ${tkn.access_token}`,
      'Content-Type': 'application/json'
    },
    ...(data ? { data } : {})
  });

  try {
    const response = await axios(buildConfig(tokens));
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      logger.info('Access token expired — refreshing...');
      tokens = await refreshAccessToken();
      const response = await axios(buildConfig(tokens));
      return response.data;
    }
    throw err;
  }
};

// ─── SOQL Helpers ─────────────────────────────────────────────────────────────
const soqlQuery = async (query) => {
  return makeRequest('GET', `/services/data/v59.0/query?q=${encodeURIComponent(query)}`);
};

/**
 * Fetches ALL records by following Salesforce nextRecordsUrl pagination.
 */
const soqlQueryAll = async (query) => {
  let result = await soqlQuery(query);
  let records = result.records || [];

  while (result.nextRecordsUrl) {
    result = await makeRequest('GET', result.nextRecordsUrl);
    records = records.concat(result.records || []);
  }

  return records;
};

module.exports = {
  tokenStore,
  getTokens,
  setTokens,
  clearTokens,
  refreshAccessToken,
  makeRequest,
  soqlQuery,
  soqlQueryAll
};
