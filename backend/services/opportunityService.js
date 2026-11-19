
'use strict';

const { soqlQuery, makeRequest } = require('./salesforceService');

const buildOpportunityWhere = ({ search, stage }) => {
  const conditions = ['IsDeleted=false'];

  if (search) {
    const s = search.replace(/'/g, "\\'");
    conditions.push(`Name LIKE '%${s}%'`);
  }

  if (stage) {
    const safeStage = stage.replace(/'/g, "\\'");
    conditions.push(`StageName='${safeStage}'`);
  }

  return conditions.join(' AND ');
};

const getOpportunities = async (
  userId,
  { search, stage, limit = 50, offset = 0 } = {}
) => {
  const where = buildOpportunityWhere({ search, stage });

  const query = `SELECT Id,Name,Amount,StageName,CloseDate,AccountId,Account.Name,Probability,Type,LeadSource,CreatedDate FROM Opportunity WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;

  return soqlQuery(userId, query);
};

const getOpportunityById = async (userId, id) => {
  const query = `SELECT Id,Name,Amount,StageName,CloseDate,AccountId,Account.Name,Probability,Type,LeadSource,Description,CreatedDate FROM Opportunity WHERE Id='${id}'`;

  const result = await soqlQuery(userId, query);

  return result.records && result.records[0]
    ? result.records[0]
    : null;
};

const createOpportunity = async (userId, data) => {
  return makeRequest(
    userId,
    'POST',
    '/services/data/v59.0/sobjects/Opportunity/',
    data
  );
};

const updateOpportunity = async (userId, id, data) => {
  return makeRequest(
    userId,
    'PATCH',
    `/services/data/v59.0/sobjects/Opportunity/${id}`,
    data
  );
};

const deleteOpportunity = async (userId, id) => {
  return makeRequest(
    userId,
    'DELETE',
    `/services/data/v59.0/sobjects/Opportunity/${id}`
  );
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
};
