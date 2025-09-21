"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/client";
import { getFirebaseClient } from "@/lib/firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { 
  User,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  ShoppingCart,
  Check
} from "lucide-react";

interface AuthStepProps {
  onNext: () => void;
  onSkip?: () => void;
}

export function AuthStep({ onNext, onSkip }: AuthStepProps) {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, show their info and continue
  if (user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Welcome back, {user.displayName || user.email}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-900">You&apos;re signed in</p>
              <p className="text-sm text-green-700">{user.email}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Benefits of being signed in:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Order tracking and history</li>
              <li>• Faster checkout with saved addresses</li>
              <li>• Exclusive member offers</li>
              <li>• Easy returns and support</li>
            </ul>
          </div>

          <Button onClick={onNext} className="w-full" size="lg">
            Continue to Delivery Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don&apos;t match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { auth } = getFirebaseClient();
      
      if (isSignUp) {
        // Create new user
        const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        
        // Update profile with name
        await updateProfile(cred.user, {
          displayName: `${formData.firstName} ${formData.lastName}`.trim()
        });
        
        // Create server session
        const idToken = await cred.user.getIdToken();
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } else {
        // Sign in existing user
        const cred = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        
        // Create server session
        const idToken = await cred.user.getIdToken();
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }
      
      onNext();
    } catch (error: unknown) {
      console.error("Auth error:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">Checking authentication...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auth Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sign in for a better experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Why sign in?</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <Check className="h-4 w-4" />
                <span>Order tracking</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Check className="h-4 w-4" />
                <span>Saved addresses</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Check className="h-4 w-4" />
                <span>Order history</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Check className="h-4 w-4" />
                <span>Exclusive offers</span>
              </div>
            </div>
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={!isSignUp ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setIsSignUp(false)}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button
              variant={isSignUp ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setIsSignUp(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {errors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Please wait..."
              ) : isSignUp ? (
                "Create Account & Continue"
              ) : (
                "Sign In & Continue"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue as guest
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={onSkip} 
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue as Guest
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You can create an account after placing your order to track it and save your preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}