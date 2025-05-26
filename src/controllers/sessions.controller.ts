import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';
import { logger } from '../utils/logger';

export const sessionsController = {
  async getSession(req: Request<{ sessionId: string }>, res: Response) {
    try {
      const { sessionId } = req.params;
      
      logger.info(`Getting session data for ${sessionId}`);
      
      // Get session data with tokens and actions
      const sessionData = await sessionService.getSessionWithDetails(sessionId);
      
      return res.status(200).json(sessionData);
    } catch (error) {
      logger.error('Error getting session:', error);
      throw error;
    }
  }
};