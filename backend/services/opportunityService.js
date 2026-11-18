'use strict';

const { soqlQuery, makeRequest } = require('./salesforceService');

const buildOpportunityWhere = ({ search, stage }) => {
  const conditions = ['IsDeleted=false'];

  if (search) {
    const s = search.replace(/'/g, "\\'");
    conditions.push(`Name LIKE '%${s}%'`);
  }

  if (stage) {
    conditions.push(`StageName='${stage.replace(/'/g, "\\'")}'`);
  }

  return conditions.join(' AND ');
};

const getOpportunities = async ({ search, stage, limit = 50, offset = 0 } = {}) => {
  const where = buildOpportunityWhere({ search, stage });
  const query = `SELECT Id,Name,Amount,StageName,CloseDate,AccountId,Account.Name,Probability,Type,LeadSource,CreatedDate FROM Opportunity WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;
  return soqlQuery(query);
};

const getOpportunityById = async (id) => {
  const query = `SELECT Id,Name,Amount,StageName,CloseDate,AccountId,Account.Name,Probability,Type,LeadSource,Description,CreatedDate FROM Opportunity WHERE Id='${id}'`;
  const result = await soqlQuery(query);
  return result.records && result.records[0] ? result.records[0] : null;
};

const createOpportunity = async (data) => {
  return makeRequest('POST', '/services/data/v59.0/sobjects/Opportunity/', data);
};

const updateOpportunity = async (id, data) => {
  return makeRequest('PATCH', `/services/data/v59.0/sobjects/Opportunity/${id}`, data);
};

const deleteOpportunity = async (id) => {
  return makeRequest('DELETE', `/services/data/v59.0/sobjects/Opportunity/${id}`);
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
