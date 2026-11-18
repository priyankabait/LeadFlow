
'use strict';

const express = require('express');
const router = express.Router();

const {
  initOAuth,
  oauthCallback,
  getStatus,
  disconnect
} = require('../controllers/authController');

// Start Salesforce OAuth
router.get('/salesforce', initOAuth);

// Handle Salesforce OAuth callback
router.get('/salesforce/callback', oauthCallback);

// Check connection status
router.get('/status', getStatus);

// Disconnect Salesforce
router.post('/disconnect', disconnect);

module.exports = router;
