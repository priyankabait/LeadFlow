'use strict';

const { soqlQuery, makeRequest } = require('./salesforceService');

const buildAccountWhere = ({ search, industry }) => {
  const conditions = ['IsDeleted=false'];

  if (search) {
    const s = search.replace(/'/g, "\\'");
    conditions.push(`Name LIKE '%${s}%'`);
  }

  if (industry) {
    conditions.push(`Industry='${industry.replace(/'/g, "\\'")}'`);
  }

  return conditions.join(' AND ');
};

const getAccounts = async ({ search, industry, limit = 50, offset = 0 } = {}) => {
  const where = buildAccountWhere({ search, industry });
  const query = `SELECT Id,Name,Industry,Phone,Website,BillingCity,BillingCountry,Type,AnnualRevenue,NumberOfEmployees,CreatedDate FROM Account WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;
  return soqlQuery(query);
};

const getAccountById = async (id) => {
  const query = `SELECT Id,Name,Industry,Phone,Website,BillingCity,BillingCountry,Type,AnnualRevenue,NumberOfEmployees,Description,CreatedDate FROM Account WHERE Id='${id}'`;
  const result = await soqlQuery(query);
  return result.records && result.records[0] ? result.records[0] : null;
};

const createAccount = async (data) => {
  return makeRequest('POST', '/services/data/v59.0/sobjects/Account/', data);
};

const updateAccount = async (id, data) => {
  return makeRequest('PATCH', `/services/data/v59.0/sobjects/Account/${id}`, data);
};

const deleteAccount = async (id) => {
  return makeRequest('DELETE', `/services/data/v59.0/sobjects/Account/${id}`);
};

module.exports = { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount };
