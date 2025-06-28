import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import StripeConnectCard from '../components/StripeConnectCard';
import MembershipPlanCard from '../components/MembershipPlanCard';
import PlanFormModal from '../components/PlanFormModal';
import * as FiIcons from 'react-icons/fi';

const { FiBuilding, FiUsers, FiCalendar, FiDollarSign, FiMapPin, FiPhone, FiGlobe, FiMail, FiClock, FiBarChart3, FiSettings, FiCheckCircle, FiAlertCircle, FiX, FiSave, FiEdit3, FiPlus, FiCreditCard } = FiIcons;

const GymDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { 
    stripeAccount, 
    membershipPlans, 
    loading: stripeLoading,
    connectStripeAccount,
    disconnectStripeAccount,
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan
  } = useStripe();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    businessName: '',
    businessEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    if (!user || user.account_type !== 'gym_owner') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Initialize form data with current gym data
    if (user?.gym_data) {
      setSettingsFormData({
        businessName: user.gym_data.businessName || '',
        businessEmail: user.gym_data.businessEmail || '',
        phone: user.gym_data.phone || '',
        address: user.gym_data.address || '',
        city: user.gym_data.city || '',
        state: user.gym_data.state || '',
        zipCode: user.gym_data.zipCode || '',
        website: user.gym_data.website || '',
        description: user.gym_data.description || ''
      });
    }
  }, [user]);

  if (!user || user.account_type !== 'gym_owner') {
    return null;
  }

  // Mock gym data - in real app this would come from the gym_accounts_gym2024 table
  const gymData = user.gym_data || {
    businessName: 'Demo Fitness Center',
    businessEmail: 'gym@example.com',
    phone: '(555) 123-4567',
    address: '123 Fitness Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    website: 'https://demofitness.com',
    description: 'A modern fitness center with state-of-the-art equipment',
    verified: false
  };

  const stats = {
    totalMembers: 245,
    monthlyRevenue: 15420,
    activeWorkouts: 12,
    membershipPlans: membershipPlans.length
  };

  const recentMembers = [
    { id: 1, name: 'John Doe', joinDate: '2024-01-15', plan: 'Premium' },
    { id: 2, name: 'Jane Smith', joinDate: '2024-01-14', plan: 'Basic' },
    { id: 3, name: 'Mike Johnson', joinDate: '2024-01-13', plan: 'Premium' },
    { id: 4, name: 'Sarah Wilson', joinDate: '2024-01-12', plan: 'Basic' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart3 },
    { id: 'members', label: 'Members', icon: FiUsers },
    { id: 'plans', label: 'Plans', icon: FiDollarSign },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile with new gym data
      const updatedGymData = {
        ...user.gym_data,
        ...settingsFormData
      };

      const { error } = await updateProfile({
        gym_data: updatedGymData
      });

      if (error) {
        toast.error('Failed to update settings');
      } else {
        toast.success('Settings updated successfully!');
        setShowSettingsModal(false);
      }
    } catch (error) {
      toast.error('Failed to update settings');
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
    if (user?.gym_data) {
      setSettingsFormData({
        businessName: user.gym_data.businessName || '',
        businessEmail: user.gym_data.businessEmail || '',
        phone: user.gym_data.phone || '',
        address: user.gym_data.address || '',
        city: user.gym_data.city || '',
        state: user.gym_data.state || '',
        zipCode: user.gym_data.zipCode || '',
        website: user.gym_data.website || '',
        description: user.gym_data.description || ''
      });
    }
  };

  const handleConnectStripe = async () => {
    const result = await connectStripeAccount();
    if (result.success) {
      // Update user profile to mark Stripe as connected
      await updateProfile({
        gym_data: {
          ...user.gym_data,
          stripe_connected: true
        }
      });
    }
  };

  const handleDisconnectStripe = async () => {
    const result = await disconnectStripeAccount();
    if (result.success) {
      // Update user profile to mark Stripe as disconnected
      await updateProfile({
        gym_data: {
          ...user.gym_data,
          stripe_connected: false
        }
      });
    }
  };

  const handleCreatePlan = () => {
    if (!stripeAccount) {
      toast.error('Please connect your Stripe account first to create membership plans');
      return;
    }
    setEditingPlan(null);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handlePlanSubmit = async (planData) => {
    if (editingPlan) {
      await updateMembershipPlan(editingPlan.id, planData);
    } else {
      await createMembershipPlan(planData);
    }
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      await deleteMembershipPlan(planId);
    }
  };

  const SettingsModal = () => (
    <AnimatePresence>
      {showSettingsModal && (
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
                  Update Gym Settings
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
                        Business Name *
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiBuilding} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          id="businessName"
                          name="businessName"
                          type="text"
                          required
                          value={settingsFormData.businessName}
                          onChange={handleSettingsChange}
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
                          value={settingsFormData.businessEmail}
                          onChange={handleSettingsChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="business@gym.com"
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
                          value={settingsFormData.phone}
                          onChange={handleSettingsChange}
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
                          value={settingsFormData.website}
                          onChange={handleSettingsChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://yourgym.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          id="address"
                          name="address"
                          type="text"
                          required
                          value={settingsFormData.address}
                          onChange={handleSettingsChange}
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
                          value={settingsFormData.city}
                          onChange={handleSettingsChange}
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
                          value={settingsFormData.state}
                          onChange={handleSettingsChange}
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
                          value={settingsFormData.zipCode}
                          onChange={handleSettingsChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={settingsFormData.description}
                    onChange={handleSettingsChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your gym..."
                  />
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
      )}
    </AnimatePresence>
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
            <SafeIcon icon={FiBuilding} className="text-4xl text-blue-600 mr-3" />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">{gymData.businessName}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Gym Dashboard</span>
                {gymData.verified ? (
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
            <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
            <div className="text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiDollarSign} className="text-3xl text-green-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-gray-600">Monthly Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiCalendar} className="text-3xl text-purple-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-purple-600">{stats.activeWorkouts}</div>
            <div className="text-gray-600">Active Workouts</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <SafeIcon icon={FiCreditCard} className="text-3xl text-orange-600 mb-2 mx-auto" />
            <div className="text-2xl font-bold text-orange-600">{stats.membershipPlans}</div>
            <div className="text-gray-600">Membership Plans</div>
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
                  {/* Gym Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Gym Information</h3>
                      <button
                        onClick={openSettingsModal}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiEdit3} className="text-sm" />
                        <span className="text-sm">Edit</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiBuilding} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{gymData.businessName}</p>
                          <p className="text-sm text-gray-600">{gymData.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiMapPin} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-sm text-gray-600">
                            {gymData.address}, {gymData.city}, {gymData.state} {gymData.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiPhone} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{gymData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiMail} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Business Email</p>
                          <p className="text-sm text-gray-600">{gymData.businessEmail}</p>
                        </div>
                      </div>
                      {gymData.website && (
                        <div className="flex items-center space-x-3">
                          <SafeIcon icon={FiGlobe} className="text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Website</p>
                            <a
                              href={gymData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {gymData.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Members */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Members</h3>
                    <div className="space-y-3">
                      {recentMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">Joined {member.joinDate}</p>
                            </div>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {member.plan}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8"
              >
                <SafeIcon icon={FiUsers} className="text-6xl text-gray-300 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Member Management</h3>
                <p className="text-gray-600 mb-6">
                  Manage your gym members, view their profiles, and track membership status.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  View All Members
                </button>
              </motion.div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Stripe Connection */}
                <StripeConnectCard
                  stripeAccount={stripeAccount}
                  onConnect={handleConnectStripe}
                  onDisconnect={handleDisconnectStripe}
                  loading={stripeLoading}
                />

                {stripeAccount && (
                  <>
                    {/* Plans Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Membership Plans</h3>
                        <p className="text-gray-600">Create and manage your gym's membership plans</p>
                      </div>
                      <button
                        onClick={handleCreatePlan}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <SafeIcon icon={FiPlus} />
                        <span>Add Plan</span>
                      </button>
                    </div>

                    {/* Plans Grid */}
                    {membershipPlans.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {membershipPlans.map((plan) => (
                          <MembershipPlanCard
                            key={plan.id}
                            plan={plan}
                            onEdit={handleEditPlan}
                            onDelete={handleDeletePlan}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <SafeIcon icon={FiDollarSign} className="text-6xl text-gray-300 mb-4 mx-auto" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Membership Plans</h3>
                        <p className="text-gray-600 mb-6">
                          Create your first membership plan to start accepting payments from members.
                        </p>
                        <button
                          onClick={handleCreatePlan}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                        >
                          <SafeIcon icon={FiPlus} />
                          <span>Create Your First Plan</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-8"
              >
                <SafeIcon icon={FiSettings} className="text-6xl text-gray-300 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gym Settings</h3>
                <p className="text-gray-600 mb-6">
                  Update your gym information, operating hours, and business details.
                </p>
                <button
                  onClick={openSettingsModal}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Update Settings
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Verification Notice */}
        {!gymData.verified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiAlertCircle} className="text-2xl text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-orange-800">Account Verification Pending</h3>
                <p className="text-orange-700">
                  Your gym account is currently under review. You'll receive an email notification once verified.
                  Verified accounts get access to premium features and increased visibility.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <SettingsModal />
      <PlanFormModal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          setEditingPlan(null);
        }}
        onSubmit={handlePlanSubmit}
        plan={editingPlan}
        loading={stripeLoading}
      />
    </div>
  );
};

export default GymDashboard;