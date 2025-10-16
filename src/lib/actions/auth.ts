'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession, getFirebaseAuth } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';
import { firestore } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';

async function getUserRole(uid: string): Promise<UserRole> {
  const adminDoc = await firestore.collection('roles_admin').doc(uid).get();
  if (adminDoc.exists) return 'admin';
  const employeeDoc = await firestore.collection('roles_employee').doc(uid).get();
  if (employeeDoc.exists) return 'employee';
  return 'customer';
}

async function getOrCreateUser(auth: Auth, email: string, password: string): Promise<{uid: string, role: UserRole}> {
  try {
    // Try to get the user by email
    const userRecord = await auth.getUserByEmail(email);
    const role = await getUserRole(userRecord.uid);
    return { uid: userRecord.uid, role };
  } catch (error: any) {
    // If user does not exist, create them
    if (error.code === 'auth/user-not-found') {
      console.log(`User with email ${email} not found. Creating new user.`);
      
      let role: UserRole = 'customer';
      if (email.startsWith('admin@')) {
        role = 'admin';
      } else if (email.startsWith('employee@')) {
        role = 'employee';
      }

      const name = role.charAt(0).toUpperCase() + role.slice(1); // e.g., "Admin"

      // Create user in Firebase Auth
      const newUserRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Create corresponding user profile in Firestore
      const newUserProfile: Omit<User, 'id'> = {
        name,
        email,
        role,
        points: 0,
        rewards: [],
        registrationDate: FieldValue.serverTimestamp(),
      };
      await firestore.collection('users').doc(newUserRecord.uid).set(newUserProfile);

      // Create role document in Firestore for admins/employees
      if (role === 'admin') {
        await firestore.collection('roles_admin').doc(newUserRecord.uid).set({ registered: true });
      } else if (role === 'employee') {
        await firestore.collection('roles_employee').doc(newUserRecord.uid).set({ registered: true });
      }
      
      console.log(`Successfully created new user with UID: ${newUserRecord.uid} and role: ${role}`);
      return { uid: newUserRecord.uid, role };
    }
    // Re-throw other errors
    throw error;
  }
}


export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  try {
    const auth = getFirebaseAuth();
    const { uid, role } = await getOrCreateUser(auth, email, password);

    await createSession(uid, role);
    
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
  } catch (error: any) {
    console.error('Login process failed:', error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        redirect('/?error=Invalid credentials');
    }
    redirect(`/?error=${error.message || 'An unknown error occurred'}`);
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
        const userRecord = await getFirebaseAuth().createUser({
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

        await firestore.collection('users').doc(userRecord.uid).set(newUser);
        
        await createSession(userRecord.uid, 'customer');
        redirect('/dashboard');
    } catch(e: any) {
        console.error(e);
        let errorMessage = 'User could not be created';
        if (e.code === 'auth/email-already-exists') {
            errorMessage = 'An account with this email already exists.';
        }
        redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
    }
}
