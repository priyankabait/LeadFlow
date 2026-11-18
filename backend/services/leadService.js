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

const getLeads = async ({ search, status, limit = 50, offset = 0 } = {}) => {
  const where = buildLeadWhere({ search, status });
  const query = `SELECT Id,FirstName,LastName,Company,Email,Phone,Status,LeadSource,CreatedDate FROM Lead WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;
  return soqlQuery(query);
};

const getLeadById = async (id) => {
  const query = `SELECT Id,FirstName,LastName,Company,Email,Phone,Status,LeadSource,Industry,Rating,Description,CreatedDate FROM Lead WHERE Id='${id}'`;
  const result = await soqlQuery(query);
  return result.records && result.records[0] ? result.records[0] : null;
};

const createLead = async (data) => {
  return makeRequest('POST', '/services/data/v59.0/sobjects/Lead/', data);
};

const updateLead = async (id, data) => {
  return makeRequest('PATCH', `/services/data/v59.0/sobjects/Lead/${id}`, data);
};

const deleteLead = async (id) => {
  return makeRequest('DELETE', `/services/data/v59.0/sobjects/Lead/${id}`);
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead };
