/**
 * Admin Login Page
 * /admin/login
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, Camera, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ColorPaletteProvider } from '@/components/ui/color-palette-provider';

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${colors[type]}`}>
      <div className="flex items-center space-x-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Clear toast
  const clearToast = () => {
    setToast(null);
  };

  // Clear form
  const clearForm = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form inputs
      if (!username.trim() || !password.trim()) {
        setError('Username dan password harus diisi');
        showToast('Username dan password harus diisi', 'error');
        return;
      }

      // Smart URL detection for different environments
      const baseUrl = (() => {
        // First, check for environment variable
        if (process.env.NEXT_PUBLIC_API_BASE_URL) {
          console.log('Using NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
          return process.env.NEXT_PUBLIC_API_BASE_URL;
        }

        if (typeof window !== 'undefined') {
          const currentOrigin = window.location.origin;
          console.log('Current origin:', currentOrigin);
          
          // Check if this is a Vercel preview domain
          if (currentOrigin.includes('vercel.app') && !currentOrigin.includes('hafiportrait')) {
            // For Vercel preview, use the main production API
            console.log('Detected Vercel preview, using production API');
            return 'https://hafiportrait.photography';
          }
          
          return currentOrigin;
        }
        
        // Server-side fallback
        if (process.env.NODE_ENV === 'production') {
          return process.env.NEXT_PUBLIC_APP_URL || 'https://hafiportrait.photography';
        }
        return process.env.DSLR_API_BASE_URL || 'http://localhost:3000';
      })();

      console.log('Using API base URL:', baseUrl);
      const apiUrl = `${baseUrl}/api/auth/login`;
      console.log('Full API URL:', apiUrl);

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        // Login successful
        setSuccess('Login berhasil! Mengalihkan ke dashboard...');
        showToast('Login berhasil!', 'success');
        
        // Clear form
        clearForm();
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.replace(redirectTo);
        }, 1500);
      } else {
        // Handle different error types
        let errorMessage = 'Login gagal';
        
        if (response.status === 401) {
          errorMessage = 'Username atau password salah';
        } else if (response.status === 429) {
          errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
        } else if (response.status === 500) {
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint tidak ditemukan. Silakan coba lagi.';
        } else if (response.status === 403) {
          errorMessage = 'Akses ditolak. Silakan coba lagi.';
        } else if (response.status === 502) {
          errorMessage = 'Server sedang dalam maintenance. Silakan coba lagi nanti.';
        } else if (response.status === 503) {
          errorMessage = 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.';
        } else if (response.status === 504) {
          errorMessage = 'Server timeout. Silakan coba lagi.';
        } else if (data?.error) {
          errorMessage = data.error;
        }
        
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Terjadi kesalahan jaringan. Silakan coba lagi.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke API. Silakan coba lagi.';
      } else if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = 'Request timeout. Silakan coba lagi.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form validation
  const isFormValid = username.trim() && password.trim();

  return (
    <ColorPaletteProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={clearToast}
          />
        )}

        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-dynamic-primary rounded-full p-3">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">HafiPortrait</h1>
            <p className="text-gray-600">Admin Dashboard Login</p>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Welcome Back
              </CardTitle>
              <p className="text-center text-gray-600">
                Sign in to your admin account
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12"
                      required
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-dynamic-primary focus:ring-dynamic-primary border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me for 30 days
                  </Label>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-dynamic-primary hover:bg-dynamic-primary/90 text-white font-medium disabled:opacity-50"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Your session is secured with industry-standard encryption
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 HafiPortrait. All rights reserved.</p>
            <p className="mt-1">Professional Photography Services</p>
          </div>
        </div>
      </div>
    </ColorPaletteProvider>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}