import { Router } from 'express';
import { analyzeController } from '../controllers/analyze.controller';
import { validateRequest } from '../middleware/validateRequest';
import { analyzeSchema } from '../schemas/analyze.schema';

const analyzeRouter = Router();

// POST /api/v1/analyze - Analyze text and generate suggestions
analyzeRouter.post('/', validateRequest(analyzeSchema), analyzeController.analyzeText);

export { analyzeRouter };