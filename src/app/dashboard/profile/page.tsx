'use client';

import { useFormState } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/lib/actions/users';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { verifySession } from '@/lib/auth-client';
import { users } from '@/lib/data';

const initialState = {
  message: '',
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(updateUserProfile, initialState);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getSession() {
        const session = await verifySession();
        if (session?.user) {
            setUser(session.user);
        }
    }
    getSession();
  }, []);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      if(user?.id) {
        const updatedUser = users.find(u => u.id === user.id);
        if (updatedUser) setUser(updatedUser);
      }
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast, user?.id]);

  if (!user) return null;

  return (
    <div className="flex justify-center">
      <form action={formAction} className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" placeholder="Leave blank to keep current password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90">Update Profile</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
