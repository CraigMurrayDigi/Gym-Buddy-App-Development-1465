import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDumbbell, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBuilding, FiAward } = FiIcons;

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: account type, 2: form
  const [accountType, setAccountType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle account type selection
  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setCurrentStep(2);
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting signup process...');
      console.log('📧 Email:', formData.email);
      console.log('👤 Name:', formData.name);
      console.log('🏷️ Account type:', accountType);

      const userData = {
        name: formData.name.trim(),
        account_type: accountType
      };

      const { user, error, warning } = await signUp(
        formData.email.trim(),
        formData.password,
        userData
      );

      if (error) {
        console.error('❌ Signup failed:', error);
        toast.error(error);
        return;
      }

      if (user) {
        console.log('✅ Signup successful!');
        
        if (warning) {
          toast.success('Account created successfully!');
          toast.error(warning, { duration: 5000 });
        } else {
          toast.success('Account created successfully! Please complete your profile setup.');
        }

        // Wait a moment for the database operations to complete
        setTimeout(() => {
          // Navigate based on account type
          if (accountType === 'gym_owner') {
            navigate('/gym-dashboard');
          } else if (accountType === 'personal_trainer') {
            navigate('/trainer-dashboard');
          } else {
            navigate('/profile-setup');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Signup process error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Account type selection step
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl w-full"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <SafeIcon icon={FiDumbbell} className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Gym Buddy</h2>
              <p className="text-gray-600">Choose your account type to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Personal Account */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccountTypeSelect('user')}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white cursor-pointer transition-all group"
              >
                <div className="text-center">
                  <SafeIcon icon={FiUser} className="text-4xl text-blue-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Account</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Find workout partners, schedule sessions, and connect with the fitness community
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• Find workout buddies</li>
                    <li>• Schedule gym sessions</li>
                    <li>• Join group workouts</li>
                    <li>• Chat with members</li>
                    <li>• Share fitness progress</li>
                  </ul>
                </div>
              </motion.div>

              {/* Personal Trainer */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccountTypeSelect('personal_trainer')}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white cursor-pointer transition-all group"
              >
                <div className="text-center">
                  <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Trainer</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Offer training services, build your client base, and grow your fitness business
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• Create trainer profile</li>
                    <li>• Offer training sessions</li>
                    <li>• Manage client bookings</li>
                    <li>• Set your rates</li>
                    <li>• Build your reputation</li>
                  </ul>
                </div>
              </motion.div>

              {/* Gym Business */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccountTypeSelect('gym_owner')}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white cursor-pointer transition-all group"
              >
                <div className="text-center">
                  <SafeIcon icon={FiBuilding} className="text-4xl text-blue-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Gym Business</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Promote your gym, manage memberships, and connect with fitness enthusiasts
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• List your gym business</li>
                    <li>• Manage membership plans</li>
                    <li>• Promote facilities</li>
                    <li>• Connect with members</li>
                    <li>• Analytics dashboard</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Registration form step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <SafeIcon
              icon={accountType === 'gym_owner' ? FiBuilding : accountType === 'personal_trainer' ? FiAward : FiUser}
              className="text-4xl text-blue-600 mb-4 mx-auto"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create {accountType === 'gym_owner' ? 'Gym Business' : accountType === 'personal_trainer' ? 'Trainer' : 'Personal'} Account
            </h2>
            <p className="text-gray-600">
              {accountType === 'gym_owner' ? 'Set up your gym business profile' : accountType === 'personal_trainer' ? 'Join as a personal trainer' : 'Join the fitness community'}
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2"
            >
              ← Choose different account type
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
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
                Password *
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
                  placeholder="Create a password (min. 6 characters)"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={showConfirmPassword ? FiEyeOff : FiEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Create ${accountType === 'gym_owner' ? 'Gym Business' : accountType === 'personal_trainer' ? 'Trainer' : 'Personal'} Account`
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;