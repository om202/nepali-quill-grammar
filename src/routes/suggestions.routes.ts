import { Router } from 'express';
import { suggestionsController } from '../controllers/suggestions.controller';
import { validateRequest } from '../middleware/validateRequest';
import { updateSuggestionSchema } from '../schemas/suggestions.schema';

const suggestionsRouter = Router();

// PATCH /api/v1/suggestions/:sessionId - Update suggestion action
suggestionsRouter.patch(
  '/:sessionId',
  validateRequest(updateSuggestionSchema),
  suggestionsController.updateSuggestion
);

export { suggestionsRouter };