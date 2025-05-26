import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiRouter } from './routes';
import { requestLogger } from './middleware/requestLogger';

// Initialize express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());

// Ensure proper UTF-8 encoding
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set proper charset for responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(morgan('dev'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).send({ status: 'ok' });
});

// API routes
app.use('/api/v1', apiRouter);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export { app };