'use strict';

const express = require('express');
const router = express.Router();
const requireUserAuth = require('../middleware/requireUserAuth');
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

router.use(requireUserAuth);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
