import { Router } from 'express';
import { analyzeController } from '../controllers/analyze.controller';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuth } from '../middleware/auth';
import { analyzeSchema } from '../schemas/analyze.schema';

const analyzeRouter = Router();

// POST /api/v1/analyze - Analyze text and generate suggestions (with optional auth)
analyzeRouter.post('/', optionalAuth, validateRequest(analyzeSchema), analyzeController.analyzeText);

export { analyzeRouter };