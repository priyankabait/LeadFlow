'use strict';

const logger = require('../utils/logger');

/**
 * Standard Express error handler middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} -`, err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Salesforce API errors often carry a body array
  if (err.response && err.response.data) {
    const sfError = Array.isArray(err.response.data)
      ? err.response.data[0]
      : err.response.data;
    return res.status(err.response.status || 500).json({
      success: false,
      error: sfError.message || sfError.errorCode || message,
    });
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
