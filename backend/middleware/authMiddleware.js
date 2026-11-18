'use strict';

const { getTokens } = require('../services/salesforceService');

/**
 * Middleware: verify the server has valid Salesforce tokens in memory.
 * If not, responds with 401 immediately.
 */
const authMiddleware = (req, res, next) => {
  const tokens = getTokens();
  if (!tokens) {
    return res.status(401).json({
      success: false,
      error: 'Not connected to Salesforce. Please authenticate first.',
    });
  }
  next();
};

module.exports = authMiddleware;
