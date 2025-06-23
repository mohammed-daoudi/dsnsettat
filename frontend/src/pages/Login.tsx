import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  // Redirect if already authenticated
  if (isSignedIn) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your Academic Vault account
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/register"
            afterSignInUrl="/"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
