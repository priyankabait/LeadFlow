
'use strict';

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/userAuthController');

const { rateLimit } = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.'
  }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;
