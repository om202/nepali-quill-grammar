import { Router } from 'express';
import { sessionsController } from '../controllers/sessions.controller';
import { optionalAuth } from '../middleware/auth';

const sessionsRouter = Router();

// GET /api/v1/sessions/:sessionId - Get session data (with optional auth)
sessionsRouter.get('/:sessionId', optionalAuth, sessionsController.getSession);

export { sessionsRouter };