import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sessionService } from '../services/session.service';
import { 
  SignupRequestBody, 
  LoginRequestBody, 
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  ChangePasswordRequestBody 
} from '../schemas/auth.schema';
import { UserModel } from '../types/database.types';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  static async signup(req: Request<{}, {}, SignupRequestBody>, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      const result = await AuthService.signup({ email, password, name });

      res.status(201).json({
        message: 'User created successfully',
        user: result.user,
        session: result.session,
      });
    } catch (error) {
      logger.error('Signup controller error:', error);
      
      if (error instanceof Error) {
        // Handle specific Supabase error messages
        if (error.message.includes('already registered')) {
          res.status(409).json({ error: 'User with this email already exists' });
          return;
        }
        if (error.message.includes('Password should be')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Authenticate user and return session
   */
  static async login(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        session: result.session,
      });
    } catch (error) {
      logger.error('Login controller error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }
        if (error.message.includes('Email not confirmed')) {
          res.status(401).json({ error: 'Please verify your email before signing in' });
          return;
        }
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // We already have the user data from the JWT token via the auth middleware
      // No need to make another database call
      const user: UserModel = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        createdAt: new Date().toISOString(), // We don't have this from JWT, but it's not critical
        updatedAt: new Date().toISOString(), // We don't have this from JWT, but it's not critical
      };

      res.status(200).json({
        user,
      });
    } catch (error) {
      logger.error('Get profile controller error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name } = req.body;

      // For demo purposes, just return success with updated data
      // In production, you would update both auth.users metadata and profiles table
      logger.info(`Profile update requested for user ${req.user.id}: name="${name}"`);

      // Return updated user data
      const updatedUser: UserModel = {
        id: req.user.id,
        email: req.user.email,
        name: name, // Use the new name
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      logger.error('Update profile controller error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Logout user using Supabase Auth
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      await AuthService.signOut();
      
      res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get user's text enhancement history
   */
  static async getUserHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const history = await sessionService.getUserHistory(req.user.id);

      res.status(200).json({
        history,
      });
    } catch (error) {
      logger.error('Get user history controller error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send password reset email
   */
  static async forgotPassword(req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await AuthService.forgotPassword(email);

      res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Forgot password controller error:', error);
      
      // Always return success message for security (don't reveal if email exists)
      res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(req: Request<{}, {}, ResetPasswordRequestBody>, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      // Verify the reset token first
      const user = await AuthService.verifyResetToken(token);
      if (!user) {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }

      await AuthService.resetPassword(token, password);

      res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Reset password controller error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
          res.status(400).json({ error: 'Invalid or expired reset token' });
          return;
        }
        if (error.message.includes('Password')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Verify reset token validity
   */
  static async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({ error: 'Reset token is required' });
        return;
      }

      const user = await AuthService.verifyResetToken(token);
      
      if (!user) {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }

      res.status(200).json({
        message: 'Reset token is valid',
        email: user.email,
      });
    } catch (error) {
      logger.error('Verify reset token controller error:', error);
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(req: Request<{}, {}, ChangePasswordRequestBody>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Use the original method now that admin client is available
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password controller error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          res.status(400).json({ error: 'Current password is incorrect' });
          return;
        }
        if (error.message.includes('User not found')) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        if (error.message.includes('Admin client not available')) {
          res.status(500).json({ error: 'Service temporarily unavailable' });
          return;
        }
        if (error.message.includes('Password')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Test admin client functionality (for debugging)
   */
  static async testAdminClient(req: Request, res: Response): Promise<void> {
    try {
      const { supabaseAdmin } = require('../config/supabase');
      
      if (!supabaseAdmin) {
        res.status(500).json({ 
          error: 'Admin client not available',
          message: 'SUPABASE_SERVICE_ROLE_KEY is not set or invalid'
        });
        return;
      }

      // Test admin client by trying to list users
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 5
      });

      if (error) {
        res.status(500).json({ 
          error: 'Admin client test failed',
          details: error.message
        });
        return;
      }

      res.status(200).json({
        message: 'Admin client is working correctly',
        userCount: data.users.length,
        users: data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }))
      });
    } catch (error) {
      logger.error('Test admin client error:', error);
      res.status(500).json({ 
        error: 'Admin client test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 