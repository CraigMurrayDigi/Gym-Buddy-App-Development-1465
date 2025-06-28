import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiCalendar, FiClock, FiMapPin, FiActivity, FiUserPlus, FiMessageCircle, FiUser, FiHeart, FiTarget, FiStar, FiInfo } = FiIcons;

const FindBuddies = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);

  const { user } = useAuth();
  const { workouts, joinWorkout, startChat } = useData();
  const navigate = useNavigate();

  const availableWorkouts = workouts.filter(workout => 
    workout.user_id !== user.id && 
    new Date(workout.date) >= new Date() &&
    (selectedFilter === 'all' || 
     workout.location === user.location || 
     workout.type.toLowerCase() === selectedFilter.toLowerCase()) &&
    (experienceFilter === 'all' || workout.experience_level === experienceFilter) &&
    (intensityFilter === 'all' || workout.intensity_level === intensityFilter) &&
    (!beginnerFriendlyOnly || workout.is_beginner_friendly)
  );

  const handleJoinWorkout = async (workout) => {
    try {
      await joinWorkout(workout.id, user.id, user.name);
      toast.success('Joined workout successfully!');
      
      // Start a chat with the workout creator
      await startChat([user.id, workout.user_id]);
      navigate(`/chat/${workout.user_id}`);
    } catch (error) {
      toast.error('Failed to join workout');
    }
  };

  const handleViewProfile = (userId, e) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const filterOptions = [
    { value: 'all', label: 'All Workouts' },
    { value: user.location, label: 'My Location' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength training', label: 'Strength' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'hiit', label: 'HIIT' }
  ];

  const experienceOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const intensityOptions = [
    { value: 'all', label: 'All Intensities' },
    { value: 'low', label: 'Low Intensity' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High Intensity' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  const getExperienceColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalIcons = (goals) => {
    const goalIconMap = {
      weight_loss: '🎯',
      muscle_building: '💪',
      endurance: '🏃',
      strength: '🏋️',
      flexibility: '🧘',
      stress_relief: '😌',
      social: '👥',
      fun: '🎉'
    };
    
    return goals?.slice(0, 3).map(goal => goalIconMap[goal] || '💪').join(' ') || '💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <SafeIcon icon={FiUsers} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Workout Buddy</h1>
          <p className="text-gray-600">Connect with like-minded fitness enthusiasts and make working out social</p>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Workouts</h2>
          
          {/* Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Workout Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workout Type</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExperienceFilter(option.value)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                      experienceFilter === option.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
              <div className="flex flex-wrap gap-2">
                {intensityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setIntensityFilter(option.value)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                      intensityFilter === option.value
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Special Filter */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={beginnerFriendlyOnly}
                onChange={(e) => setBeginnerFriendlyOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiHeart} className="text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Show only beginner-friendly workouts</span>
              </div>
            </label>
          </div>

          {/* Results Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">
                Found <strong>{availableWorkouts.length}</strong> workout{availableWorkouts.length !== 1 ? 's' : ''} matching your criteria
              </span>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setExperienceFilter('all');
                  setIntensityFilter('all');
                  setBeginnerFriendlyOnly(false);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Workouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableWorkouts.length > 0 ? (
            availableWorkouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Header with workout type and badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    workout.type === 'Yoga' ? 'bg-purple-100 text-purple-800' :
                    workout.type === 'Cardio' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {workout.type}
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    {workout.is_beginner_friendly && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <SafeIcon icon={FiHeart} className="text-xs" />
                        <span>Beginner Friendly</span>
                      </span>
                    )}
                    {workout.is_new_to_gym === 'yes' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        New to Gym
                      </span>
                    )}
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                    {workout.profiles_gym2024?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <button
                      onClick={(e) => handleViewProfile(workout.user_id, e)}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {workout.profiles_gym2024?.name || 'User'}
                    </button>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {workout.experience_level && (
                        <span className={`px-2 py-0.5 rounded-full ${getExperienceColor(workout.experience_level)}`}>
                          {workout.experience_level}
                        </span>
                      )}
                      {workout.intensity_level && (
                        <span className={`px-2 py-0.5 rounded-full ${getIntensityColor(workout.intensity_level)}`}>
                          {workout.intensity_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workout Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <SafeIcon icon={FiCalendar} className="mr-2" />
                    <span className="text-sm">{formatDate(workout.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <SafeIcon icon={FiClock} className="mr-2" />
                    <span className="text-sm">{formatTime(workout.time)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <SafeIcon icon={FiMapPin} className="mr-2" />
                    <span className="text-sm">{workout.gym}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <SafeIcon icon={FiActivity} className="mr-2" />
                    <span className="text-sm">{workout.location}</span>
                  </div>
                </div>

                {/* Goals */}
                {workout.workout_goals && workout.workout_goals.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiTarget} className="text-blue-600" />
                      <span>Goals:</span>
                      <span className="text-lg">{getGoalIcons(workout.workout_goals)}</span>
                    </div>
                  </div>
                )}

                {/* Workout Description */}
                {workout.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{workout.notes}</p>
                  </div>
                )}

                {/* Buddy Description */}
                {workout.buddy_description && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <SafeIcon icon={FiInfo} className="text-blue-600 text-sm" />
                      <span className="text-sm font-medium text-blue-800">About this workout buddy:</span>
                    </div>
                    <p className="text-sm text-blue-700">{workout.buddy_description}</p>
                  </div>
                )}

                {/* Special Notes */}
                {workout.special_notes && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700 italic">"{workout.special_notes}"</p>
                  </div>
                )}

                {/* Participants and Max */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    {workout.workout_participants_gym2024?.length || 0} joined
                    {workout.max_participants && workout.max_participants !== 'unlimited' && (
                      <span> / {parseInt(workout.max_participants) - 1} max</span>
                    )}
                  </div>
                  
                  {workout.buddy_preferences && workout.buddy_preferences.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiUsers} className="text-gray-400 text-sm" />
                      <span className="text-xs text-gray-500">
                        Looking for: {workout.buddy_preferences.slice(0, 2).join(', ').replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Equipment needed */}
                {workout.equipment_needed && workout.equipment_needed.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Equipment needed:</div>
                    <div className="flex flex-wrap gap-1">
                      {workout.equipment_needed.slice(0, 3).map((equipment, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {equipment.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleJoinWorkout(workout)}
                  disabled={workout.max_participants && 
                           workout.max_participants !== 'unlimited' && 
                           (workout.workout_participants_gym2024?.length || 0) >= (parseInt(workout.max_participants) - 1)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiUserPlus} />
                  <span>
                    {workout.max_participants && 
                     workout.max_participants !== 'unlimited' && 
                     (workout.workout_participants_gym2024?.length || 0) >= (parseInt(workout.max_participants) - 1)
                      ? 'Workout Full' 
                      : 'Join Workout'}
                  </span>
                </button>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="col-span-full text-center py-12"
            >
              <SafeIcon icon={FiUsers} className="text-6xl text-gray-300 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-600 mb-6">
                There are no available workouts matching your criteria. Try adjusting your filters or check back later.
              </p>
              <button
                onClick={() => navigate('/schedule')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Schedule Your Own Workout
              </button>
            </motion.div>
          )}
        </div>

        {/* Help Section */}
        {availableWorkouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
          >
            <div className="text-center">
              <SafeIcon icon={FiHeart} className="text-3xl text-blue-600 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">New to working out?</h3>
              <p className="text-gray-600 mb-4">
                Look for workouts marked as "Beginner Friendly" - these hosts are especially welcoming and supportive!
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiHeart} className="text-yellow-600" />
                  <span>Beginner Friendly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">New to Gym</span>
                  <span>First time at this gym</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FindBuddies;