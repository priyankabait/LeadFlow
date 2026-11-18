'use strict';

/**
 * Salesforce configuration loaded from environment variables.
 * Import this wherever Salesforce credentials are needed.
 */
const salesforceConfig = {
  clientId: process.env.SALESFORCE_CLIENT_ID || '',
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
  callbackUrl: process.env.SALESFORCE_CALLBACK_URL || 'http://localhost:5000/api/auth/callback',
  loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
};

module.exports = salesforceConfig;
