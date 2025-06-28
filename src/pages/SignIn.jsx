import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDumbbell, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertTriangle, FiBuilding, FiAward } = FiIcons;

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'test@example.com', password: 'password123' });
  };

  const handleAdminLogin = () => {
    setFormData({ email: 'admin@gymbuddy.com', password: 'admin123' });
  };

  const handleModeratorLogin = () => {
    setFormData({ email: 'moderator@gymbuddy.com', password: 'moderator123' });
  };

  const handleGymLogin = () => {
    setFormData({ email: 'gym@example.com', password: 'gym123' });
  };

  const handleTrainerLogin = () => {
    setFormData({ email: 'trainer@example.com', password: 'trainer123' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in with:', formData.email);
      const { user, error } = await signIn(formData.email, formData.password);

      if (error) {
        console.error('Sign in failed:', error);
        toast.error(error);
      } else if (user) {
        console.log('Sign in successful for:', user.email);
        const welcomeMessage = user.role === 'admin' 
          ? 'Welcome back, Admin!' 
          : user.role === 'moderator' 
          ? 'Welcome back, Moderator!' 
          : user.account_type === 'gym_owner' 
          ? 'Welcome back to your gym dashboard!'
          : user.account_type === 'personal_trainer'
          ? 'Welcome back to your trainer dashboard!'
          : 'Welcome back!';

        toast.success(welcomeMessage);

        // Navigate based on account type
        if (user.account_type === 'gym_owner') {
          navigate('/gym-dashboard');
        } else if (user.account_type === 'personal_trainer') {
          navigate('/trainer-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <SafeIcon icon={FiDumbbell} className="text-4xl text-blue-600 mb-4 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your Gym Buddy account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Account Section */}
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Try Demo User Account</h3>
              <div className="space-y-2 text-xs text-blue-600">
                <p>Email: test@example.com</p>
                <p>Password: password123</p>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-3 w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                Use Demo Account
              </button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center">
                <SafeIcon icon={FiAward} className="mr-2" />
                Personal Trainer Demo
              </h3>
              <div className="space-y-2 text-xs text-green-600">
                <p>Email: trainer@example.com</p>
                <p>Password: trainer123</p>
              </div>
              <button
                type="button"
                onClick={handleTrainerLogin}
                className="mt-3 w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                Trainer Dashboard Login
              </button>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
                <SafeIcon icon={FiBuilding} className="mr-2" />
                Gym Owner Demo
              </h3>
              <div className="space-y-2 text-xs text-purple-600">
                <p>Email: gym@example.com</p>
                <p>Password: gym123</p>
              </div>
              <button
                type="button"
                onClick={handleGymLogin}
                className="mt-3 w-full bg-purple-100 text-purple-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                Gym Dashboard Login
              </button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
                <SafeIcon icon={FiAlertTriangle} className="mr-2" />
                Moderator Access
              </h3>
              <div className="space-y-2 text-xs text-yellow-600">
                <p>Email: moderator@gymbuddy.com</p>
                <p>Password: moderator123</p>
              </div>
              <button
                type="button"
                onClick={handleModeratorLogin}
                className="mt-3 w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
              >
                Moderator Login
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-3 flex items-center">
                <SafeIcon icon={FiShield} className="mr-2" />
                Admin Access
              </h3>
              <div className="space-y-2 text-xs text-red-600">
                <p>Email: admin@gymbuddy.com</p>
                <p>Password: admin123</p>
              </div>
              <button
                type="button"
                onClick={handleAdminLogin}
                className="mt-3 w-full bg-red-100 text-red-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;