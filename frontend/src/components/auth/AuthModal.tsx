'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Sparkles, PenTool } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { RootState, AppDispatch } from '@/store';
import { signupAsync, loginAsync, clearError } from '@/store/authSlice';

import { ForgotPasswordModal } from './ForgotPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
}: AuthModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      toast.error(t.pleaseFillAllFields);
      return;
    }

    try {
      await dispatch(
        loginAsync({
          email: loginForm.email,
          password: loginForm.password,
        })
      ).unwrap();

      toast.success(t.welcome + '!');
      onClose();
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast.error(t.pleaseFillAllFields);
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error(t.passwordsDoNotMatch);
      return;
    }

    if (signupForm.password.length < 8) {
      toast.error(t.passwordMinLength);
      return;
    }

    try {
      await dispatch(
        signupAsync({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        })
      ).unwrap();

      toast.success(t.accountCreatedSuccessfully);
      onClose();
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    setShowForgotPassword(false);
    onClose();
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[480px] p-0 overflow-hidden bg-white'>
        <div className='bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6'>
          <DialogHeader className='text-center'>
            <div className='flex items-center justify-center space-x-2 mb-2'>
              <div className='relative text-indigo-600'>
                <PenTool className='h-7 w-7' />
                <Sparkles className='h-3 w-3 absolute -top-1 -right-1 text-purple-500' />
              </div>
              <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                {t.appName}
              </DialogTitle>
            </div>
            {activeTab === 'signup' && (
              <p className='text-gray-600 text-center text-[14px]'>
                {t.joinThousands}
              </p>
            )}
          </DialogHeader>
        </div>

        <div className='p-6 bg-white'>
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'login' | 'signup')}
          >
            <TabsList className='grid w-full grid-cols-2 mb-8 p-2 rounded-lg gap-2'>
              <TabsTrigger
                value='login'
                className='rounded-lg font-medium px-6 py-3 border border-gray-200 data-[state=active]:bg-indigo-50 data-[state=active]:border-indigo-200 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600'
              >
                {t.login}
              </TabsTrigger>
              <TabsTrigger
                value='signup'
                className='rounded-lg font-medium px-6 py-3 border border-gray-200 data-[state=active]:bg-indigo-50 data-[state=active]:border-indigo-200 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600'
              >
                {t.signup}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='login' className='space-y-4'>
              <form onSubmit={handleLogin} className='space-y-4'>
                <div className='space-y-3'>
                  <Label
                    htmlFor='login-email'
                    className='text-sm font-medium text-gray-700'
                  >
                    {t.emailAddress}
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-4 h-4 w-4 text-gray-400' />
                    <Input
                      id='login-email'
                      type='email'
                      placeholder={t.enterEmail}
                      value={loginForm.email}
                      onChange={e =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      disabled={isLoading}
                      className='pl-12 pr-4 py-4 h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>
                <div className='space-y-3'>
                  <Label
                    htmlFor='login-password'
                    className='text-sm font-medium text-gray-700'
                  >
                    {t.password}
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-4 h-4 w-4 text-gray-400' />
                    <Input
                      id='login-password'
                      type='password'
                      placeholder={t.enterPassword}
                      value={loginForm.password}
                      onChange={e =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      disabled={isLoading}
                      className='pl-12 pr-4 py-4 h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>
                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-sm font-medium text-red-800'>{error}</p>
                  </div>
                )}
                
                <div className='flex items-center justify-between'>
                  <div></div>
                  <button
                    type='button'
                    onClick={handleForgotPassword}
                    className='text-sm text-indigo-600 hover:text-indigo-500 font-medium'
                    disabled={isLoading}
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                
                <Button
                  type='submit'
                  className='w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t.signingIn}
                    </>
                  ) : (
                    t.signInToApp
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='signup' className='space-y-5'>
              <form onSubmit={handleSignup} className='space-y-5'>
                <div className='space-y-3'>
                  <Label
                    htmlFor='signup-name'
                    className='text-sm font-medium text-gray-700'
                  >
                    {t.fullName}
                  </Label>
                  <div className='relative'>
                    <User className='absolute left-4 top-4 h-4 w-4 text-gray-400' />
                    <Input
                      id='signup-name'
                      type='text'
                      placeholder={t.enterFullName}
                      value={signupForm.name}
                      onChange={e =>
                        setSignupForm({ ...signupForm, name: e.target.value })
                      }
                      disabled={isLoading}
                      className='pl-12 pr-4 py-4 h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>
                <div className='space-y-3'>
                  <Label
                    htmlFor='signup-email'
                    className='text-sm font-medium text-gray-700'
                  >
                    {t.emailAddress}
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-4 h-4 w-4 text-gray-400' />
                    <Input
                      id='signup-email'
                      type='email'
                      placeholder={t.enterEmail}
                      value={signupForm.email}
                      onChange={e =>
                        setSignupForm({ ...signupForm, email: e.target.value })
                      }
                      disabled={isLoading}
                      className='pl-12 pr-4 py-4 h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>
                <div className='space-y-3'>
                  <Label
                    htmlFor='signup-password'
                    className='text-sm font-medium text-gray-700'
                  >
                    {t.password}
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-4 h-4 w-4 text-gray-400' />
                    <Input
                      id='signup-password'
                      type='password'
                      placeholder={t.createPasswordPlaceholder}
                      value={signupForm.password}
                      onChange={e =>
                        setSignupForm({
                          ...signupForm,
                          password: e.target.value,
                        })
                      }
                      disabled={isLoading}
                      className='pl-12 pr-4 py-4 h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>
                <div className='space-y-3'>
                  <Label
                    htmlFor='signup-confirm-password'
                    className='text-sm font-medium text-gray-700'
                  >
                    {t.confirmPassword}
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-4 h-4 w-4 text-gray-400' />
                    <Input
                      id='signup-confirm-password'
                      type='password'
                      placeholder={t.confirmPasswordPlaceholder}
                      value={signupForm.confirmPassword}
                      onChange={e =>
                        setSignupForm({
                          ...signupForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      disabled={isLoading}
                      className='pl-12 pr-4 py-4 h-12 text-base border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    />
                  </div>
                </div>
                {error && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-sm font-medium text-red-800'>{error}</p>
                  </div>
                )}

                <Button
                  type='submit'
                  className='w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t.creatingAccount}
                    </>
                  ) : (
                    t.createFreeAccount
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className='text-xs text-gray-500 text-center mt-6'>
            {t.termsAndPrivacy}
          </p>
        </div>
      </DialogContent>
      
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={handleBackToLogin}
      />
    </Dialog>
  );
}
