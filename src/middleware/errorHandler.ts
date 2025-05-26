import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.details
      }
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        message: 'Unauthorized access'
      }
    });
  }

  // Handle custom HTTP errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
  }

  // Handle Unicode/encoding errors
  if (error.message && error.message.includes('Invalid UTF-8')) {
    return res.status(500).json({
      error: {
        message: 'Text encoding error occurred'
      }
    });
  }

  // Default server error
  res.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
};