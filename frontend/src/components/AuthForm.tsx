import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onSwitchMode?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Success!",
            description: "Logged in successfully.",
          });
          onSuccess?.();
        }
      } else {
        const success = await register(name, email, password);
        if (success) {
          toast({
            title: "Success!",
            description: "Registration successful! Please check your email to verify your account.",
          });
          onSuccess?.();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `${mode === 'login' ? 'Login' : 'Registration'} failed`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Create a new account to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="text-center text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold"
                onClick={onSwitchMode}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold"
                onClick={onSwitchMode}
              >
                Sign in
              </Button>
            </>
          )}
        </div>
        {mode === 'login' && (
          <div className="text-center">
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto"
              onClick={() => {
                // TODO: Implement forgot password
                toast({
                  title: "Coming Soon",
                  description: "Password reset functionality will be available soon.",
                });
              }}
            >
              Forgot your password?
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm; 