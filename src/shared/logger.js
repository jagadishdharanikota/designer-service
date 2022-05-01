const Winston = require('winston');

const logger = new Winston.createLogger({
  transports: [
    new Winston.transports.Console({
      timestamp: new Date().toISOString(),
      colorize: true,
    }),
  ],
});

module.exports = logger;
