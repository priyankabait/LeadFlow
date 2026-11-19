
'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is missing from environment variables');
    }

    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      logger.info(`MongoDB connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
