'use strict';

const express = require('express');
const router = express.Router();
const requireUserAuth = require('../middleware/requireUserAuth');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');

router.use(requireUserAuth);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
