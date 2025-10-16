'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession, getAnonymousUser, getFirebaseAuth } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';
import { firestore } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function getUserRole(uid: string): Promise<UserRole> {
  const adminDoc = await firestore.collection('roles_admin').doc(uid).get();
  if (adminDoc.exists) return 'admin';
  const employeeDoc = await firestore.collection('roles_employee').doc(uid).get();
  if (employeeDoc.exists) return 'employee';
  return 'customer';
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  try {
    const { user } = await getAnonymousUser();
    if (!user) throw new Error("Could not get anonymous user");

    await getFirebaseAuth().updateUser(user.uid, { email, password });
    const role = await getUserRole(user.uid);
    await createSession(user.uid, role);
    
    switch (role) {
      case 'admin':
        redirect('/admin');
      case 'employee':
        redirect('/scanner');
      case 'customer':
        redirect('/dashboard');
      default:
        redirect('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
    redirect('/?error=Invalid credentials');
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

    try {
        const { user } = await getAnonymousUser();
        if (!user) throw new Error("Could not get anonymous user");

        await getFirebaseAuth().updateUser(user.uid, {
            displayName: name,
            email,
            password
        });
        
        const newUser: Omit<User, 'id'> = {
            name,
            email,
            role: 'customer',
            points: 0,
            rewards: [],
            registrationDate: FieldValue.serverTimestamp(),
        };

        await firestore.collection('users').doc(user.uid).set(newUser);
        
        await createSession(user.uid, 'customer');
        redirect('/dashboard');
    } catch(e) {
        console.error(e);
        redirect('/register?error=User could not be created');
    }
}
