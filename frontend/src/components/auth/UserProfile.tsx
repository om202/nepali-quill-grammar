'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { LogOut, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { RootState, AppDispatch } from '@/store';
import { logoutAsync } from '@/store/authSlice';
import { clearSuggestions } from '@/store/suggestionsSlice';
import { setText } from '@/store/textSlice';

import { ChangePasswordModal } from './ChangePasswordModal';

export function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();
  const { user } = useSelector((state: RootState) => state.auth);
  const suggestions = useSelector((state: RootState) => state.suggestions.items);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLogoutWithSuggestionsDialog, setShowLogoutWithSuggestionsDialog] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear suggestions and text when logging out
      dispatch(clearSuggestions());
      dispatch(setText(''));
      await dispatch(logoutAsync()).unwrap();
      toast.success(t.loggedOutSuccessfully);
    } catch {
      toast.error(t.failedToLogout);
    }
  };

  const handleLogoutClick = () => {
    // Check if there are active suggestions
    if (suggestions.length > 0) {
      setShowLogoutWithSuggestionsDialog(true);
    } else {
      setShowLogoutDialog(true);
    }
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const confirmLogoutWithSuggestions = () => {
    setShowLogoutWithSuggestionsDialog(false);
    handleLogout();
  };

  if (!user) {
    return null;
  }

  const firstName = user.name.split(' ')[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative h-10 w-10 rounded-full hover:bg-indigo-50 transition-all duration-200 hover:scale-105 active:scale-95'
        >
          <Avatar className='h-10 w-10 border-2 border-indigo-200 transition-colors duration-200'>
            <AvatarFallback className='font-bold text-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white'>
              {firstName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-64 p-2 bg-white shadow-xl border border-gray-200'
        align='end'
        forceMount
      >
        <div className='flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg mb-2 border border-indigo-100'>
          <div className='flex-1 min-w-0'>
            <p className='font-semibold text-gray-900 truncate'>
              {firstName}
            </p>
            <p className='text-sm text-gray-600 truncate'>
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleChangePasswordClick}
          className='flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-50 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
        >
          <Lock className='h-4 w-4' />
          <span className='font-medium'>{t.changePassword}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className='flex items-center space-x-2 p-3 rounded-lg hover:bg-red-50 cursor-pointer text-red-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
        >
          <LogOut className='h-4 w-4' />
          <span className='font-medium'>{t.signOut}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{t.confirmSignOut}</DialogTitle>
            <DialogDescription>
              {t.signOutDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={confirmLogout}
              className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
            >
              {t.signOut}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLogoutWithSuggestionsDialog} onOpenChange={setShowLogoutWithSuggestionsDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{t.signOutWithSuggestions}</DialogTitle>
            <DialogDescription>
              {t.signOutWithSuggestionsDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutWithSuggestionsDialog(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={confirmLogoutWithSuggestions}
              className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
            >
              {t.signOut}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </DropdownMenu>
  );
}
