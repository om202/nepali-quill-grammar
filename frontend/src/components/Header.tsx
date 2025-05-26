'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Sparkles, PenTool, LogIn } from 'lucide-react';

import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/components/auth/UserProfile';
import { RootState } from '@/store';

export function Header() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const handleOpenLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className='grammarly-header'>
        <div className='container mx-auto flex h-16 items-center justify-between px-6'>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-2 cursor-pointer'>
              <div className='relative'>
                <PenTool className='h-8 w-8 text-blue-600' />
                <Sparkles className='h-4 w-4 text-purple-500 absolute -top-1 -right-1' />
              </div>
              <h1 className='text-xl font-semibold grammarly-gradient-text'>
                Nepali Grammarly
              </h1>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            {isAuthenticated && user ? (
              <UserProfile />
            ) : (
              <div className='flex items-center space-x-3'>
                <button
                  onClick={handleOpenLogin}
                  className='font-semibold flex justify-center items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-sm px-6 py-2.5 transition-colors-smooth border border-gray-200 hover:border-blue-200'
                >
                  <LogIn className='h-4 w-4 mr-2' />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}
