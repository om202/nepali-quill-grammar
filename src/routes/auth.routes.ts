import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/auth';
import { 
  signupSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  changePasswordSchema 
} from '../schemas/auth.schema';

const authRouter = Router();

// Public routes
authRouter.post('/signup', validateRequest(signupSchema), AuthController.signup);
authRouter.post('/login', validateRequest(loginSchema), AuthController.login);

// Password reset routes (public)
authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);
authRouter.get('/verify-reset-token', AuthController.verifyResetToken);

// Protected routes
authRouter.get('/profile', authenticateToken, AuthController.getProfile);
authRouter.put('/profile', authenticateToken, AuthController.updateProfile);
authRouter.post('/logout', authenticateToken, AuthController.logout);
authRouter.get('/history', authenticateToken, AuthController.getUserHistory);
authRouter.post('/change-password', authenticateToken, validateRequest(changePasswordSchema), AuthController.changePassword);

export { authRouter }; 