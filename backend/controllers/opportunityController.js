'use strict';

const opportunityService = require('../services/opportunityService');
const { success, error } = require('../utils/apiResponse');

const getOpportunities = async (req, res, next) => {
  try {
    const { search, stage, limit, offset } = req.query;
    const result = await opportunityService.getOpportunities({
      search,
      stage,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getOpportunityById = async (req, res, next) => {
  try {
    const opp = await opportunityService.getOpportunityById(req.params.id);
    if (!opp) return error(res, 'Opportunity not found', 404);
    return success(res, opp);
  } catch (err) {
    next(err);
  }
};

const createOpportunity = async (req, res, next) => {
  try {
    const result = await opportunityService.createOpportunity(req.body);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const updateOpportunity = async (req, res, next) => {
  try {
    await opportunityService.updateOpportunity(req.params.id, req.body);
    return success(res, { id: req.params.id, updated: true });
  } catch (err) {
    next(err);
  }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    await opportunityService.deleteOpportunity(req.params.id);
    return success(res, { id: req.params.id, deleted: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
