'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

// Add US states array
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format the date as YYYY-MM-DD for the backend
  const getBirthday = () => {
    if (!month || !day || !year) return "";
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

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
      setLoading(true);
      await signUp(email, password, {
        firstName,
        lastName,
        birthday: getBirthday(),
        currentState,
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
    } finally {
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Check your email</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a confirmation link to {email}
          </p>
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <p className="text-gray-500">
                Please click the link in your email to activate your account.
              </p>
              <p className="text-gray-500">
                After confirming, you'll be asked to sign in.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Didn't receive the email?{" "}
              <button 
                onClick={() => setIsConfirmationSent(false)} 
                className="text-blue-500 hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your information to create your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    hasAttemptedSubmit && emailError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Only show errors if they've already tried to submit
                    if (hasAttemptedSubmit) {
                      setEmailError(validateEmail(e.target.value));
                    }
                  }}
                />
                {hasAttemptedSubmit && emailError && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {emailError}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="month"
                  name="month"
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  value={month}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setMonth(val);
                    if (val.length === 2 && parseInt(val) > 0 && parseInt(val) <= 12) {
                      document.getElementById('day')?.focus();
                    }
                  }}
                  className="appearance-none w-16 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <span className="text-gray-500 self-center">/</span>
                <input
                  id="day"
                  name="day"
                  type="text"
                  placeholder="DD"
                  maxLength={2}
                  value={day}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setDay(val);
                    if (val.length === 2 && parseInt(val) > 0 && parseInt(val) <= 31) {
                      document.getElementById('year')?.focus();
                    }
                  }}
                  className="appearance-none w-16 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <span className="text-gray-500 self-center">/</span>
                <input
                  id="year"
                  name="year"
                  type="text"
                  placeholder="YYYY"
                  maxLength={4}
                  value={year}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setYear(val);
                  }}
                  className="appearance-none w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                Current State
              </label>
              <div className="mt-1">
                <select
                  id="state"
                  name="state"
                  value={currentState}
                  onChange={(e) => setCurrentState(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select a state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    hasAttemptedSubmit && errors.length > 0 ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  value={password}
                  onChange={handlePasswordChange}
                />
                {hasAttemptedSubmit && errors.length > 0 && (
                  <div className="mt-1 text-sm text-red-500" role="alert">
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 