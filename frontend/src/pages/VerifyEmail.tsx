import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '@/services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email, please wait...');
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Verification token not found. Please check your link.');
      setError(true);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        setMessage(response.message || 'Email verified successfully! You can now log in.');
        setError(false);
      } catch (err: any) {
        setMessage(err.message || 'Failed to verify email. The link may be invalid or expired.');
        setError(true);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md text-center">
        <h1 className={`text-2xl font-bold mb-4 ${error ? 'text-red-500' : 'text-green-500'}`}>
          {error ? 'Verification Failed' : 'Email Verified'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <Link 
          to="/login"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 