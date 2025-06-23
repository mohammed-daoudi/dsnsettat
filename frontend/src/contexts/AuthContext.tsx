import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authAPI, verifyEmail, resendVerification, forgotPassword } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.user);
          setToken(token);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, token } = response;
      
      localStorage.setItem('token', token);
      setUser(userData);
      setToken(token);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Email verification
  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      const response = await verifyEmail(token);
      
      toast({
        title: "Success!",
        description: "Email verified successfully. You can now sign in.",
      });
      
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Email verification failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const response = await forgotPassword(email);
      
      toast({
        title: "Email Sent",
        description: "Password reset instructions have been sent to your email.",
      });
      
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      const response = await resetPassword(token, password);
      
      toast({
        title: "Success!",
        description: "Password reset successfully. You can now sign in with your new password.",
      });
      
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Password reset failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerification = async (email: string) => {
    try {
      setLoading(true);
      const response = await resendVerification(email);
      
      toast({
        title: "Email Sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
      
      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await authAPI.register(name, email, password);
      toast({
        title: "Success!",
        description: "Registration successful! Please check your email to verify your account.",
      });
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};