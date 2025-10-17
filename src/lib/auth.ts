'server-only';
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload, UserRole } from '@/lib/types';
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// --- Firebase Admin SDK Initialization ---

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    if (!adminApp) {
        adminApp = getApps()[0];
    }
    if (!adminAuth) {
        adminAuth = getAuth(adminApp);
    }
    return { adminApp, adminAuth };
  }

  try {
    const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('The SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKey);
    
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    adminAuth = getAuth(adminApp);
    
    console.log("Firebase Admin SDK initialized successfully.");
    return { adminApp, adminAuth };

  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
    throw new Error("Server configuration error. Could not initialize Firebase Admin SDK.");
  }
}

export function getFirebaseAuth() {
  if (!adminAuth) {
    initializeFirebaseAdmin();
  }
  return adminAuth as Auth;
}

export function getFirestoreAdmin() {
    if (!adminApp) {
        initializeFirebaseAdmin();
    }
    return getFirestore(adminApp as App);
}

// --- Session Management ---

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
    throw new Error('The SESSION_SECRET environment variable must be set and be at least 32 characters long.');
}
const key = new TextEncoder().encode(secret);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, role: UserRole) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ userId, role, expiresAt });
  
  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  try {
    const auth = getFirebaseAuth();
    await auth.setCustomUserClaims(userId, { role });
  } catch (error) {
    console.error("Error setting custom user claims:", error);
    throw new Error("Could not set user role for the session.");
  }
}

export async function verifySession() {
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  const userDoc = await getFirebaseAuth().getUser(session.userId);
  if (!userDoc) {
    return null;
  }
  const user = { ...userDoc, id: userDoc.uid, role: session.role };

  return { userId: session.userId, role: session.role as UserRole, user };
}

export async function deleteSession() {
  const sessionCookie = cookies().get('session')?.value;
  const session = await decrypt(sessionCookie);
  
  if (session?.userId) {
    try {
        await getFirebaseAuth().revokeRefreshTokens(session.userId);
    } catch(e) {
        console.error("Error revoking refresh tokens:", e);
    }
  }
  
  cookies().delete('session');
}

export async function protectPage(role: UserRole | UserRole[]) {
    const session = await verifySession();
    const roles = Array.isArray(role) ? role : [role];

    if (!session || !roles.includes(session.role)) {
        redirect('/');
    }
    return session;
}
