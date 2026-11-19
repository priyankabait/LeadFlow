
'use strict';

const { soqlQuery } = require('../services/salesforceService');
const { success } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /api/dashboard/stats
 * Runs 6 SOQL queries in parallel for the authenticated user.
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const [
      leadsResult,
      accountsResult,
      contactsResult,
      oppResult,
      oppByStageResult,
      leadsByStatusResult
    ] = await Promise.all([
      soqlQuery(
        userId,
        'SELECT COUNT(Id) totalLeads FROM Lead WHERE IsDeleted=false'
      ),
      soqlQuery(
        userId,
        'SELECT COUNT(Id) totalAccounts FROM Account WHERE IsDeleted=false'
      ),
      soqlQuery(
        userId,
        'SELECT COUNT(Id) totalContacts FROM Contact WHERE IsDeleted=false'
      ),
      soqlQuery(
        userId,
        'SELECT COUNT(Id) openOpportunities, SUM(Amount) pipelineValue FROM Opportunity WHERE IsDeleted=false AND IsClosed=false'
      ),
      soqlQuery(
        userId,
        'SELECT StageName, COUNT(Id) stageCount, SUM(Amount) stageAmount FROM Opportunity WHERE IsDeleted=false GROUP BY StageName'
      ),
      soqlQuery(
        userId,
        'SELECT Status, COUNT(Id) statusCount FROM Lead WHERE IsDeleted=false GROUP BY Status'
      )
    ]);

    const leadsAgg = leadsResult.records[0] || {};
    const accountsAgg = accountsResult.records[0] || {};
    const contactsAgg = contactsResult.records[0] || {};
    const oppAgg = oppResult.records[0] || {};

    return success(res, {
      totalLeads: leadsAgg.totalLeads || 0,
      totalAccounts: accountsAgg.totalAccounts || 0,
      totalContacts: contactsAgg.totalContacts || 0,
      openOpportunities: oppAgg.openOpportunities || 0,
      pipelineValue: oppAgg.pipelineValue || 0,
      opportunitiesByStage: oppByStageResult.records || [],
      leadsByStatus: leadsByStatusResult.records || []
    });
  } catch (err) {
    logger.error('Dashboard stats error:', err.message);
    next(err);
  }
};

module.exports = { getStats };
