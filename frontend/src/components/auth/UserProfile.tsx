'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RootState, AppDispatch } from '@/store';
import { logoutAsync, updateProfileAsync, clearError } from '@/store/authSlice';
import { toast } from 'sonner';
import { User, Settings, LogOut, Loader2, Edit3, Calendar, Mail } from 'lucide-react';

export function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
  });

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await dispatch(updateProfileAsync({
        name: editForm.name,
      })).unwrap();
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleEditCancel = () => {
    setEditForm({ name: user?.name || '' });
    setIsEditing(false);
    dispatch(clearError());
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50 transition-colors">
            <Avatar className="h-10 w-10 border-2 border-blue-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Preferences</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-red-50 cursor-pointer text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <DialogHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Profile Settings
              </DialogTitle>
              <p className="text-gray-600">
                Manage your account information and preferences
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                    </div>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm font-semibold text-gray-700">Member Since</Label>
                    </div>
                    <p className="text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="grammarly-button-primary w-full"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={isLoading}
                      className="grammarly-input"
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed for security reasons
                    </p>
                  </div>
                </div>
                
                {error && (
                  <div className="grammarly-status-error">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="grammarly-button-primary flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleEditCancel}
                    disabled={isLoading}
                    className="grammarly-button-secondary flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 