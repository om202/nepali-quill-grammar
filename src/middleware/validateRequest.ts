import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, z } from 'zod';
import { HttpError } from '../utils/httpError';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        throw new HttpError(400, 'Validation error', { errors: formattedErrors });
      }
      next(error);
    }
  };
};