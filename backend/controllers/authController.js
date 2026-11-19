
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

const STATE_TTL_MS = 10 * 60 * 1000;

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || 'http://localhost:5173';

function frontendIntegrationUrl() {
  return `${getFrontendUrl()}/salesforce-integration`;
}

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
 * Start Salesforce OAuth for the logged-in LeadFlow user.
 */
const initOAuth = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Please log in first.'
      });
    }

    if (!sfConfig.clientId || !sfConfig.clientSecret) {
      logger.error('Salesforce OAuth configuration is incomplete');

      return res.status(500).json({
        success: false,
        error: 'Salesforce OAuth configuration is incomplete.'
      });
    }

    const state = crypto.randomUUID();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    req.session.salesforceOAuthState = {
      state,
      codeVerifier,
      createdAt: Date.now(),
      userId: String(req.session.userId)
    };

    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

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

    logger.info('Starting Salesforce OAuth for authenticated user');

    return res.redirect(authUrl);
  } catch (err) {
    logger.error('Salesforce OAuth initialization failed:', err.message);

    return res.status(500).json({
      success: false,
      error: 'Could not start Salesforce authentication.'
    });
  }
};

/**
 * GET /api/auth/salesforce/callback
 * Exchange authorization code and save tokens for the correct user.
 */
const oauthCallback = async (req, res) => {
  const { code, state, error: sfError } = req.query;
  const redirectBase = frontendIntegrationUrl();

  if (sfError) {
    logger.warn('Salesforce OAuth returned an error');
    return res.redirect(`${redirectBase}?error=auth_failed`);
  }

  const savedState = req.session?.salesforceOAuthState;

  if (
    !req.session?.userId ||
    !savedState ||
    !code ||
    !state ||
    typeof state !== 'string' ||
    savedState.state !== state ||
    savedState.userId !== String(req.session.userId) ||
    Date.now() - savedState.createdAt > STATE_TTL_MS
  ) {
    logger.warn('Invalid, expired or mismatched Salesforce OAuth state');

    return res.redirect(`${redirectBase}?error=auth_failed`);
  }

  // Remove state before exchanging the code to prevent callback replay.
  delete req.session.salesforceOAuthState;

  try {
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: sfConfig.clientId,
      client_secret: sfConfig.clientSecret,
      redirect_uri: sfConfig.callbackUrl,
      code,
      code_verifier: savedState.codeVerifier
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

    const {
      access_token,
      refresh_token,
      instance_url,
      token_type,
      issued_at,
      id: identityUrl
    } = response.data;

    if (!access_token || !instance_url) {
      throw new Error('Salesforce did not return the required tokens.');
    }

    await setTokens(req.session.userId, {
      access_token,
      refresh_token,
      instance_url,
      token_type,
      issued_at,
      identityUrl
    });

    logger.info('Salesforce connected for authenticated LeadFlow user');

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
 * Return Salesforce connection status for the logged-in user.
 */
const getStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const tokens = await getTokens(userId);

    if (!tokens) {
      return success(res, {
        connected: false,
        userInfo: null
      });
    }

    let userInfo = null;

    if (tokens.identityUrl) {
      const identityResponse = await axios.get(tokens.identityUrl, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });

      const identity = identityResponse.data;

      userInfo = {
        id: identity.user_id,
        name: identity.display_name,
        email: identity.email,
        username: identity.username,
        instanceUrl: tokens.instance_url
      };
    } else {
      const identity = await makeRequest(
        userId,
        'GET',
        '/services/oauth2/userinfo'
      );

      userInfo = {
        id: identity.user_id,
        name: identity.name,
        email: identity.email,
        username: identity.preferred_username,
        instanceUrl: tokens.instance_url
      };
    }

    return success(res, {
      connected: true,
      userInfo
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
 * Disconnect only the current user's Salesforce account.
 */
const disconnect = async (req, res) => {
  try {
    await clearTokens(req.session.userId);

    logger.info('Salesforce disconnected for authenticated user');

    return success(res, {
      message: 'Disconnected from Salesforce'
    });
  } catch (err) {
    logger.error('Salesforce disconnect failed:', err.message);

    return res.status(500).json({
      success: false,
      error: 'Could not disconnect Salesforce.'
    });
  }
};

module.exports = {
  initOAuth,
  oauthCallback,
  getStatus,
  disconnect
};
