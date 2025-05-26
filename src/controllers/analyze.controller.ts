import { Request, Response } from 'express';
import { textAnalysisService } from '../services/textAnalysis.service';
import { sessionService } from '../services/session.service';
import { logger } from '../utils/logger';
import { AnalyzeRequestBody } from '../schemas/analyze.schema';

export const analyzeController = {
  async analyzeText(req: Request<{}, {}, AnalyzeRequestBody>, res: Response) {
    try {
      const { text } = req.body;
      const userId = req.user?.id; // Get user ID if authenticated
      
      logger.info('Analyzing text', { userId: userId || 'anonymous' });
      
      // Create a new session with user ID if available
      const session = await sessionService.createSession(text, userId);
      
      // Analyze the text and get suggestions
      const result = await textAnalysisService.analyzeText(text, session.id);
      
      return res.status(200).json({
        sessionId: session.id,
        suggestions: result.suggestions
      });
    } catch (error) {
      logger.error('Error analyzing text:', error);
      throw error;
    }
  }
};