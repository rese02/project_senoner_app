import { initializeApp, getApps, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'server-only';

let app: App;

export function initFirebaseAdminApp() {
    if (getApps().length > 0) {
        app = getApps()[0];
    } else {
        app = initializeApp({
            credential: applicationDefault(),
        });
    }
}

initFirebaseAdminApp();

export const firestore = getFirestore(app);
export const adminAuth = getAuth(app);
