const logger = require('../shared/logger');

function processHandler() {
  // Handling process termination
  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught exception occured: ', error);
    process.emit(0);
  });

  // Ctrl + C
  process.on('SIGINT', async (error) => {
    logger.error('Process interrupted', error);
    process.emit(0);
    // CTRL + C is not terminating the process from VSCode terminal so shutting down the process
    process.exit(1);
  });

  // Killing the process
  process.on('SIGTERM', async (error) => {
    logger.error('Process is killed', error);
    process.emit(0);
  });
}

module.exports = processHandler;
