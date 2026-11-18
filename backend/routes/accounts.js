'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');

router.use(authMiddleware);

router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.post('/', createAccount);
router.patch('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
