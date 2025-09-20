// Initialize Firebase Admin SDK (server-only)
import { cert, getApps, initializeApp, type App as AdminApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: AdminApp | undefined;

export function getFirebaseAdmin() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin env vars");
    }

    // Handle escaped newlines in hosted envs
    privateKey = privateKey.replace(/\\n/g, "\n");

    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return { adminApp: adminApp!, adminAuth: getAuth() };
}
