import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error handler caught:', err);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle unexpected errors
  const statusCode = 500;
  const message = 'Internal Server Error';
  
  // Don't expose stack traces in production
  const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  return res.status(statusCode).json({
    error: {
      message,
      details
    }
  });
};