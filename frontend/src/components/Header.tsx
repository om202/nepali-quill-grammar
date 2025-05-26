'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/components/auth/UserProfile';
import { RootState } from '@/store';
import { Sparkles, PenTool, LogIn } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const handleOpenLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="grammarly-header">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <PenTool className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold grammarly-gradient-text">
                  NepaliQuill
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  AI-powered Nepali text enhancement
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">
                    {user.name}
                  </span>
                </div>
                <UserProfile />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={handleOpenLogin}
                  className="font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-6 py-2.5 transition-all duration-200 border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log in
                </Button>
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