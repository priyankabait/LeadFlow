
'use strict';

const axios = require('axios');
const sfConfig = require('../config/salesforce');
const SalesforceConnection = require('../models/SalesforceConnection');
const { encrypt, decrypt } = require('../utils/tokenEncryption');
const logger = require('../utils/logger');

const getTokens = async (userId) => {
  if (!userId) {
    throw new Error('Authenticated user ID is required.');
  }

  const connection = await SalesforceConnection.findOne({ userId })
    .select('+accessToken +refreshToken');

  if (!connection) return null;

  return {
    access_token: decrypt(connection.accessToken),
    refresh_token: connection.refreshToken
      ? decrypt(connection.refreshToken)
      : null,
    instance_url: connection.instanceUrl,
    token_type: connection.tokenType || 'Bearer',
    issued_at: connection.issuedAt,
    identityUrl: connection.identityUrl
  };
};

const setTokens = async (userId, tokens) => {
  if (!userId || !tokens?.access_token || !tokens?.instance_url) {
    throw new Error('User ID and valid Salesforce tokens are required.');
  }

  await SalesforceConnection.findOneAndUpdate(
    { userId },
    {
      $set: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : null,
        instanceUrl: tokens.instance_url,
        tokenType: tokens.token_type || 'Bearer',
        issuedAt: tokens.issued_at || String(Date.now()),
        identityUrl: tokens.identityUrl || null,
        connectedAt: new Date()
      }
    },
    { upsert: true, new: true, runValidators: true }
  );
};

const clearTokens = async (userId) => {
  if (!userId) {
    throw new Error('Authenticated user ID is required.');
  }

  await SalesforceConnection.deleteOne({ userId });
};

const refreshAccessToken = async (userId) => {
  const tokens = await getTokens(userId);

  if (!tokens?.refresh_token) {
    throw new Error('No Salesforce refresh token. Please reconnect Salesforce.');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: sfConfig.clientId,
    client_secret: sfConfig.clientSecret,
    refresh_token: tokens.refresh_token
  });

  const response = await axios.post(
    `${sfConfig.loginUrl}/services/oauth2/token`,
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const updatedTokens = {
    ...tokens,
    access_token: response.data.access_token,
    issued_at: response.data.issued_at || String(Date.now())
  };

  await setTokens(userId, updatedTokens);

  logger.info('Salesforce access token refreshed for authenticated user');

  return updatedTokens;
};

const makeRequest = async (userId, method, endpoint, data = null) => {
  let tokens = await getTokens(userId);

  if (!tokens) {
    throw new Error('Not connected to Salesforce. Please connect your account.');
  }

  const buildConfig = (currentTokens) => {
    const baseUrl = endpoint.startsWith('/services/oauth2/')
      ? sfConfig.loginUrl
      : currentTokens.instance_url;

    return {
      method,
      url: `${baseUrl}${endpoint}`,
      headers: {
        Authorization: `${currentTokens.token_type || 'Bearer'} ${currentTokens.access_token}`,
        'Content-Type': 'application/json'
      },
      ...(data !== null ? { data } : {})
    };
  };

  try {
    const response = await axios(buildConfig(tokens));
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      logger.info('Salesforce token expired; refreshing for user');

      tokens = await refreshAccessToken(userId);

      const retry = await axios(buildConfig(tokens));
      return retry.data;
    }

    throw err;
  }
};

const soqlQuery = async (userId, query) => {
  return makeRequest(
    userId,
    'GET',
    `/services/data/v59.0/query?q=${encodeURIComponent(query)}`
  );
};

const soqlQueryAll = async (userId, query) => {
  let result = await soqlQuery(userId, query);
  const records = [...(result.records || [])];

  while (result.nextRecordsUrl) {
    result = await makeRequest(userId, 'GET', result.nextRecordsUrl);
    records.push(...(result.records || []));
  }

  return records;
};

module.exports = {
  getTokens,
  setTokens,
  clearTokens,
  refreshAccessToken,
  makeRequest,
  soqlQuery,
  soqlQueryAll
};
