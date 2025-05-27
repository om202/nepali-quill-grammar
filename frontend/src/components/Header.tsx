'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Sparkles, PenTool, UserPlus } from 'lucide-react';

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
      <header className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='container mx-auto flex h-16 items-center justify-between px-6'>
          <div className='flex items-center space-x-3'>
            <div className='text-indigo-600 flex items-center space-x-2 cursor-pointer'>
              <div className='relative'>
                <PenTool className='h-7 w-7' />
                <Sparkles className='h-3 w-3 absolute -top-1 -right-1 text-purple-500' />
              </div>
              <h1 className='text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                Vyakaranly
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
                  className='border border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 font-medium px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:shadow-sm'
                  style={{ 
                    border: '1px solid rgb(79 70 229)', 
                    color: 'rgb(79 70 229)' 
                  }}
                >
                  <UserPlus className='h-5 w-5 stroke-2' />
                  <span>Sign In</span>
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
