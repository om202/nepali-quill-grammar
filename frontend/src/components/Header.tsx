'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/components/auth/UserProfile';
import { RootState } from '@/store';

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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">NepaliQuill</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name}
                </span>
                <UserProfile />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={handleOpenLogin}>
                  Login
                </Button>
                <Button onClick={handleOpenSignup}>
                  Sign Up
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