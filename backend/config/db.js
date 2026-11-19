
'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is missing from environment variables');
    }

    const conn = await mongoose.connect(uri);

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
