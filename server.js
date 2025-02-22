const app = require('./app');
const { systemLogger } = require('./logger'); // Import the custom logger

const port = process.env.PORT || 3200;

const server = app.listen(port, () => {
  systemLogger.info(`Server is running on port ${port}`);
});

server.on('error', (error) => {
  systemLogger.error('Server error:', error);
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  systemLogger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  systemLogger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
  systemLogger.info('Received shutdown signal, shutting down gracefully');
  server.close(() => {
    systemLogger.info('Closed out remaining connections');
    process.exit(0);
  });
  // Force shutdown after 10 seconds if connections don't close gracefully
  setTimeout(() => {
    systemLogger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);