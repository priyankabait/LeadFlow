
'use strict';

const { soqlQuery, makeRequest } = require('./salesforceService');

/**
 * Build a SOQL WHERE clause fragment for Lead searches.
 */
const buildLeadWhere = ({ search, status }) => {
  const conditions = ['IsDeleted=false'];

  if (search) {
    const s = search.replace(/'/g, "\\'");
    conditions.push(
      `(FirstName LIKE '%${s}%' OR LastName LIKE '%${s}%' OR Company LIKE '%${s}%')`
    );
  }

  if (status) {
    conditions.push(`Status='${status.replace(/'/g, "\\'")}'`);
  }

  return conditions.join(' AND ');
};

const getLeads = async (
  userId,
  { search, status, limit = 50, offset = 0 } = {}
) => {
  const where = buildLeadWhere({ search, status });

  const query = `SELECT Id,FirstName,LastName,Company,Email,Phone,Status,LeadSource,CreatedDate FROM Lead WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;

  return soqlQuery(userId, query);
};

const getLeadById = async (userId, id) => {
  const query = `SELECT Id,FirstName,LastName,Company,Email,Phone,Status,LeadSource,Industry,Rating,Description,CreatedDate FROM Lead WHERE Id='${id}'`;

  const result = await soqlQuery(userId, query);

  return result.records && result.records[0]
    ? result.records[0]
    : null;
};

const createLead = async (userId, data) => {
  return makeRequest(
    userId,
    'POST',
    '/services/data/v59.0/sobjects/Lead/',
    data
  );
};

const updateLead = async (userId, id, data) => {
  return makeRequest(
    userId,
    'PATCH',
    `/services/data/v59.0/sobjects/Lead/${id}`,
    data
  );
};

const deleteLead = async (userId, id) => {
  return makeRequest(
    userId,
    'DELETE',
    `/services/data/v59.0/sobjects/Lead/${id}`
  );
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};
