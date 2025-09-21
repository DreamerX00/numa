// Initialize Firebase Admin SDK (server-only)
import { cert, getApps, initializeApp, type App as AdminApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as path from "path";
import * as fs from "fs";

let adminApp: AdminApp | undefined;

export function getFirebaseAdmin() {
  if (!getApps().length) {
    // Method 1: Try service account JSON file first (for local development)
    const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
    
    if (fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
        // Firebase Admin initialized with service account file
        return { adminApp: adminApp!, adminAuth: getAuth() };
      } catch (error) {
        console.error("Error reading service account file:", error);
      }
    }

    // Method 2: Use environment variables (for production/hosted environments)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(`Missing Firebase Admin configuration. Please either:
1. Add a serviceAccountKey.json file to the project root, OR
2. Set the following environment variables:
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL  
   - FIREBASE_PRIVATE_KEY

Current values:
- FIREBASE_PROJECT_ID: ${projectId ? 'Set' : 'Missing'}
- FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Set' : 'Missing'}
- FIREBASE_PRIVATE_KEY: ${privateKey ? 'Set' : 'Missing'}`);
    }

    // Handle escaped newlines in hosted envs
    privateKey = privateKey.replace(/\\n/g, "\n");

    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    
    // Firebase Admin initialized with environment variables
  }
  return { adminApp: adminApp!, adminAuth: getAuth() };
}
