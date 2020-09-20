const pino = require('pino');

exports.logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: true,
});
