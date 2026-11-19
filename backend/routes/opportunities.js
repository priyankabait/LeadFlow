'use strict';

const express = require('express');
const router = express.Router();
const requireUserAuth = require('../middleware/requireUserAuth');
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

router.use(requireUserAuth);

router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);
router.post('/', createOpportunity);
router.patch('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);

module.exports = router;
