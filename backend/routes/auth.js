
'use strict';

const express = require('express');
const router = express.Router();

const requireUserAuth = require('../middleware/requireUserAuth');

const {
  initOAuth,
  oauthCallback,
  getStatus,
  disconnect
} = require('../controllers/authController');

// LeadFlow login is required to start OAuth
router.get('/salesforce', requireUserAuth, initOAuth);

// Callback validates the original authenticated session and OAuth state
router.get('/salesforce/callback', oauthCallback);

// Only logged-in users can check or disconnect their own connection
router.get('/status', requireUserAuth, getStatus);
router.post('/disconnect', requireUserAuth, disconnect);

module.exports = router;
