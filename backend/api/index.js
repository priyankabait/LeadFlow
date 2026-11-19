
'use strict';

const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({ message: 'Server connection failed' });
  }
};
