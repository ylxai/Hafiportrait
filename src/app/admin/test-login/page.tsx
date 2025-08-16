/**
 * Test Login Page for Debugging
 * /admin/test-login
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, Camera, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function TestLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testApiConnection = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setDebugInfo(null);

    try {
      // Test different API URLs with better error handling
      const testUrls = [
        '/api/test-simple', // Simple test endpoint
        '/api/auth/test', // Auth test endpoint
        'https://hafiportrait.photography/api/test-simple', // Production simple test
        `${window.location.origin}/api/test-simple` // Current domain simple test
      ];

      const results = [];

      for (const url of testUrls) {
        try {
          console.log(`Testing URL: ${url}`);
          
          // Add timeout to fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            data = { error: 'Failed to parse response' };
          }

          results.push({
            url,
            status: response.status,
            ok: response.ok,
            data,
            headers: Object.fromEntries(response.headers.entries()),
            error: null
          });
        } catch (error) {
          console.error(`Error testing ${url}:`, error);
          
          let errorMessage = 'Unknown error';
          if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = 'Network error - Failed to fetch';
          } else if (error instanceof Error && error.name === 'AbortError') {
            errorMessage = 'Request timeout';
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          results.push({
            url,
            status: null,
            ok: false,
            data: null,
            headers: {},
            error: errorMessage
          });
        }
      }

      setDebugInfo({
        currentOrigin: window.location.origin,
        environment: process.env.NODE_ENV,
        testResults: results,
        timestamp: new Date().toISOString()
      });

      // Check if any endpoint worked
      const workingEndpoints = results.filter(r => r.ok);
      if (workingEndpoints.length > 0) {
        setSuccess(`API test completed. ${workingEndpoints.length} endpoint(s) working.`);
      } else {
        setError('All API endpoints failed. Check debug info below.');
      }
    } catch (error) {
      console.error('Test API connection error:', error);
      setError('Failed to test API connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setDebugInfo(null);

    try {
      // Test different login URLs with better error handling
      const loginUrls = [
        '/api/auth/login',
        'https://hafiportrait.photography/api/auth/login',
        `${window.location.origin}/api/auth/login`
      ];

      const results = [];

      for (const url of loginUrls) {
        try {
          console.log(`Testing login URL: ${url}`);
          
          // Add timeout to fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            data = { error: 'Failed to parse response' };
          }

          results.push({
            url,
            status: response.status,
            ok: response.ok,
            data,
            headers: Object.fromEntries(response.headers.entries()),
            error: null
          });
        } catch (error) {
          console.error(`Error testing login ${url}:`, error);
          
          let errorMessage = 'Unknown error';
          if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = 'Network error - Failed to fetch';
          } else if (error instanceof Error && error.name === 'AbortError') {
            errorMessage = 'Request timeout';
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          results.push({
            url,
            status: null,
            ok: false,
            data: null,
            headers: {},
            error: errorMessage
          });
        }
      }

      setDebugInfo({
        currentOrigin: window.location.origin,
        environment: process.env.NODE_ENV,
        loginResults: results,
        timestamp: new Date().toISOString()
      });

      // Check if any login was successful
      const successfulLogin = results.find(r => r.ok && r.data?.success);
      const failedWith401 = results.find(r => r.status === 401);
      
      if (successfulLogin) {
        setSuccess('Login test completed. One or more endpoints responded successfully.');
      } else if (failedWith401) {
        setSuccess('Login endpoint is working (correctly rejected credentials).');
      } else {
        setError('All login endpoints failed. Check debug info below.');
      }
    } catch (error) {
      console.error('Test login error:', error);
      setError('Failed to test login endpoints');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HafiPortrait</h1>
          <p className="text-gray-600">Test Login Page - Debug Mode</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test API Connection */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-center text-gray-900">
                Test API Connection
              </CardTitle>
              <p className="text-center text-gray-600">
                Test connectivity to different API endpoints
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testApiConnection}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing...</span>
                  </div>
                ) : (
                  'Test API Connection'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Login */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-center text-gray-900">
                Test Login
              </CardTitle>
              <p className="text-center text-gray-600">
                Test login with different API endpoints
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
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

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
                  disabled={isLoading || !username || !password}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Testing Login...</span>
                    </div>
                  ) : (
                    'Test Login'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-center text-gray-900">
                Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Environment Info:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify({
                    currentOrigin: debugInfo.currentOrigin,
                    environment: debugInfo.environment,
                    timestamp: debugInfo.timestamp
                  }, null, 2)}
                </pre>
              </div>

              {debugInfo.testResults && (
                <div className="bg-blue-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">API Test Results:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(debugInfo.testResults, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.loginResults && (
                <div className="bg-green-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Login Test Results:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(debugInfo.loginResults, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-center text-gray-900">
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. <strong>Test API Connection:</strong> Click to test basic connectivity to API endpoints</p>
              <p>2. <strong>Test Login:</strong> Enter credentials to test login functionality</p>
              <p>3. <strong>Check Debug Info:</strong> Review the results to identify issues</p>
              <p>4. <strong>Common Issues:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>CORS errors: Check if origin is allowed</li>
                <li>404 errors: API endpoint not found</li>
                <li>Network errors: Check internet connection</li>
                <li>Authentication errors: Check credentials</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}