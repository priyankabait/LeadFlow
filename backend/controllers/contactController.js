
'use strict';

const contactService = require('../services/contactService');
const { success, error } = require('../utils/apiResponse');

const getContacts = async (req, res, next) => {
  try {
    const { search, accountId, limit, offset } = req.query;

    const result = await contactService.getContacts(
      req.session.userId,
      {
        search,
        accountId,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      }
    );

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactService.getContactById(
      req.session.userId,
      req.params.id
    );

    if (!contact) return error(res, 'Contact not found', 404);

    return success(res, contact);
  } catch (err) {
    next(err);
  }
};

const createContact = async (req, res, next) => {
  try {
    const result = await contactService.createContact(
      req.session.userId,
      req.body
    );

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const updateContact = async (req, res, next) => {
  try {
    await contactService.updateContact(
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

const deleteContact = async (req, res, next) => {
  try {
    await contactService.deleteContact(
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
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
