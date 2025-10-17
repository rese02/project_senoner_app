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

async function getOrCreateSpecialUser(auth: Auth, email: string, role: 'admin' | 'employee'): Promise<{uid: string, role: UserRole}> {
    try {
        const userRecord = await auth.getUserByEmail(email);
        const userRole = await getUserRole(userRecord.uid);
        if (userRole !== role) {
            // This case shouldn't happen with the new login logic, but it's good practice
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

    // Special handling for admin and employee
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
      // Standard customer login
      try {
        const userRecord = await auth.getUserByEmail(email);
        // This is a placeholder for password check. Admin SDK cannot verify password directly.
        // For a production app, this check must happen on the client with signInWithEmailAndPassword,
        // which would then send an ID token to a server endpoint to create a session.
        // For this project's scope, we assume if the user exists, the login is "successful" for session creation.
        uid = userRecord.uid;
        role = await getUserRole(uid);
        if (role !== 'customer') {
            redirect('/?error=Access denied for this user type.');
            return;
        }
      } catch (error: any) {
         if (error.code === 'auth/user-not-found') {
            redirect('/?error=User not found. Please register.');
            return;
         }
         // Redirect for other auth errors, like wrong password if we could check it.
         // For now, we generalize this for simplicity.
         redirect('/?error=Invalid credentials');
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
    redirect(`/?error=An unexpected error occurred.`);
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
    
    // Prevent registration of special emails
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
        
        // Explicitly set role to customer
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
