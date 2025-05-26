import { Request, Response } from 'express';
import { suggestionService } from '../services/suggestion.service';
import { logger } from '../utils/logger';
import { UpdateSuggestionRequestBody } from '../schemas/suggestions.schema';

export const suggestionsController = {
  async updateSuggestion(
    req: Request<{ sessionId: string }, {}, UpdateSuggestionRequestBody>,
    res: Response
  ) {
    try {
      const { sessionId } = req.params;
      const { suggestionId, action } = req.body;
      
      logger.info(`Recording action ${action} for suggestion ${suggestionId}`);
      
      // Record the action
      await suggestionService.recordAction(suggestionId, action);
      
      // Get updated diff model
      const updatedModel = await suggestionService.getUpdatedDiffModel(sessionId);
      
      return res.status(200).json(updatedModel);
    } catch (error) {
      logger.error('Error updating suggestion:', error);
      throw error;
    }
  }
};