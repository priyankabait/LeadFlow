'use strict';

const express = require('express');
const router = express.Router();
const requireUserAuth = require('../middleware/requireUserAuth');
const { getStats } = require('../controllers/dashboardController');

router.use(requireUserAuth);

router.get('/stats', getStats);

module.exports = router;
