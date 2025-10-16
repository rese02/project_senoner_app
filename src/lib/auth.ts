import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload, UserRole } from '@/lib/types';
import { adminAuth, initFirebaseAdminApp } from '@/firebase/admin';

initFirebaseAdminApp();

export function getFirebaseAuth() {
  return adminAuth;
}

export function getAnonymousUser() {
    return getFirebaseAuth().createUser({});
}

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
