const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
require('dotenv').config();

const { buildApp } = require('../backend/app');

const app = buildApp({
  withDbMiddleware: true,
  enableSpaFallback: false,
});

module.exports = app;
