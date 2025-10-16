'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { register } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal } from 'lucide-react';
import React from 'react';

function RegisterButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Create Account
    </Button>
  );
}


export default function RegisterPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Logo className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
            <CardDescription>Join to start earning rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Registration Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <form action={register} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <RegisterButton />
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm">
              Already have an account?{' '}
              <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
