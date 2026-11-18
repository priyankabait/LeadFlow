'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

router.use(authMiddleware);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);

module.exports = router;
