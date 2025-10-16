'use client';
import { UserRole } from './types';
import { redirect } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// Initialize Firebase on the client
const { auth } = initializeFirebase();

async function getSession(): Promise<{ userId: string; role: UserRole; user: User } | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const role = (tokenResult.claims.role as UserRole) || 'customer';
        resolve({
          userId: user.uid,
          role,
          user: {
            // This is a partial user object, fill as needed from auth or firestore
            id: user.uid,
            name: user.displayName || 'No Name',
            email: user.email || 'no-email@example.com',
            role: role,
            points: 0, // Points and rewards should be fetched from Firestore
            rewards: []
          },
        });
      } else {
        resolve(null);
      }
    }, () => {
      resolve(null); // Handle error case
    });
  });
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
