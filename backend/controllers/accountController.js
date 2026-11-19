
'use strict';

const accountService = require('../services/accountService');
const { success, error } = require('../utils/apiResponse');

const getAccounts = async (req, res, next) => {
  try {
    const { search, industry, limit, offset } = req.query;

    const result = await accountService.getAccounts(
      req.session.userId,
      {
        search,
        industry,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      }
    );

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account = await accountService.getAccountById(
      req.session.userId,
      req.params.id
    );

    if (!account) return error(res, 'Account not found', 404);

    return success(res, account);
  } catch (err) {
    next(err);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const result = await accountService.createAccount(
      req.session.userId,
      req.body
    );

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    await accountService.updateAccount(
      req.session.userId,
      req.params.id,
      req.body
    );

    return success(res, {
      id: req.params.id,
      updated: true
    });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await accountService.deleteAccount(
      req.session.userId,
      req.params.id
    );

    return success(res, {
      id: req.params.id,
      deleted: true
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};
