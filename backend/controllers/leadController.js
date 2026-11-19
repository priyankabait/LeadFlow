
'use strict';

const leadService = require('../services/leadService');
const { success, error } = require('../utils/apiResponse');

const getLeads = async (req, res, next) => {
  try {
    const { search, status, limit, offset } = req.query;

    const result = await leadService.getLeads(req.session.userId, {
      search,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(
      req.session.userId,
      req.params.id
    );

    if (!lead) return error(res, 'Lead not found', 404);

    return success(res, lead);
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    const result = await leadService.createLead(
      req.session.userId,
      req.body
    );

    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    await leadService.updateLead(
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

const deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLead(
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
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};
