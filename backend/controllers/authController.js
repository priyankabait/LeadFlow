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

// Module-level maps — in-memory, never sent to client
const stateMap = new Map();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

function frontendIntegrationUrl() {
  return `${sfConfig.frontendUrl}/salesforce-integration`;
}

/**
 * GET /api/auth/salesforce
 * Redirect to Salesforce OAuth login (Authorization Code + PKCE).
 */
const initOAuth = (req, res) => {
  if (!sfConfig.clientId || !sfConfig.clientSecret) {
    logger.error('Salesforce OAuth configuration is incomplete — missing CLIENT_ID or CLIENT_SECRET');
    return res.status(500).json({
      success: false,
      error: 'Salesforce OAuth configuration is incomplete. Set SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET in .env'
    });
  }

  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  stateMap.set(state, { createdAt: Date.now(), codeVerifier });

  // Prune stale states
  for (const [key, value] of stateMap.entries()) {
    if (Date.now() - value.createdAt > STATE_TTL_MS) stateMap.delete(key);
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

  const authUrl = `${sfConfig.loginUrl}/services/oauth2/authorize?${params.toString()}`;
  logger.info('Initiating Salesforce OAuth with PKCE');
  return res.redirect(authUrl);
};

/**
 * GET /api/auth/salesforce/callback
 * Exchange authorization code for tokens and store in memory.
 */
const oauthCallback = async (req, res) => {
  const { code, state, error: sfError } = req.query;
  const redirectBase = frontendIntegrationUrl();

  if (sfError) {
    logger.warn('Salesforce OAuth returned error:', sfError);
    return res.redirect(`${redirectBase}?error=auth_failed`);
  }

  if (!code || !state || !stateMap.has(state)) {
    logger.warn('Invalid OAuth callback — missing code, state, or state mismatch');
    return res.redirect(`${redirectBase}?error=auth_failed`);
  }

  const savedState = stateMap.get(state);
  stateMap.delete(state);

  if (Date.now() - savedState.createdAt > STATE_TTL_MS) {
    logger.warn('Salesforce OAuth state expired');
    return res.redirect(`${redirectBase}?error=auth_failed`);
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
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, instance_url, token_type, issued_at, id: identityUrl } = response.data;

    if (!access_token || !instance_url) {
      throw new Error('Salesforce did not return the required tokens.');
    }

    setTokens({ access_token, refresh_token, instance_url, token_type, issued_at, identityUrl });
    logger.info('Salesforce OAuth completed successfully');

    return res.redirect(`${redirectBase}?connected=true`);
  } catch (err) {
    logger.error(
      'Salesforce token exchange failed:',
      err.response?.data?.error_description || err.message
    );
    return res.redirect(`${redirectBase}?error=auth_failed`);
  }
};

/**
 * GET /api/auth/status
 * Returns { connected, userInfo } without exposing tokens.
 */
const getStatus = async (req, res) => {
  const tokens = getTokens();

  if (!tokens) {
    return success(res, { connected: false, userInfo: null });
  }

  try {
    // Use the identity URL returned during token exchange (most reliable)
    // Fall back to /services/data/v59.0/chatter/users/me
    let userInfo = null;

    if (tokens.identityUrl) {
      const identityResponse = await axios.get(tokens.identityUrl, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const id = identityResponse.data;
      userInfo = {
        id: id.user_id,
        name: id.display_name,
        email: id.email,
        username: id.username,
        instanceUrl: tokens.instance_url
      };
    } else {
      // Fallback: Salesforce REST identity
      const id = await makeRequest('GET', '/services/oauth2/userinfo');
      userInfo = {
        id: id.user_id,
        name: id.name,
        email: id.email,
        username: id.preferred_username,
        instanceUrl: tokens.instance_url
      };
    }

    return success(res, { connected: true, userInfo });
  } catch (err) {
    logger.warn('Could not fetch Salesforce user info:', err.message);
    // Still connected — tokens exist, just user info unavailable
    return success(res, { connected: true, userInfo: null });
  }
};

/**
 * POST /api/auth/disconnect
 */
const disconnect = (req, res) => {
  clearTokens();
  logger.info('Salesforce tokens cleared');
  return success(res, { message: 'Disconnected from Salesforce' });
};

module.exports = { initOAuth, oauthCallback, getStatus, disconnect };
