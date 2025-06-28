import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiUsers, FiMessageCircle, FiPlus, FiClock, FiMapPin, FiActivity, FiUser, FiX } = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { workouts, chats } = useData();
  const navigate = useNavigate();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  useEffect(() => {
    // Redirect gym owners to their dashboard
    if (user?.account_type === 'gym_owner') {
      navigate('/gym-dashboard');
      return;
    }

    if (user && !user.profile_complete) {
      navigate('/profile-setup');
    }
  }, [user, navigate]);

  // Don't render anything if user is gym owner (will redirect)
  if (user?.account_type === 'gym_owner') {
    return null;
  }

  if (!user?.profile_complete) {
    return null;
  }

  const userWorkouts = workouts.filter(workout => workout.user_id === user.id);
  const upcomingWorkouts = userWorkouts.filter(workout =>
    new Date(workout.date) >= new Date()
  ).slice(0, 3);

  const quickActions = [
    {
      title: 'Schedule Workout',
      description: 'Plan your next gym session',
      icon: FiCalendar,
      link: '/schedule',
      color: 'bg-blue-500'
    },
    {
      title: 'Find Buddies',
      description: 'Discover workout partners',
      icon: FiUsers,
      link: '/find-buddies',
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Chat with your buddies',
      icon: FiMessageCircle,
      link: '/chat',
      color: 'bg-purple-500'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const handleViewProfile = (userId, e) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const WorkoutModal = ({ workout, onClose }) => {
    if (!workout) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Workout Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiActivity} className="text-blue-600" />
                <span className="font-semibold text-blue-800">{workout.type}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCalendar} className="text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Date</div>
                  <div className="text-gray-600">{formatDate(workout.date)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiClock} className="text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Time</div>
                  <div className="text-gray-600">{formatTime(workout.time)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMapPin} className="text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Location</div>
                  <div className="text-gray-600">{workout.gym}</div>
                  <div className="text-sm text-gray-500">{workout.location}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiUsers} className="text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Participants</div>
                  <div className="text-gray-600">
                    {workout.workout_participants_gym2024?.length || 0} joined
                  </div>
                </div>
              </div>
            </div>

            {workout.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">Notes</div>
                <div className="text-gray-600">{workout.notes}</div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Link
                to={`/find-buddies`}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Find Buddies
              </Link>
              <Link
                to={`/schedule`}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                Edit Workout
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}! 💪
              </h1>
              <p className="text-gray-600 flex items-center">
                <SafeIcon icon={FiMapPin} className="mr-2" />
                {user.location} • {user.gym}
              </p>
              {user.role === 'admin' && (
                <div className="mt-2">
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                    Administrator
                  </span>
                </div>
              )}
            </div>
            <Link
              to="/schedule"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} />
              <span>Schedule Workout</span>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
                >
                  <div className={`${action.color} text-white p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform`}>
                    <SafeIcon icon={action.icon} className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Workouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Workouts</h2>
            <div className="space-y-4">
              {upcomingWorkouts.length > 0 ? (
                upcomingWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className="border-l-4 border-blue-500 pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded-r-lg transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{workout.type}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <SafeIcon icon={FiClock} className="mr-1" />
                      {new Date(workout.date).toLocaleDateString()} at {workout.time}
                    </p>
                    <p className="text-sm text-gray-500">{workout.gym}</p>
                    <p className="text-xs text-blue-600 mt-1">Click for details</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiCalendar} className="text-4xl text-gray-300 mb-4 mx-auto" />
                  <p className="text-gray-500 mb-4">No upcoming workouts</p>
                  <Link
                    to="/schedule"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Schedule your first workout
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {userWorkouts.length}
            </div>
            <div className="text-gray-600">Total Workouts Scheduled</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {userWorkouts.reduce((total, workout) => 
                total + (workout.workout_participants_gym2024?.length || 0), 0
              )}
            </div>
            <div className="text-gray-600">Workout Buddies Connected</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {chats.length}
            </div>
            <div className="text-gray-600">Active Conversations</div>
          </div>
        </motion.div>
      </div>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <WorkoutModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;