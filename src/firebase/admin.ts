import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

let app: App;

export function initFirebaseAdminApp() {
    if (getApps().length > 0) {
        app = getApps()[0];
    } else {
        app = initializeApp();
    }
}

initFirebaseAdminApp();

export const firestore = getFirestore(app);
export const adminAuth = admin.auth(app);
