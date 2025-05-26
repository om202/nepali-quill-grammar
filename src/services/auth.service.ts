import { supabase, supabaseAdmin } from '../config/supabase';
import { UserModel, ProfileModel } from '../types/database.types';
import { logger } from '../utils/logger';

export interface AuthResponse {
  user: UserModel;
  session: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name?: string;
}

export class AuthService {
  /**
   * Register a new user using Supabase Auth
   */
  static async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const { email, password, name } = credentials;

      // Use Supabase's built-in signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
        },
      });

      if (error) {
        logger.error('Supabase signup error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // The profile will be created automatically by the database trigger
      // No need to manually create it here

      const userModel: UserModel = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };

      return {
        user: userModel,
        session: data.session,
      };
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Authenticate a user using Supabase Auth
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Use Supabase's built-in login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Supabase login error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      const userModel: UserModel = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };

      return {
        user: userModel,
        session: data.session,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID from Supabase Auth
   */
  static async getUserById(userId: string): Promise<UserModel | null> {
    try {
      if (!supabaseAdmin) {
        logger.error('Admin client not available. Cannot get user by ID.');
        return null;
      }

      // Use the admin client to get user data
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error || !data.user) {
        logger.error('Error getting user by ID:', error);
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };
    } catch (error) {
      logger.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: { name?: string }): Promise<UserModel> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Admin client not available. Cannot update user profile.');
      }

      // Update user metadata in Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { name: updates.name },
      });

      if (error) {
        logger.error('Error updating user metadata:', error);
        throw new Error('Failed to update profile');
      }

      // Update or create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: updates.name,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        logger.error('Error updating profile table:', profileError);
        // Don't throw here as the main update succeeded
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get user from session token
   */
  static async getUserFromToken(token: string): Promise<UserModel | null> {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };
    } catch (error) {
      logger.error('Get user from token error:', error);
      return null;
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Sign out error:', error);
        throw new Error('Failed to sign out');
      }
    } catch (error) {
      logger.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
      });

      if (error) {
        logger.error('Forgot password error:', error);
        throw new Error(error.message);
      }

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.error('Reset password error:', error);
        throw new Error(error.message);
      }

      logger.info('Password reset successfully');
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // First verify the current password by attempting to sign in
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        logger.error('Current password verification failed:', signInError);
        throw new Error('Current password is incorrect');
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.error('Change password error:', error);
        throw new Error(error.message);
      }

      logger.info(`Password changed successfully for user ${userId}`);
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Verify reset token and get user
   */
  static async verifyResetToken(token: string): Promise<UserModel | null> {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        logger.error('Invalid reset token:', error);
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };
    } catch (error) {
      logger.error('Verify reset token error:', error);
      return null;
    }
  }
} 