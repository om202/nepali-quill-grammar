import { Router } from 'express';
import { analyzeRouter } from './analyze.routes';
import { suggestionsRouter } from './suggestions.routes';
import { sessionsRouter } from './sessions.routes';

const apiRouter = Router();

// Mount route handlers
apiRouter.use('/analyze', analyzeRouter);
apiRouter.use('/suggestions', suggestionsRouter);
apiRouter.use('/sessions', sessionsRouter);

export { apiRouter };