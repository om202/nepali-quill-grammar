import { Request, Response } from 'express';
import { suggestionService } from '../services/suggestion.service';
import { logger } from '../utils/logger';

export const sessionsController = {
  async getSession(req: Request<{ sessionId: string }>, res: Response) {
    try {
      const { sessionId } = req.params;
      
      logger.info(`Getting session data for ${sessionId}`);
      
      // Get session data as DiffModel with applied and pending suggestions
      const sessionData = await suggestionService.getUpdatedDiffModel(sessionId);
      
      return res.status(200).json(sessionData);
    } catch (error) {
      logger.error('Error getting session:', error);
      throw error;
    }
  }
};