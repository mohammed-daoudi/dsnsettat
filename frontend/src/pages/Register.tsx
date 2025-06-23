import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SignUp } from '@clerk/clerk-react';

const Register: React.FC = () => {
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
            Create an Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join Academic Vault to manage your academic documents
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            afterSignUpUrl="/"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
