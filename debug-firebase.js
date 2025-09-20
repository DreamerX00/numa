// Debug script to test Firebase configuration
const { getFirebaseClient } = require('./src/lib/firebase/client');

try {
  console.log('Testing Firebase client configuration...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Missing');
  
  // Test Firebase initialization
  const { app, auth, googleProvider } = getFirebaseClient();
  console.log('Firebase client initialized successfully');
  console.log('App name:', app.name);
  console.log('Auth:', !!auth);
  console.log('Google Provider:', !!googleProvider);
  
} catch (error) {
  console.error('Firebase configuration error:', error);
}