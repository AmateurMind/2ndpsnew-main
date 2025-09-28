import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Users, BookOpen, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState([]);

  useEffect(() => {
    fetchDemoCredentials();
  }, []);

  const fetchDemoCredentials = async () => {
    try {
      const response = await axios.get('/auth/demo-credentials');
      setDemoCredentials(response.data.credentials);
    } catch (error) {
      console.error('Failed to fetch demo credentials:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(credentials);
    setLoading(false);
  };

  const handleDemoLogin = (demoUser) => {
    setCredentials({
      email: demoUser.email,
      password: demoUser.password
    });
  };

  const roleIcons = {
    student: Users,
    mentor: BookOpen,
    admin: BarChart3,
    recruiter: BarChart3
  };

  const roleColors = {
    student: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    mentor: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    admin: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
    recruiter: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <GraduationCap className="h-16 w-16 text-primary-600" />
            </div>
            <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-secondary-900">
              Welcome to Campus Portal
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Demo Credentials */}
      <div className="hidden lg:flex flex-1 bg-primary-600 items-center justify-center px-8">
        <div className="max-w-md w-full">
          <div className="text-white text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Demo Access</h3>
            <p className="text-primary-100">
              Click on any role below to auto-fill login credentials
            </p>
          </div>

          <div className="space-y-3">
            {demoCredentials.map((demo, index) => {
              const Icon = roleIcons[demo.role];
              return (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(demo)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors duration-200 ${
                    roleColors[demo.role] || 'bg-secondary-50 hover:bg-secondary-100 text-secondary-700 border-secondary-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6" />
                    <div className="text-left flex-1">
                      <div className="font-semibold capitalize">{demo.role}</div>
                      <div className="text-sm opacity-75">{demo.name}</div>
                      <div className="text-xs opacity-60">{demo.email}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-center text-primary-100 text-sm">
            <p>🚀 This is a demo application with sample data</p>
            <p className="mt-2">All roles use password: <code className="bg-primary-700 px-2 py-1 rounded">demo123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;