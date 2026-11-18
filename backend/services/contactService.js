'use strict';

const { soqlQuery, makeRequest } = require('./salesforceService');

const buildContactWhere = ({ search, accountId }) => {
  const conditions = ['IsDeleted=false'];

  if (search) {
    const s = search.replace(/'/g, "\\'");
    conditions.push(
      `(FirstName LIKE '%${s}%' OR LastName LIKE '%${s}%' OR Email LIKE '%${s}%')`
    );
  }

  if (accountId) {
    conditions.push(`AccountId='${accountId.replace(/'/g, "\\'")}'`);
  }

  return conditions.join(' AND ');
};

const getContacts = async ({ search, accountId, limit = 50, offset = 0 } = {}) => {
  const where = buildContactWhere({ search, accountId });
  const query = `SELECT Id,FirstName,LastName,Email,Phone,AccountId,Account.Name,Title,Department,CreatedDate FROM Contact WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;
  return soqlQuery(query);
};

const getContactById = async (id) => {
  const query = `SELECT Id,FirstName,LastName,Email,Phone,AccountId,Account.Name,Title,Department,Description,CreatedDate FROM Contact WHERE Id='${id}'`;
  const result = await soqlQuery(query);
  return result.records && result.records[0] ? result.records[0] : null;
};

const createContact = async (data) => {
  return makeRequest('POST', '/services/data/v59.0/sobjects/Contact/', data);
};

const updateContact = async (id, data) => {
  return makeRequest('PATCH', `/services/data/v59.0/sobjects/Contact/${id}`, data);
};

const deleteContact = async (id) => {
  return makeRequest('DELETE', `/services/data/v59.0/sobjects/Contact/${id}`);
};

module.exports = { getContacts, getContactById, createContact, updateContact, deleteContact };
