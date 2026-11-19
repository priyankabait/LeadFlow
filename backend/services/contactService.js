
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
    const safeAccountId = accountId.replace(/'/g, "\\'");
    conditions.push(`AccountId='${safeAccountId}'`);
  }

  return conditions.join(' AND ');
};

const getContacts = async (
  userId,
  { search, accountId, limit = 50, offset = 0 } = {}
) => {
  const where = buildContactWhere({ search, accountId });

  const query = `SELECT Id,FirstName,LastName,Email,Phone,AccountId,Account.Name,Title,Department,CreatedDate FROM Contact WHERE ${where} ORDER BY CreatedDate DESC LIMIT ${limit} OFFSET ${offset}`;

  return soqlQuery(userId, query);
};

const getContactById = async (userId, id) => {
  const query = `SELECT Id,FirstName,LastName,Email,Phone,AccountId,Account.Name,Title,Department,Description,CreatedDate FROM Contact WHERE Id='${id}'`;

  const result = await soqlQuery(userId, query);

  return result.records && result.records[0]
    ? result.records[0]
    : null;
};

const createContact = async (userId, data) => {
  return makeRequest(
    userId,
    'POST',
    '/services/data/v59.0/sobjects/Contact/',
    data
  );
};

const updateContact = async (userId, id, data) => {
  return makeRequest(
    userId,
    'PATCH',
    `/services/data/v59.0/sobjects/Contact/${id}`,
    data
  );
};

const deleteContact = async (userId, id) => {
  return makeRequest(
    userId,
    'DELETE',
    `/services/data/v59.0/sobjects/Contact/${id}`
  );
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
