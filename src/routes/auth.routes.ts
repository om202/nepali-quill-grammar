import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/auth';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

const authRouter = Router();

// Public routes
authRouter.post('/signup', validateRequest(signupSchema), AuthController.signup);
authRouter.post('/login', validateRequest(loginSchema), AuthController.login);

// Protected routes
authRouter.get('/profile', authenticateToken, AuthController.getProfile);
authRouter.put('/profile', authenticateToken, AuthController.updateProfile);
authRouter.post('/logout', authenticateToken, AuthController.logout);
authRouter.get('/history', authenticateToken, AuthController.getUserHistory);

export { authRouter }; 