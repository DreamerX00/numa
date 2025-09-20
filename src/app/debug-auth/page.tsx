"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseClient } from "@/lib/firebase/client";
import { signInWithPopup } from "firebase/auth";

export default function GoogleAuthDebugPage() {
  const [status, setStatus] = useState<string>("Ready to test");
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, any> | null>(null);

  const testFirebaseConfig = () => {
    try {
      setStatus("Testing Firebase configuration...");
      const { app } = getFirebaseClient();
      
      const config = {
        projectId: app.options.projectId,
        authDomain: app.options.authDomain,
        apiKey: app.options.apiKey ? "Set" : "Missing",
        appId: app.options.appId ? "Set" : "Missing",
        storageBucket: app.options.storageBucket,
        messagingSenderId: app.options.messagingSenderId
      };
      
      // Validate configuration
      const missingFields = [];
      if (!app.options.projectId) missingFields.push("projectId");
      if (!app.options.authDomain) missingFields.push("authDomain");
      if (!app.options.apiKey) missingFields.push("apiKey");
      if (!app.options.appId) missingFields.push("appId");
      
      if (missingFields.length > 0) {
        setError(`Missing Firebase configuration: ${missingFields.join(", ")}`);
        setStatus("Firebase configuration incomplete");
      } else {
        setDetails(config);
        setStatus("Firebase configuration loaded successfully ✅");
        setError(null);
      }
    } catch (err) {
      setError(`Firebase config error: ${err}`);
      setStatus("Firebase configuration failed");
    }
  };

  const testGoogleSignIn = async () => {
    try {
      setStatus("Starting Google sign-in...");
      setError(null);
      
      const { auth, googleProvider } = getFirebaseClient();
      setStatus("Opening Google popup...");
      
      const result = await signInWithPopup(auth, googleProvider);
      setStatus("Google authentication successful");
      
      const user = result.user;
      setDetails({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: result.providerId
      });
      
      setStatus("Getting ID token...");
      const idToken = await user.getIdToken();
      
      setStatus("Calling login API...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Login API failed: ${response.status} - ${errorData}`);
      }
      
      const loginResult = await response.json();
      setStatus("✅ Google sign-in completed successfully!");
      setDetails((prev: Record<string, any> | null) => ({ ...prev, loginResult }));
      
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      
      let errorMessage = "Unknown error";
      let errorCode = "unknown";
      
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message?: string };
        errorCode = firebaseError.code;
        switch (firebaseError.code) {
          case "auth/popup-closed-by-user":
            errorMessage = "Popup was closed by user";
            break;
          case "auth/popup-blocked":
            errorMessage = "Popup was blocked by browser";
            break;
          case "auth/unauthorized-domain":
            errorMessage = "Domain not authorized in Firebase console";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Google sign-in not enabled in Firebase console";
            break;
          case "auth/account-exists-with-different-credential":
            errorMessage = "Account exists with different sign-in method";
            break;
          default:
            errorMessage = firebaseError.message || "Firebase authentication failed";
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorWithMessage = err as { message: string };
        errorMessage = errorWithMessage.message;
      }
      
      setError(`${errorCode}: ${errorMessage}`);
      setStatus("❌ Google sign-in failed");
      setDetails({ errorCode, fullError: err });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Google Authentication Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Status:</h3>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
          
          {error && (
            <div className="space-y-2">
              <h3 className="font-semibold text-red-600">Error:</h3>
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
            </div>
          )}
          
          {details && (
            <div className="space-y-2">
              <h3 className="font-semibold">Details:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testFirebaseConfig} variant="outline">
              Test Firebase Config
            </Button>
            <Button onClick={testGoogleSignIn}>
              Test Google Sign-In
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800">🔧 Quick Fixes for auth/internal-error:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li><strong>Enable Google Sign-In:</strong> Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a> → Authentication → Sign-in method → Enable Google</li>
              <li><strong>Add Authorized Domains:</strong> In Authentication → Settings → Authorized domains, add <code className="bg-white px-1 rounded">localhost</code></li>
              <li><strong>Configure OAuth Consent:</strong> Ensure OAuth consent screen is configured in Google Cloud Console</li>
              <li><strong>Check Project ID:</strong> Verify NEXT_PUBLIC_FIREBASE_PROJECT_ID matches your Firebase project</li>
            </ol>
          </div>
          
          <div className="mt-6 text-xs text-muted-foreground">
            <h4 className="font-semibold mb-2">Common Issues:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>auth/unauthorized-domain:</strong> Add localhost:3000 to Firebase Console → Authentication → Settings → Authorized domains</li>
              <li><strong>auth/popup-blocked:</strong> Allow popups in your browser</li>
              <li><strong>auth/operation-not-allowed:</strong> Enable Google sign-in in Firebase Console → Authentication → Sign-in method</li>
              <li><strong>Network errors:</strong> Check if you&apos;re behind a firewall or proxy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}