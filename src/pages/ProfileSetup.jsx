import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiHome, FiCheck } = FiIcons;

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    location: '',
    gym: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { user, updateProfile } = useAuth();
  const { locations, gyms } = useData();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'location' && { gym: '' }) // Reset gym when location changes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await updateProfile({
        ...formData,
        profile_complete: true
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success('Profile setup completed!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableGyms = () => {
    if (!formData.location) return [];
    return gyms.filter(gym => 
      gym.locations_gym2024?.name === formData.location
    );
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
            <SafeIcon icon={FiCheck} className="text-4xl text-green-600 mb-4 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600">Let's set up your location and gym preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
                <select
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select your location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="gym" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Gym
              </label>
              <div className="relative">
                <SafeIcon icon={FiHome} className="absolute left-3 top-3 text-gray-400" />
                <select
                  id="gym"
                  name="gym"
                  required
                  value={formData.gym}
                  onChange={handleChange}
                  disabled={!formData.location}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {formData.location ? 'Select your gym' : 'Select location first'}
                  </option>
                  {getAvailableGyms().map((gym) => (
                    <option key={gym.id} value={gym.name}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.location || !formData.gym}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;