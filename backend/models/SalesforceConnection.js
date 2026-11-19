
'use strict';

const mongoose = require('mongoose');

const salesforceConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    accessToken: {
      type: String,
      required: true,
      select: false
    },

    refreshToken: {
      type: String,
      default: null,
      select: false
    },

    instanceUrl: {
      type: String,
      required: true
    },

    tokenType: {
      type: String,
      default: 'Bearer'
    },

    issuedAt: {
      type: String,
      default: null
    },

    identityUrl: {
      type: String,
      default: null
    },

    connectedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'SalesforceConnection',
  salesforceConnectionSchema
);
