import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiDumbbell, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBuilding, FiMapPin,
  FiPhone, FiGlobe, FiFileText, FiStar, FiAward, FiHeart, FiUsers
} = FiIcons;

const SignUp = () => {
  const [accountType, setAccountType] = useState('user'); // 'user', 'gym', or 'trainer'
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // User form data
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Gym form data
  const [gymFormData, setGymFormData] = useState({
    // Step 1: Account Info
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Business Info
    businessName: '',
    businessEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    description: '',
    // Step 3: Facilities
    selectedFacilities: []
  });

  // Trainer form data
  const [trainerFormData, setTrainerFormData] = useState({
    // Step 1: Account Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Professional Info
    businessName: '',
    specializations: [],
    certifications: [],
    experienceYears: '',
    hourlyRate: '',
    bio: '',
    phone: '',
    website: '',
    instagram: '',
    // Step 3: Services & Availability
    location: '',
    gymAffiliations: [],
    servicesOffered: [],
    isAcceptingClients: true
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const gymFacilities = [
    { id: 'cardio', name: 'Cardio Equipment', description: 'Treadmills, ellipticals, bikes' },
    { id: 'weights', name: 'Weight Training', description: 'Free weights, dumbbells, barbells' },
    { id: 'machines', name: 'Strength Machines', description: 'Cable machines, weight machines' },
    { id: 'group_fitness', name: 'Group Fitness Studio', description: 'Space for group classes' },
    { id: 'locker_rooms', name: 'Locker Rooms', description: 'Changing rooms with showers' },
    { id: 'sauna', name: 'Sauna', description: 'Relaxation and recovery facility' },
    { id: 'pool', name: 'Swimming Pool', description: 'Lap pool or recreational pool' },
    { id: 'basketball', name: 'Basketball Court', description: 'Full or half court' },
    { id: 'yoga', name: 'Yoga Studio', description: 'Dedicated yoga and meditation space' },
    { id: 'personal_training', name: 'Personal Training Area', description: 'Private training space' },
    { id: 'functional', name: 'Functional Training Zone', description: 'TRX, kettlebells, functional equipment' },
    { id: 'childcare', name: 'Childcare', description: 'Supervised childcare services' }
  ];

  const trainerSpecializations = [
    'Weight Loss', 'Muscle Building', 'Strength Training', 'Cardio Training',
    'HIIT', 'CrossFit', 'Yoga', 'Pilates', 'Flexibility & Mobility',
    'Sports Performance', 'Injury Rehabilitation', 'Senior Fitness',
    'Youth Training', 'Nutrition Coaching', 'Bodybuilding', 'Powerlifting',
    'Functional Training', 'Marathon Training', 'Stress Relief', 'Meditation'
  ];

  const trainerCertifications = [
    'NASM-CPT', 'ACE-CPT', 'ACSM-CPT', 'NSCA-CPT', 'CSCS', 'PES', 'CES',
    'RYT-200', 'RYT-500', 'PMA-CPT', 'CrossFit Level 1', 'CrossFit Level 2',
    'FMS', 'SFMA', 'TRX-STC', 'Precision Nutrition', 'PNBA', 'USAW',
    'USA Powerlifting', 'CPR/AED Certified'
  ];

  const trainerServices = [
    'One-on-One Training', 'Group Training', 'Online Coaching', 'Nutrition Coaching',
    'Workout Plan Design', 'Form Correction', 'Goal Setting', 'Progress Tracking',
    'Injury Prevention', 'Rehabilitation Support', 'Competition Prep',
    'Lifestyle Coaching', 'Mindfulness Training', 'Mobility Assessment'
  ];

  const handleUserFormChange = (e) => {
    setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  };

  const handleGymFormChange = (e) => {
    setGymFormData({ ...gymFormData, [e.target.name]: e.target.value });
  };

  const handleTrainerFormChange = (e) => {
    setTrainerFormData({ ...trainerFormData, [e.target.name]: e.target.value });
  };

  const handleFacilityToggle = (facilityId) => {
    setGymFormData({
      ...gymFormData,
      selectedFacilities: gymFormData.selectedFacilities.includes(facilityId)
        ? gymFormData.selectedFacilities.filter(id => id !== facilityId)
        : [...gymFormData.selectedFacilities, facilityId]
    });
  };

  const handleTrainerSpecializationToggle = (specialization) => {
    setTrainerFormData({
      ...trainerFormData,
      specializations: trainerFormData.specializations.includes(specialization)
        ? trainerFormData.specializations.filter(s => s !== specialization)
        : [...trainerFormData.specializations, specialization]
    });
  };

  const handleTrainerCertificationToggle = (certification) => {
    setTrainerFormData({
      ...trainerFormData,
      certifications: trainerFormData.certifications.includes(certification)
        ? trainerFormData.certifications.filter(c => c !== certification)
        : [...trainerFormData.certifications, certification]
    });
  };

  const handleTrainerServiceToggle = (service) => {
    setTrainerFormData({
      ...trainerFormData,
      servicesOffered: trainerFormData.servicesOffered.includes(service)
        ? trainerFormData.servicesOffered.filter(s => s !== service)
        : [...trainerFormData.servicesOffered, service]
    });
  };

  const validateUserForm = () => {
    if (!userFormData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!userFormData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (userFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (userFormData.password !== userFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateGymStep = (step) => {
    switch (step) {
      case 1:
        if (!gymFormData.ownerName.trim()) {
          toast.error('Please enter the owner name');
          return false;
        }
        if (!gymFormData.email.trim()) {
          toast.error('Please enter your email address');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gymFormData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (gymFormData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return false;
        }
        if (gymFormData.password !== gymFormData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      case 2:
        if (!gymFormData.businessName.trim()) {
          toast.error('Please enter your business name');
          return false;
        }
        if (!gymFormData.businessEmail.trim()) {
          toast.error('Please enter your business email');
          return false;
        }
        if (!gymFormData.address.trim()) {
          toast.error('Please enter your business address');
          return false;
        }
        if (!gymFormData.city.trim()) {
          toast.error('Please enter your city');
          return false;
        }
        return true;
      case 3:
        if (gymFormData.selectedFacilities.length === 0) {
          toast.error('Please select at least one facility');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const validateTrainerStep = (step) => {
    switch (step) {
      case 1:
        if (!trainerFormData.name.trim()) {
          toast.error('Please enter your full name');
          return false;
        }
        if (!trainerFormData.email.trim()) {
          toast.error('Please enter your email address');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainerFormData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (trainerFormData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return false;
        }
        if (trainerFormData.password !== trainerFormData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      case 2:
        if (trainerFormData.specializations.length === 0) {
          toast.error('Please select at least one specialization');
          return false;
        }
        if (!trainerFormData.bio.trim()) {
          toast.error('Please enter a bio describing your services');
          return false;
        }
        return true;
      case 3:
        if (!trainerFormData.location.trim()) {
          toast.error('Please enter your location');
          return false;
        }
        if (trainerFormData.servicesOffered.length === 0) {
          toast.error('Please select at least one service you offer');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setLoading(true);
    try {
      console.log('Starting user signup process for:', userFormData.email);
      const { user, error } = await signUp(userFormData.email, userFormData.password, {
        name: userFormData.name,
        account_type: 'user'
      });

      if (error) {
        console.error('Signup failed:', error);
        toast.error(error);
      } else {
        console.log('User signup successful:', user?.email);
        toast.success('Account created successfully! Please complete your profile setup.');
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGymNext = () => {
    if (validateGymStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGymPrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleTrainerNext = () => {
    if (validateTrainerStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTrainerPrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleGymSubmit = async (e) => {
    e.preventDefault();
    if (!validateGymStep(3)) return;

    setLoading(true);
    try {
      console.log('Starting gym signup process for:', gymFormData.email);
      const { user, error } = await signUp(gymFormData.email, gymFormData.password, {
        name: gymFormData.ownerName,
        account_type: 'gym_owner',
        gym_data: {
          businessName: gymFormData.businessName,
          businessEmail: gymFormData.businessEmail,
          phone: gymFormData.phone,
          address: gymFormData.address,
          city: gymFormData.city,
          state: gymFormData.state,
          zipCode: gymFormData.zipCode,
          website: gymFormData.website,
          description: gymFormData.description,
          facilities: gymFormData.selectedFacilities
        }
      });

      if (error) {
        console.error('Gym signup failed:', error);
        toast.error(error);
      } else {
        console.log('Gym signup successful:', user?.email);
        toast.success('Gym account created successfully! Your account is pending verification.');
        navigate('/gym-dashboard');
      }
    } catch (error) {
      console.error('Unexpected gym signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerSubmit = async (e) => {
    e.preventDefault();
    if (!validateTrainerStep(3)) return;

    setLoading(true);
    try {
      console.log('Starting trainer signup process for:', trainerFormData.email);
      const { user, error } = await signUp(trainerFormData.email, trainerFormData.password, {
        name: trainerFormData.name,
        account_type: 'personal_trainer',
        trainer_data: {
          businessName: trainerFormData.businessName,
          specializations: trainerFormData.specializations,
          certifications: trainerFormData.certifications,
          experienceYears: parseInt(trainerFormData.experienceYears) || 0,
          hourlyRate: parseFloat(trainerFormData.hourlyRate) || null,
          bio: trainerFormData.bio,
          phone: trainerFormData.phone,
          website: trainerFormData.website,
          instagram: trainerFormData.instagram,
          location: trainerFormData.location,
          gymAffiliations: trainerFormData.gymAffiliations,
          servicesOffered: trainerFormData.servicesOffered,
          isAcceptingClients: trainerFormData.isAcceptingClients
        }
      });

      if (error) {
        console.error('Trainer signup failed:', error);
        toast.error(error);
      } else {
        console.log('Trainer signup successful:', user?.email);
        toast.success('Personal trainer account created successfully! Your profile is pending verification.');
        navigate('/trainer-dashboard');
      }
    } catch (error) {
      console.error('Unexpected trainer signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const AccountTypeSelector = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiDumbbell} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Gym Buddy</h2>
        <p className="text-gray-600">Choose your account type to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Account */}
        <div
          onClick={() => setAccountType('user')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            accountType === 'user'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-center">
            <SafeIcon icon={FiUser} className="text-4xl text-blue-600 mb-4 mx-auto" />
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
        </div>

        {/* Personal Trainer Account */}
        <div
          onClick={() => setAccountType('trainer')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            accountType === 'trainer'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-center">
            <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mb-4 mx-auto" />
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
        </div>

        {/* Gym Account */}
        <div
          onClick={() => setAccountType('gym')}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            accountType === 'gym'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="text-center">
            <SafeIcon icon={FiBuilding} className="text-4xl text-blue-600 mb-4 mx-auto" />
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
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            if (accountType === 'user') {
              // Go directly to user form
            } else {
              setCurrentStep(1);
            }
          }}
          disabled={!accountType}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue as {accountType === 'user' ? 'User' : accountType === 'trainer' ? 'Personal Trainer' : 'Gym Owner'}
        </button>
      </div>
    </motion.div>
  );

  const UserSignupForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiUser} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Personal Account</h2>
        <p className="text-gray-600">Join the fitness community</p>
      </div>

      <form onSubmit={handleUserSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="name"
              name="name"
              type="text"
              required
              value={userFormData.name}
              onChange={handleUserFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

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
              value={userFormData.email}
              onChange={handleUserFormChange}
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
              value={userFormData.password}
              onChange={handleUserFormChange}
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
            Confirm Password
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={userFormData.confirmPassword}
              onChange={handleUserFormChange}
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
            'Create Personal Account'
          )}
        </button>
      </form>
    </motion.div>
  );

  // Trainer Signup Steps
  const TrainerSignupStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Trainer Setup</h2>
        <p className="text-gray-600">Step 1 of 3: Account Information</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="trainerName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="trainerName"
              name="name"
              type="text"
              required
              value={trainerFormData.name}
              onChange={handleTrainerFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="trainerEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="trainerEmail"
              name="email"
              type="email"
              required
              value={trainerFormData.email}
              onChange={handleTrainerFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="trainerPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="trainerPassword"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={trainerFormData.password}
              onChange={handleTrainerFormChange}
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
          <label htmlFor="trainerConfirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="trainerConfirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={trainerFormData.confirmPassword}
              onChange={handleTrainerFormChange}
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
          type="button"
          onClick={handleTrainerNext}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Next: Professional Information
        </button>
      </div>
    </motion.div>
  );

  const TrainerSignupStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Professional Information</h2>
        <p className="text-gray-600">Step 2 of 3: Tell us about your expertise</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name (Optional)
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={trainerFormData.businessName}
              onChange={handleTrainerFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your training business name"
            />
          </div>
          <div>
            <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min="0"
              max="50"
              value={trainerFormData.experienceYears}
              onChange={handleTrainerFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Years"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Specializations * (Select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {trainerSpecializations.map((specialization) => (
              <label
                key={specialization}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                  trainerFormData.specializations.includes(specialization)
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={trainerFormData.specializations.includes(specialization)}
                  onChange={() => handleTrainerSpecializationToggle(specialization)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{specialization}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Certifications (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {trainerCertifications.map((certification) => (
              <label
                key={certification}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                  trainerFormData.certifications.includes(certification)
                    ? 'bg-green-100 text-green-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={trainerFormData.certifications.includes(certification)}
                  onChange={() => handleTrainerCertificationToggle(certification)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm">{certification}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio / About You *
          </label>
          <textarea
            id="bio"
            name="bio"
            rows="4"
            required
            value={trainerFormData.bio}
            onChange={handleTrainerFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your training philosophy, experience, and what makes you unique as a trainer..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">$</span>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={trainerFormData.hourlyRate}
                onChange={handleTrainerFormChange}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="75.00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <SafeIcon icon={FiPhone} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={trainerFormData.phone}
                onChange={handleTrainerFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleTrainerPrevious}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleTrainerNext}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next: Services & Location
          </button>
        </div>
      </div>
    </motion.div>
  );

  const TrainerSignupStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Services & Availability</h2>
        <p className="text-gray-600">Step 3 of 3: Complete your trainer profile</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Location *
          </label>
          <div className="relative">
            <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="location"
              name="location"
              type="text"
              required
              value={trainerFormData.location}
              onChange={handleTrainerFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, State (e.g., New York, NY)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Services Offered * (Select at least one)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {trainerServices.map((service) => (
              <label
                key={service}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                  trainerFormData.servicesOffered.includes(service)
                    ? 'bg-purple-100 text-purple-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={trainerFormData.servicesOffered.includes(service)}
                  onChange={() => handleTrainerServiceToggle(service)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">{service}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <div className="relative">
              <SafeIcon icon={FiGlobe} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="website"
                name="website"
                type="url"
                value={trainerFormData.website}
                onChange={handleTrainerFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">@</span>
              <input
                id="instagram"
                name="instagram"
                type="text"
                value={trainerFormData.instagram}
                onChange={handleTrainerFormChange}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isAcceptingClients"
            name="isAcceptingClients"
            checked={trainerFormData.isAcceptingClients}
            onChange={(e) => setTrainerFormData({ ...trainerFormData, isAcceptingClients: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isAcceptingClients" className="text-sm font-medium text-gray-700">
            I am currently accepting new clients
          </label>
        </div>

        <form onSubmit={handleTrainerSubmit}>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleTrainerPrevious}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Trainer Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  // Include existing gym signup steps (GymSignupStep1, GymSignupStep2, GymSignupStep3)
  const GymSignupStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiBuilding} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gym Account Setup</h2>
        <p className="text-gray-600">Step 1 of 3: Owner Information</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
            Owner/Manager Name
          </label>
          <div className="relative">
            <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              required
              value={gymFormData.ownerName}
              onChange={handleGymFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter owner/manager name"
            />
          </div>
        </div>

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
              value={gymFormData.email}
              onChange={handleGymFormChange}
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
              value={gymFormData.password}
              onChange={handleGymFormChange}
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
            Confirm Password
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={gymFormData.confirmPassword}
              onChange={handleGymFormChange}
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
          type="button"
          onClick={handleGymNext}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Next: Business Information
        </button>
      </div>
    </motion.div>
  );

  const GymSignupStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiBuilding} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Step 2 of 3: Tell us about your gym</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <div className="relative">
              <SafeIcon icon={FiBuilding} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={gymFormData.businessName}
                onChange={handleGymFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your gym name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Business Email *
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="businessEmail"
                name="businessEmail"
                type="email"
                required
                value={gymFormData.businessEmail}
                onChange={handleGymFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="business@gym.com"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <SafeIcon icon={FiPhone} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={gymFormData.phone}
                onChange={handleGymFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <div className="relative">
              <SafeIcon icon={FiGlobe} className="absolute left-3 top-3 text-gray-400" />
              <input
                id="website"
                name="website"
                type="url"
                value={gymFormData.website}
                onChange={handleGymFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourgym.com"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <div className="relative">
            <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="address"
              name="address"
              type="text"
              required
              value={gymFormData.address}
              onChange={handleGymFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Fitness Street"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              value={gymFormData.city}
              onChange={handleGymFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              value={gymFormData.state}
              onChange={handleGymFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="State"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              value={gymFormData.zipCode}
              onChange={handleGymFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12345"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <SafeIcon icon={FiFileText} className="absolute left-3 top-3 text-gray-400" />
            <textarea
              id="description"
              name="description"
              rows="3"
              value={gymFormData.description}
              onChange={handleGymFormChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your gym..."
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleGymPrevious}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleGymNext}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next: Facilities
          </button>
        </div>
      </div>
    </motion.div>
  );

  const GymSignupStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <SafeIcon icon={FiBuilding} className="text-4xl text-blue-600 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gym Facilities</h2>
        <p className="text-gray-600">Step 3 of 3: What facilities does your gym offer?</p>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-gray-600">Select all facilities available at your gym:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gymFacilities.map((facility) => (
            <div
              key={facility.id}
              onClick={() => handleFacilityToggle(facility.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                gymFormData.selectedFacilities.includes(facility.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={gymFormData.selectedFacilities.includes(facility.id)}
                  onChange={() => handleFacilityToggle(facility.id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{facility.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong> {gymFormData.selectedFacilities.length} facilities
          </p>
        </div>

        <form onSubmit={handleGymSubmit}>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleGymPrevious}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Gym Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            {/* Account Type Selection */}
            {accountType === null && <AccountTypeSelector />}

            {/* User Signup Form */}
            {accountType === 'user' && <UserSignupForm />}

            {/* Trainer Signup Multi-Step */}
            {accountType === 'trainer' && currentStep === 1 && <TrainerSignupStep1 />}
            {accountType === 'trainer' && currentStep === 2 && <TrainerSignupStep2 />}
            {accountType === 'trainer' && currentStep === 3 && <TrainerSignupStep3 />}

            {/* Gym Signup Multi-Step */}
            {accountType === 'gym' && currentStep === 1 && <GymSignupStep1 />}
            {accountType === 'gym' && currentStep === 2 && <GymSignupStep2 />}
            {accountType === 'gym' && currentStep === 3 && <GymSignupStep3 />}
          </AnimatePresence>

          {/* Back to Account Type Selection */}
          {(accountType === 'user' || 
            (accountType === 'gym' && currentStep === 1) || 
            (accountType === 'trainer' && currentStep === 1)) && (
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setAccountType(null);
                  setCurrentStep(1);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                ← Choose different account type
              </button>
            </div>
          )}

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Progress Indicator for Multi-Step Signups */}
          {((accountType === 'gym') || (accountType === 'trainer')) && (
            <div className="mt-8">
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;