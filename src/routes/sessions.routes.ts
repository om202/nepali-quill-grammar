import { Router } from 'express';
import { sessionsController } from '../controllers/sessions.controller';

const sessionsRouter = Router();

// GET /api/v1/sessions/:sessionId - Get session data
sessionsRouter.get('/:sessionId', sessionsController.getSession);

export { sessionsRouter };