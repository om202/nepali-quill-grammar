'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsEmailSent(false);
    onClose();
  };

  const handleBackToLogin = () => {
    setEmail('');
    setIsEmailSent(false);
    onBackToLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[480px] p-0 overflow-hidden bg-white'>
        <div className='bg-gradient-to-br from-blue-50 to-purple-50 p-6'>
          <DialogHeader className='text-center'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>
              {isEmailSent ? 'Check Your Email' : 'Reset Your Password'}
            </DialogTitle>
            <p className='text-gray-600 mt-2'>
              {isEmailSent
                ? 'We\'ve sent a password reset link to your email address'
                : 'Enter your email address and we\'ll send you a link to reset your password'}
            </p>
          </DialogHeader>
        </div>

        <div className='p-6 bg-white'>
          {isEmailSent ? (
            <div className='text-center space-y-4'>
              <div className='flex justify-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-8 h-8 text-green-600' />
                </div>
              </div>
              
              <div className='space-y-2'>
                <h3 className='font-semibold text-gray-900'>Check Your Email</h3>
                <p className='text-sm text-gray-600'>
                  If an account with that email exists, we&apos;ve sent you a password reset link.
                  Please check your email and follow the instructions to reset your password.
                </p>
              </div>

              <div className='space-y-3 pt-4'>
                <Button
                  onClick={handleBackToLogin}
                  className='w-full grammarly-button-primary'
                >
                  Back to Login
                </Button>
                
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  variant='outline'
                  className='w-full'
                >
                  Send Another Email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='reset-email'
                  className='text-sm font-semibold text-gray-700'
                >
                  Email address
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='reset-email'
                    type='email'
                    placeholder='Enter your email address'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                    className='grammarly-input-with-icon'
                    autoFocus
                  />
                </div>
              </div>

              <div className='space-y-3 pt-2'>
                <Button
                  type='submit'
                  className='grammarly-button-primary w-full'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Button
                  type='button'
                  onClick={handleBackToLogin}
                  variant='outline'
                  className='w-full'
                  disabled={isLoading}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Login
                </Button>
              </div>
            </form>
          )}

          <p className='text-xs text-gray-500 text-center mt-6'>
            Remember your password?{' '}
            <button
              onClick={handleBackToLogin}
              className='text-indigo-600 hover:text-indigo-500 font-medium'
            >
              Sign in here
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 