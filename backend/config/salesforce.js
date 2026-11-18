'use strict';

/**
 * Salesforce configuration loaded from environment variables.
 *
 * Required variables (must be set in .env):
 *   SALESFORCE_CLIENT_ID
 *   SALESFORCE_CLIENT_SECRET
 *   SALESFORCE_CALLBACK_URL
 *   SALESFORCE_LOGIN_URL
 *
 * Optional:
 *   FRONTEND_URL  — the frontend origin (default: http://localhost:5173)
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    // Warn at startup but don't crash — the route handler will return 500
    // when clientId/clientSecret are missing.
    console.warn(`[config/salesforce] WARNING: ${name} is not set`);
  }
  return value || '';
}

const salesforceConfig = {
  clientId:    requireEnv('SALESFORCE_CLIENT_ID'),
  clientSecret: requireEnv('SALESFORCE_CLIENT_SECRET'),
  callbackUrl: process.env.SALESFORCE_CALLBACK_URL || 'http://localhost:5000/api/auth/salesforce/callback',
  loginUrl:    process.env.SALESFORCE_LOGIN_URL    || 'https://login.salesforce.com',
  frontendUrl: process.env.FRONTEND_URL             || 'http://localhost:5173',
};

module.exports = salesforceConfig;
