"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Password validation rules
const passwordRules = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

const validatePassword = (password: string) => {
  const errors = [];
  
  if (password.length < passwordRules.minLength) {
    errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
  }
  if (!passwordRules.hasUpperCase.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!passwordRules.hasLowerCase.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!passwordRules.hasNumber.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!passwordRules.hasSpecialChar.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return errors;
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) return "Please enter valid email";
  return "";
};

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Validate email before submission
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    // Validate password before submission
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }

    try {
      await signUp(email, password, {
        firstName,
        lastName,
        birthday,
      });
      setIsConfirmationSent(true);
    } catch (err: any) {
      // Handle Supabase auth errors
      if (err.message) {
        if (err.message.includes("email")) {
          setEmailError("This email is already registered");
        } else if (err.message.includes("password")) {
          setErrors([err.message]);
        } else {
          setErrors([err.message]);
        }
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // Only show errors if they've already tried to submit once
    if (hasAttemptedSubmit) {
      setErrors(validatePassword(newPassword));
    }
  };

  if (isConfirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-500">
              Please click the link in your email to activate your account. After confirming, you'll be asked to sign in.
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email?{" "}
              <button 
                onClick={() => setIsConfirmationSent(false)} 
                className="text-blue-500 hover:underline"
              >
                Try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="john@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Only show errors if they've already tried to submit
                    if (hasAttemptedSubmit) {
                      setEmailError(validateEmail(e.target.value));
                    }
                  }}
                  required 
                  className={hasAttemptedSubmit && emailError ? "border-red-500" : ""}
                />
                {hasAttemptedSubmit && emailError && (
                  <p className="text-sm text-red-500 mt-1">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="birthday">Birthday</Label>
                <Input 
                  id="birthday" 
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required 
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required 
                />
                {hasAttemptedSubmit && errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-500">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Password must:
                  <ul className="list-disc list-inside mt-1">
                    <li>Be at least 8 characters long</li>
                    <li>Contain at least one uppercase letter</li>
                    <li>Contain at least one lowercase letter</li>
                    <li>Contain at least one number</li>
                    <li>Contain at least one special character</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full mt-4">Sign Up</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 