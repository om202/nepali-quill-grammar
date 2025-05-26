import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { SignupRequestBody, LoginRequestBody } from '../schemas/auth.schema';
import { UserModel } from '../types/database.types';
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

      const updatedUser = await AuthService.updateProfile(req.user.id, { name });

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
} 