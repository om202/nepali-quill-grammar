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
import { User, Settings, LogOut, Loader2 } from 'lucide-react';

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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="text-sm font-medium">{user.name}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isLoading} className="flex-1">
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
                      variant="outline" 
                      onClick={handleEditCancel}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
} 