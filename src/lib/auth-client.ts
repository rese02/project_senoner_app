'use client';
import { UserRole } from './types';
import { redirect } from 'next/navigation';

async function getSessionRole() {
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
    return payload.role as UserRole;
  } catch (e) {
    return null;
  }
}

export async function protectPage(role: UserRole | UserRole[]): Promise<boolean> {
  const sessionRole = await getSessionRole();
  const roles = Array.isArray(role) ? role : [role];
  if (!sessionRole || !roles.includes(sessionRole)) {
    redirect('/');
    return false;
  }
  return true;
}
