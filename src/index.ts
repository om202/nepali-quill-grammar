import 'express-async-errors';
import dotenv from 'dotenv';
import { app } from './app';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT;

if (!PORT) {
  logger.error('PORT environment variable is required. Please set it in your .env file.');
  process.exit(1);
}

const portNumber = parseInt(PORT, 10);

if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
  logger.error(`Invalid PORT value: ${PORT}. Port must be a number between 1 and 65535.`);
  process.exit(1);
}

// Start the server
const server = app.listen(portNumber, () => {
  logger.info(`Server is running on port ${portNumber}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle port already in use error
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${portNumber} is already in use. Please change the PORT value in your .env file to use a different port, or stop the process using port ${portNumber}.`);
    process.exit(1);
  } else {
    logger.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});