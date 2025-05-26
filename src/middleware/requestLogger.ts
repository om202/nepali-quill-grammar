import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  
  // Log request body if present and not a file upload
  if (req.body && Object.keys(req.body).length > 0 && !req.is('multipart/form-data')) {
    logger.debug('Request body:', { 
      body: sanitizeBody(req.body) 
    });
  }
  
  next();
};

// Sanitize sensitive information from request bodies
function sanitizeBody(body: Record<string, any>): Record<string, any> {
  const sanitized = { ...body };
  
  // List of fields to redact
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}