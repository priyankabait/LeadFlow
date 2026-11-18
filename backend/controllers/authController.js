
'use strict';

const crypto = require('crypto');
const axios = require('axios');
const sfConfig = require('../config/salesforce');
const {
  setTokens,
  clearTokens,
  getTokens,
  makeRequest
} = require('../services/salesforceService');
const logger = require('../utils/logger');
const { success } = require('../utils/apiResponse');

const stateMap = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

const FRONTEND_URL = 'http://localhost:5173/salesforce-integration';

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

/**
 * GET /api/auth/salesforce
 * Start Salesforce OAuth with PKCE.
 */
const initOAuth = (req, res) => {
  if (!sfConfig.clientId || !sfConfig.clientSecret || !sfConfig.callbackUrl) {
    logger.error('Salesforce OAuth configuration is incomplete');
    return res.status(500).json({
      success: false,
      error: 'Salesforce OAuth configuration is incomplete.'
    });
  }

  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  stateMap.set(state, {
    createdAt: Date.now(),
    codeVerifier
  });

  for (const [key, value] of stateMap.entries()) {
    if (Date.now() - value.createdAt > STATE_TTL_MS) {
      stateMap.delete(key);
    }
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: sfConfig.clientId,
    redirect_uri: sfConfig.callbackUrl,
    state,
    scope: 'api refresh_token',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  const authUrl =
    `${sfConfig.loginUrl}/services/oauth2/authorize?${params.toString()}`;

  logger.info('Initiating Salesforce OAuth with PKCE');
  return res.redirect(authUrl);
};

/**
 * GET /api/auth/salesforce/callback
 * Exchange authorization code for tokens.
 */
const oauthCallback = async (req, res) => {
  const { code, state, error: sfError } = req.query;

  if (sfError) {
    logger.warn('Salesforce OAuth error:', sfError);
    return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }

  if (!code || !state || !stateMap.has(state)) {
    logger.warn('Invalid OAuth callback or state');
    return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }

  const savedState = stateMap.get(state);
  stateMap.delete(state);

  if (Date.now() - savedState.createdAt > STATE_TTL_MS) {
    logger.warn('Salesforce OAuth state expired');
    return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }

  try {
    const params = new URLSearchParams();

    params.append('grant_type', 'authorization_code');
    params.append('client_id', sfConfig.clientId);
    params.append('client_secret', sfConfig.clientSecret);
    params.append('redirect_uri', sfConfig.callbackUrl);
    params.append('code', code);
    params.append('code_verifier', savedState.codeVerifier);

    const response = await axios.post(
      `${sfConfig.loginUrl}/services/oauth2/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const {
      access_token,
      refresh_token,
      instance_url,
      token_type,
      issued_at
    } = response.data;

    if (!access_token || !instance_url) {
      throw new Error('Salesforce did not return the required tokens.');
    }

    setTokens({
      access_token,
      refresh_token,
      instance_url,
      token_type,
      issued_at
    });

    logger.info('Salesforce OAuth completed successfully');

    return res.redirect(`${FRONTEND_URL}?connected=true`);
  } catch (err) {
    logger.error(
      'Salesforce token exchange failed:',
      err.response?.data?.error_description || err.message
    );

    return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
};

/**
 * GET /api/auth/status
 */
const getStatus = async (req, res) => {
  const tokens = getTokens();

  if (!tokens) {
    return success(res, {
      connected: false,
      userInfo: null
    });
  }

  try {
    const userInfo = await makeRequest(
      'GET',
      '/services/data/v59.0/chatter/users/me'
    );

    return success(res, {
      connected: true,
      userInfo: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        username: userInfo.username,
        instanceUrl: tokens.instance_url
      }
    });
  } catch (err) {
    logger.warn('Could not fetch Salesforce user info:', err.message);

    return success(res, {
      connected: true,
      userInfo: null
    });
  }
};

/**
 * POST /api/auth/disconnect
 */
const disconnect = (req, res) => {
  clearTokens();
  logger.info('Salesforce tokens cleared');

  return success(res, {
    message: 'Disconnected from Salesforce'
  });
};

module.exports = {
  initOAuth,
  oauthCallback,
  getStatus,
  disconnect
};
