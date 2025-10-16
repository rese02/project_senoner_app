'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/auth';
import { users } from '@/lib/data';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // In a real app, you'd hash and compare the password
  const user = users.find((u) => u.email === email);

  if (!user || password !== 'password') {
    // Returning an error message is better UX, but for simplicity, we redirect.
    // In a real app, you would not want to reveal if the email exists.
    redirect('/?error=Invalid credentials');
    return;
  }

  await createSession(user.id, user.role);

  switch (user.role) {
    case 'admin':
      redirect('/admin');
    case 'employee':
      redirect('/scanner');
    case 'customer':
      redirect('/dashboard');
    default:
      redirect('/dashboard');
  }
}

export async function logout() {
  await deleteSession();
  redirect('/');
}

export async function register(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        redirect('/register?error=All fields are required');
        return;
    }

    if (users.find(u => u.email === email)) {
        redirect('/register?error=User already exists');
        return;
    }

    const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'customer' as const,
        points: 0,
        rewards: [],
    };

    users.push(newUser);

    await createSession(newUser.id, newUser.role);
    redirect('/dashboard');
}
