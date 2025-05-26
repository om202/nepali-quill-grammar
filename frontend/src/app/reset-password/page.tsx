'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Invalid or expired reset link');
          setIsVerifying(false);
          return;
        }

        if (session && session.user) {
          setIsValidSession(true);
          setUserEmail(session.user.email || '');
        } else {
          setError('No valid session found. Please request a new password reset link.');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Failed to verify reset link');
      } finally {
        setIsVerifying(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast.success('Password reset successfully');
      
      // Sign out the user after successful password reset
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleGoToLogin = () => {
    router.push('/');
  };

  if (isVerifying) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Verifying Reset Link</h2>
          <p className='text-gray-600'>Please wait while we verify your password reset link...</p>
        </div>
      </div>
    );
  }

  if (error || !isValidSession) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertCircle className='w-8 h-8 text-red-600' />
          </div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Invalid Reset Link</h2>
          <p className='text-gray-600 mb-6'>
            {error || 'This password reset link is invalid or has expired. Please request a new one.'}
          </p>
          <Link href='/'>
            <Button className='grammarly-button-primary w-full'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Password Reset Successful</h2>
          <p className='text-gray-600 mb-6'>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Button onClick={handleGoToLogin} className='grammarly-button-primary w-full'>
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 w-full max-w-md'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>Reset Your Password</h2>
          <p className='text-gray-600'>
            Enter a new password for <strong>{userEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label
              htmlFor='password'
              className='text-sm font-semibold text-gray-700'
            >
              New Password
            </Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                id='password'
                type={showPasswords.password ? 'text' : 'password'}
                placeholder='Enter your new password'
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isLoading}
                className='grammarly-input-with-icon pr-10'
                autoFocus
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('password')}
                className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
              >
                {showPasswords.password ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            <p className='text-xs text-gray-500'>
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='confirm-password'
              className='text-sm font-semibold text-gray-700'
            >
              Confirm New Password
            </Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                id='confirm-password'
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder='Confirm your new password'
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                disabled={isLoading}
                className='grammarly-input-with-icon pr-10'
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('confirm')}
                className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
              >
                {showPasswords.confirm ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          <div className='space-y-3 pt-4'>
            <Button
              type='submit'
              className='grammarly-button-primary w-full'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <Link href='/'>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                disabled={isLoading}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Home
              </Button>
            </Link>
          </div>
        </form>

        <p className='text-xs text-gray-500 text-center mt-6'>
          Remember your password?{' '}
          <Link href='/' className='text-indigo-600 hover:text-indigo-500 font-medium'>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
} 