import pino from 'pino';

const logger = pino({
  level: process.env.LOGLEVEL,
  prettyPrint: {
    ignore: 'pid,hostname,time',
    messageFormat: '{msg}',
  },
  redact: ['apiKey', 'process.env.*'],
});

export default name => {
  return logger.child({ name });
};
