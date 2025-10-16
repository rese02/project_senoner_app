'use client';
import { User, UserRole } from './types';
import { redirect } from 'next/navigation';
import { users } from './data';

async function getSession() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='));
  if (!cookie) return null;

  const session = cookie.split('=')[1];
  try {
    const payload = JSON.parse(atob(session.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    const user = users.find(u => u.id === payload.userId);

    if (!user || user.role !== payload.role) {
        return null;
    }

    return { userId: payload.userId as string, role: payload.role as UserRole, user };

  } catch (e) {
    return null;
  }
}

export async function verifySession() {
    return await getSession();
}

export async function protectPage(role: UserRole | UserRole[]): Promise<boolean> {
  const session = await getSession();
  const roles = Array.isArray(role) ? role : [role];
  if (!session?.role || !roles.includes(session.role)) {
    redirect('/');
    return false;
  }
  return true;
}
