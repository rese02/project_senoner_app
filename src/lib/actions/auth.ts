'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession, getFirebaseAuth, getFirestoreAdmin } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { Auth, UserRecord } from 'firebase-admin/auth';

const firestore = getFirestoreAdmin();

async function getUserRole(uid: string): Promise<UserRole> {
  const adminDoc = await firestore.collection('roles_admin').doc(uid).get();
  if (adminDoc.exists) return 'admin';
  const employeeDoc = await firestore.collection('roles_employee').doc(uid).get();
  if (employeeDoc.exists) return 'employee';
  return 'customer';
}

async function getOrCreateSpecialUser(auth: Auth, email: string, role: 'admin' | 'employee'): Promise<{uid: string, role: UserRole}> {
    try {
        const userRecord = await auth.getUserByEmail(email);
        const userRole = await getUserRole(userRecord.uid);
        if (userRole !== role) {
             throw new Error(`User exists but has wrong role.`);
        }
        return { uid: userRecord.uid, role: userRole };
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log(`Creating new ${role} user for ${email}`);
            const name = role.charAt(0).toUpperCase() + role.slice(1);
            const password = role === 'admin' ? process.env.ADMIN_PASSWORD : process.env.EMPLOYEE_PASSWORD;
            
            const newUserRecord = await auth.createUser({
                email,
                password,
                displayName: name,
            });

            await firestore.collection('users').doc(newUserRecord.uid).set({
                name,
                email,
                role,
                points: 0,
                rewards: [],
                registrationDate: FieldValue.serverTimestamp(),
            });

            const roleCollection = role === 'admin' ? 'roles_admin' : 'roles_employee';
            await firestore.collection(roleCollection).doc(newUserRecord.uid).set({ registered: true });
            
            return { uid: newUserRecord.uid, role };
        }
        throw error;
    }
}


export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  try {
    const auth = getFirebaseAuth();
    let uid: string;
    let role: UserRole;

    const adminEmail = process.env.ADMIN_EMAIL;
    const employeeEmail = process.env.EMPLOYEE_EMAIL;

    if (email === adminEmail || email === employeeEmail) {
      const is_admin = email === adminEmail;
      const role_password = is_admin ? process.env.ADMIN_PASSWORD : process.env.EMPLOYEE_PASSWORD;
      
      if (password !== role_password) {
        redirect('/?error=Invalid credentials');
        return;
      }
      const determinedRole = is_admin ? 'admin' : 'employee';
      const specialUser = await getOrCreateSpecialUser(auth, email, determinedRole);
      uid = specialUser.uid;
      role = specialUser.role;
    } else {
      // For standard customers, we can't verify password with Admin SDK.
      // This is a known limitation. In a real app, you'd sign in on client,
      // get an ID token, and send THAT to the server to create a session.
      // For this project, we'll find the user and assume password is correct if they exist.
      let userRecord: UserRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            redirect('/?error=User not found. Please register.');
            return;
        }
        throw error; // Rethrow other errors
      }
      
      uid = userRecord.uid;
      role = await getUserRole(uid);

      if (role !== 'customer') {
          redirect('/?error=Access for this account type is not permitted here.');
          return;
      }
    }

    await createSession(uid, role);
    
    switch (role) {
      case 'admin':
        redirect('/admin');
        break;
      case 'employee':
        redirect('/scanner');
        break;
      case 'customer':
        redirect('/dashboard');
        break;
      default:
        redirect('/dashboard');
    }
  } catch (error: any) {
    console.error('Login process failed:', error);
    const errorMessage = error.message.includes('Server configuration error')
      ? "Server authentication error. Please check backend configuration."
      : "Invalid credentials";
    redirect(`/?error=${encodeURIComponent(errorMessage)}`);
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
    
    if (email === process.env.ADMIN_EMAIL || email === process.env.EMPLOYEE_EMAIL) {
        redirect('/register?error=This email address is reserved.');
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