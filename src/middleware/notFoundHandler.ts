import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      details: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
};