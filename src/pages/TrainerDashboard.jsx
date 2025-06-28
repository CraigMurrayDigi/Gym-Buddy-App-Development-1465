import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiAward, FiUsers, FiCalendar, FiDollarSign, FiMapPin, FiPhone, FiGlobe,
  FiMail, FiClock, FiBarChart3, FiSettings, FiCheckCircle, FiAlertCircle,
  FiX, FiSave, FiEdit3, FiPlus, FiStar, FiTrendingUp, FiActivity, FiTarget
} = FiIcons;

const TrainerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    businessName: '',
    bio: '',
    phone: '',
    website: '',
    instagram: '',
    hourlyRate: '',
    location: '',
    isAcceptingClients: true
  });

  useEffect(() => {
    if (!user || user.account_type !== 'personal_trainer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Initialize form data with current trainer data
    if (user?.trainer_data) {
      setSettingsFormData({
        businessName: user.trainer_data.businessName || '',
        bio: user.trainer_data.bio || '',
        phone: user.trainer_data.phone || '',
        website: user.trainer_data.website || '',
        instagram: user.trainer_data.instagram || '',
        hourlyRate: user.trainer_data.hourlyRate?.toString() || '',
        location: user.trainer_data.location || '',
        isAcceptingClients: user.trainer_data.isAcceptingClients ?? true
      });
    }
  }, [user]);

  if (!user || user.account_type !== 'personal_trainer') {
    return null;
  }

  // Mock trainer data - in real app this would come from the personal_trainers_gym2024 table
  const trainerData = user.trainer_data || {
    businessName: 'FitPro Training',
    specializations: ['Strength Training', 'Weight Loss'],
    certifications: ['NASM-CPT', 'CSCS'],
    experienceYears: 5,
    hourlyRate: 75.00,
    bio: 'Experienced personal trainer specializing in strength training and body transformation.',
    phone: '(555) 123-4567',
    location: 'New York',
    servicesOffered: ['Personal Training', 'Nutrition Coaching'],
    verified: false,
    isAcceptingClients: true
  };

  const stats = {
    totalClients: 12,
    monthlyRevenue: 3200,
    sessionsThisMonth: 48,
    averageRating: 4.8,
    totalSessions: 156,
    reviewCount: 24
  };

  const upcomingSessions = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      date: '2024-01-20',
      time: '09:00',
      type: 'Strength Training',
      status: 'confirmed'
    },
    {
      id: 2,
      clientName: 'Mike Chen',
      date: '2024-01-20',
      time: '11:00',
      type: 'Weight Loss Consultation',
      status: 'pending'
    },
    {
      id: 3,
      clientName: 'Emily Davis',
      date: '2024-01-20',
      time: '14:00',
      type: 'Personal Training',
      status: 'confirmed'
    }
  ];

  const recentReviews = [
    {
      id: 1,
      clientName: 'John Smith',
      rating: 5,
      comment: 'Amazing trainer! Helped me lose 20 pounds and gain so much strength.',
      date: '2024-01-15'
    },
    {
      id: 2,
      clientName: 'Lisa Rodriguez',
      rating: 5,
      comment: 'Very knowledgeable and supportive. Great workout plans!',
      date: '2024-01-12'
    },
    {
      id: 3,
      clientName: 'David Wilson',
      rating: 4,
      comment: 'Professional and punctual. Excellent form coaching.',
      date: '2024-01-10'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart3 },
    { id: 'sessions', label: 'Sessions', icon: FiCalendar },
    { id: 'clients', label: 'Clients', icon: FiUsers },
    { id: 'reviews', label: 'Reviews', icon: FiStar },
    { id: 'profile', label: 'Profile', icon: FiSettings }
  ];

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update user profile with new trainer data
      const updatedTrainerData = {
        ...user.trainer_data,
        ...settingsFormData,
        hourlyRate: parseFloat(settingsFormData.hourlyRate) || null
      };

      const { error } = await updateProfile({
        trainer_data: updatedTrainerData
      });

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully!');
        setShowSettingsModal(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const openSettingsModal = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    // Reset form data to current values
    if (user?.trainer_data) {
      setSettingsFormData({
        businessName: user.trainer_data.businessName || '',
        bio: user.trainer_data.bio || '',
        phone: user.trainer_data.phone || '',
        website: user.trainer_data.website || '',
        instagram: user.trainer_data.instagram || '',
        hourlyRate: user.trainer_data.hourlyRate?.toString() || '',
        location: user.trainer_data.location || '',
        isAcceptingClients: user.trainer_data.isAcceptingClients ?? true
      });
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <SafeIcon icon={FiSettings} className="mr-3" />
              Update Trainer Profile
            </h2>
            <button
              onClick={closeSettingsModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={settingsFormData.businessName}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your training business name"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={settingsFormData.location}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio / About You
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={settingsFormData.bio}
                onChange={handleSettingsChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your training philosophy and experience..."
              />
            </div>

            {/* Contact & Rates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Rates</h3>
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
                      value={settingsFormData.hourlyRate}
                      onChange={handleSettingsChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="75.00"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={settingsFormData.phone}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={settingsFormData.website}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yoursite.com"
                  />
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
                      value={settingsFormData.instagram}
                      onChange={handleSettingsChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAcceptingClients"
                name="isAcceptingClients"
                checked={settingsFormData.isAcceptingClients}
                onChange={handleSettingsChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isAcceptingClients" className="text-sm font-medium text-gray-700">
                I am currently accepting new clients
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={closeSettingsModal}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiSave} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mr-3" />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">{trainerData.businessName || user.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Personal Trainer Dashboard</span>
                {trainerData.verified ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <SafeIcon icon={FiCheckCircle} className="text-sm" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <SafeIcon icon={FiAlertCircle} className="text-sm" />
                    <span className="text-xs font-medium">Pending Verification</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiUsers} className="text-3xl text-blue-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
            <div className="text-gray-600">Active Clients</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiDollarSign} className="text-3xl text-green-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.monthlyRevenue)}</div>
            <div className="text-gray-600">Monthly Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiActivity} className="text-3xl text-purple-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-purple-600">{stats.sessionsThisMonth}</div>
            <div className="text-gray-600">Sessions This Month</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiStar} className="text-3xl text-orange-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-orange-600">{stats.averageRating}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Trainer Profile Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
                      <button
                        onClick={openSettingsModal}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiEdit3} className="text-sm" />
                        <span className="text-sm">Edit</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">{trainerData.businessName}</p>
                        <p className="text-sm text-gray-600">{trainerData.bio}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatPrice(trainerData.hourlyRate)}/hour</span>
                        <span>{trainerData.location}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          trainerData.isAcceptingClients 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trainerData.isAcceptingClients ? 'Accepting Clients' : 'Not Accepting'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trainerData.specializations.map((spec, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                        <div className="text-sm text-gray-600">Total Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.reviewCount}</div>
                        <div className="text-sm text-gray-600">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{trainerData.experienceYears}</div>
                        <div className="text-sm text-gray-600">Years Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{trainerData.certifications.length}</div>
                        <div className="text-sm text-gray-600">Certifications</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Sessions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {formatTime(session.time)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{session.clientName}</p>
                            <p className="text-sm text-gray-600">{session.type}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8"
              >
                <SafeIcon icon={FiCalendar} className="text-6xl text-gray-300 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Management</h3>
                <p className="text-gray-600 mb-6">
                  Manage your training sessions, view upcoming appointments, and track client progress.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  View All Sessions
                </button>
              </motion.div>
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8"
              >
                <SafeIcon icon={FiUsers} className="text-6xl text-gray-300 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Management</h3>
                <p className="text-gray-600 mb-6">
                  View your client list, track their progress, and manage training programs.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Manage Clients
                </button>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Client Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiStar} className="text-yellow-400" />
                    <span className="text-xl font-bold">{stats.averageRating}</span>
                    <span className="text-gray-600">({stats.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                            {review.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.clientName}</p>
                            <div className="flex items-center space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <SafeIcon key={i} icon={FiStar} className="text-yellow-400 text-sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Professional Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Experience</p>
                        <p className="text-gray-900">{trainerData.experienceYears} years</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Specializations</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {trainerData.specializations.map((spec, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Certifications</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {trainerData.certifications.map((cert, index) => (
                            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Services Offered</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {trainerData.servicesOffered.map((service, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Contact & Settings</h3>
                      <button
                        onClick={openSettingsModal}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <SafeIcon icon={FiEdit3} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiMapPin} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Location</p>
                          <p className="text-gray-600">{trainerData.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiDollarSign} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Hourly Rate</p>
                          <p className="text-gray-600">{formatPrice(trainerData.hourlyRate)}</p>
                        </div>
                      </div>
                      {trainerData.phone && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiPhone} className="text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Phone</p>
                            <p className="text-gray-600">{trainerData.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiTarget} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Accepting Clients</p>
                          <p className={`text-sm ${trainerData.isAcceptingClients ? 'text-green-600' : 'text-red-600'}`}>
                            {trainerData.isAcceptingClients ? 'Yes, accepting new clients' : 'Not accepting new clients'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Verification Notice */}
        {!trainerData.verified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiAlertCircle} className="text-2xl text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-orange-800">Trainer Verification Pending</h3>
                <p className="text-orange-700">
                  Your trainer profile is currently under review. You'll receive an email notification once verified. 
                  Verified trainers get access to premium features and increased visibility to potential clients.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && <SettingsModal />}
    </div>
  );
};

export default TrainerDashboard;