'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
import { changePassword } from '@/lib/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error(t.pleaseFillAllFields);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t.newPasswordsDontMatch);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error(t.newPasswordMinLength);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      toast.error(t.passwordComplexityError);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error(t.newPasswordMustBeDifferent);
      return;
    }

    setIsLoading(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      setIsSuccess(true);
      toast.success(t.passwordChangedSuccessfully);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.failedToChangePassword);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setIsSuccess(false);
    onClose();
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[480px] p-0 overflow-hidden bg-white'>
        <div className='bg-gradient-to-br from-blue-50 to-purple-50 p-6'>
          <DialogHeader className='text-center'>
            <DialogTitle className='text-xl font-semibold text-gray-900'>
              {isSuccess ? t.passwordChanged : t.changePassword}
            </DialogTitle>
            <p className='text-gray-600 mt-2'>
              {isSuccess
                ? t.passwordUpdatedSuccessfully
                : t.updatePasswordSecurity}
            </p>
          </DialogHeader>
        </div>

        <div className='p-6 bg-white'>
          {isSuccess ? (
            <div className='text-center space-y-4'>
              <div className='flex justify-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-8 h-8 text-green-600' />
                </div>
              </div>
              
              <div className='space-y-2'>
                <h3 className='font-semibold text-gray-900'>{t.passwordUpdated}</h3>
                <p className='text-sm text-gray-600'>
                  {t.passwordChangedSuccessMessage}
                </p>
              </div>

              <Button
                onClick={handleClose}
                className='w-full grammarly-button-primary'
              >
                {t.done}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='current-password'
                  className='text-sm font-semibold text-gray-700'
                >
                  {t.currentPassword}
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='current-password'
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder={t.enterCurrentPassword}
                    value={formData.currentPassword}
                    onChange={e =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    disabled={isLoading}
                    className='grammarly-input-with-icon pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => togglePasswordVisibility('current')}
                    className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
                  >
                    {showPasswords.current ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='new-password'
                  className='text-sm font-semibold text-gray-700'
                >
                  {t.newPassword}
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='new-password'
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder={t.enterNewPassword}
                    value={formData.newPassword}
                    onChange={e =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    disabled={isLoading}
                    className='grammarly-input-with-icon pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => togglePasswordVisibility('new')}
                    className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
                  >
                    {showPasswords.new ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                <p className='text-xs text-gray-500'>
                  {t.passwordRequirements}
                </p>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='confirm-password'
                  className='text-sm font-semibold text-gray-700'
                >
                  {t.confirmNewPassword}
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='confirm-password'
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder={t.confirmNewPasswordPlaceholder}
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

              <div className='space-y-3 pt-2'>
                <Button
                  type='submit'
                  className='grammarly-button-primary w-full'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t.changingPassword}
                    </>
                  ) : (
                    t.changePassword
                  )}
                </Button>

                <Button
                  type='button'
                  onClick={handleClose}
                  variant='outline'
                  className='w-full'
                  disabled={isLoading}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 