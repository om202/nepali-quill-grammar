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
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t.pleaseEnterEmailAddress);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t.pleaseEnterValidEmail);
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
      toast.success(t.passwordResetLinkSent);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || t.failedToSendResetEmail);
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
              {isEmailSent ? t.checkYourEmail : t.resetYourPassword}
            </DialogTitle>
            <p className='text-gray-600 mt-2'>
              {isEmailSent
                ? t.resetLinkSentMessage
                : t.resetPasswordInstructions}
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
                <h3 className='font-semibold text-gray-900'>{t.checkYourEmail}</h3>
                <p className='text-sm text-gray-600'>
                  {t.resetEmailSentMessage}
                </p>
              </div>

              <div className='space-y-3 pt-4'>
                <Button
                  onClick={handleBackToLogin}
                  className='w-full grammarly-button-primary'
                >
                  {t.backToLogin}
                </Button>
                
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  variant='outline'
                  className='w-full'
                >
                  {t.sendAnotherEmail}
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
                  {t.emailAddress}
                </Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='reset-email'
                    type='email'
                    placeholder={t.enterEmailAddress}
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
                      {t.sendingResetLink}
                    </>
                  ) : (
                    t.sendResetLink
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
                  {t.backToLogin}
                </Button>
              </div>
            </form>
          )}

          <p className='text-xs text-gray-500 text-center mt-6'>
            {t.rememberPassword}{' '}
            <button
              onClick={handleBackToLogin}
              className='text-indigo-600 hover:text-indigo-500 font-medium'
            >
              {t.signInHere}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 