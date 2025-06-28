import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMapPin, FiHome, FiEdit2, FiSave, FiX } = FiIcons;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    gym: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const { locations, gyms, workouts } = useData();

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        gym: user.gym || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      // Reset gym when location changes
      ...(name === 'location' && { gym: '' })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      location: user.location || '',
      gym: user.gym || ''
    });
    setIsEditing(false);
  };

  const userWorkouts = workouts.filter(workout => workout.user_id === user?.id) || [];
  const totalBuddies = userWorkouts.reduce((total, workout) => 
    total + (workout.workout_participants_gym2024?.length || 0), 0
  );

  const availableGyms = formData.location 
    ? gyms.filter(gym => gym.locations_gym2024?.name === formData.location)
    : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <SafeIcon icon={FiUser} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h2>
            <p className="text-gray-600">You need to be signed in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white text-blue-600 w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <p className="text-blue-100 flex items-center mt-1">
                    <SafeIcon icon={FiMapPin} className="mr-1" />
                    {user?.location || 'No location set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={isEditing ? FiX : FiEdit2} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                    >
                      <option value="">
                        {formData.location ? 'Select your gym' : 'Select location first'}
                      </option>
                      {availableGyms.map((gym) => (
                        <option key={gym.id} value={gym.name}>
                          {gym.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Profile Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <SafeIcon icon={FiUser} className="text-blue-600" />
                      <span className="font-medium text-gray-700">Full Name</span>
                    </div>
                    <p className="text-gray-900 text-lg">{user?.name || 'Not set'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <SafeIcon icon={FiMapPin} className="text-blue-600" />
                      <span className="font-medium text-gray-700">Location</span>
                    </div>
                    <p className="text-gray-900 text-lg">{user?.location || 'Not set'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-2">
                      <SafeIcon icon={FiHome} className="text-blue-600" />
                      <span className="font-medium text-gray-700">Preferred Gym</span>
                    </div>
                    <p className="text-gray-900 text-lg">{user?.gym || 'Not set'}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {userWorkouts.length}
                    </div>
                    <div className="text-gray-600">Workouts Scheduled</div>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {totalBuddies}
                    </div>
                    <div className="text-gray-600">Workout Buddies</div>
                  </div>

                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {user?.role?.toUpperCase() || 'USER'}
                    </div>
                    <div className="text-gray-600">Account Type</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;