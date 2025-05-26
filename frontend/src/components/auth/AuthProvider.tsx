'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '@/store';
import { checkAuthStatus } from '@/store/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check if user is authenticated on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
}
