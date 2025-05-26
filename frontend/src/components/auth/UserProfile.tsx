'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { LogOut, User } from 'lucide-react';

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
import { RootState, AppDispatch } from '@/store';
import { logoutAsync } from '@/store/authSlice';

export function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
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
          className='relative h-10 w-10 rounded-full hover:bg-blue-50 transition-smooth hover:scale-105 active:scale-95'
        >
          <Avatar className='h-10 w-10 border-2 border-blue-200 transition-colors-smooth'>
            <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-colors-smooth'>
              <User className='h-5 w-5 transition-transform-smooth' />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-64 p-2 transition-opacity-smooth bg-white'
        align='end'
        forceMount
      >
        <div className='flex bg-white items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2 transition-colors-smooth'>
          <div className='flex-1 min-w-0'>
            <p className='font-semibold text-gray-900 truncate transition-colors-smooth'>
              {firstName}
            </p>
            <p className='text-sm text-gray-600 truncate transition-colors-smooth'>
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className='flex items-center space-x-2 p-3 rounded-lg hover:bg-red-50 cursor-pointer text-red-600 transition-smooth hover:scale-[1.02] active:scale-[0.98]'
        >
          <LogOut className='h-4 w-4 transition-transform-smooth' />
          <span className='font-medium'>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Sign Out</DialogTitle>
            <DialogDescription>
                You’ll need to log back in to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className='bg-blue-50'
              variant="outline"
              onClick={confirmLogout}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
