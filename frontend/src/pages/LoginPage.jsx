import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Loader2, Lock, User, Shield, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
      } else {
        toast({
          title: 'Login failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black relative overflow-hidden flex items-center justify-center px-4 sm:px-6 transition-colors duration-300">
      {/* Animated gradient mesh background - Same as admin dashboard */}
      <div className="fixed inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent dark:from-purple-950/30 dark:via-black dark:to-pink-950/20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-transparent dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,0,255,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-transparent dark:bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,128,0.1),transparent_50%)] pointer-events-none"></div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-transparent dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[size:50px_50px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-2xl shadow-purple-500/50">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Mantez Reels
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Admin Panel</p>
        </div>

        {/* Login Card - Glass Morphism Effect */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-2xl shadow-purple-500/10 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/30 mb-4">
              <Lock className="text-purple-600 dark:text-purple-400" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User size={16} className="text-gray-500 dark:text-gray-400" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Lock size={16} className="text-gray-500 dark:text-gray-400" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} Mantez Reels. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
