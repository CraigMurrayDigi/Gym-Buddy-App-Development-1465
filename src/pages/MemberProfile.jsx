import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMapPin, FiHome, FiActivity, FiCalendar, FiMessageCircle, FiImage, FiVideo, FiArrowLeft } = FiIcons;

const MemberProfile = () => {
  const [member, setMember] = useState(null);
  const [memberWorkouts, setMemberWorkouts] = useState([]);
  const [memberMedia, setMemberMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  
  const { memberId } = useParams();
  const { user } = useAuth();
  const { startChat } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberProfile();
  }, [memberId]);

  const fetchMemberProfile = async () => {
    setLoading(true);
    try {
      // Check if supabase is properly configured
      if (!supabase || typeof supabase.from !== 'function') {
        console.log('Supabase not properly configured, using demo data');
        // Use demo data for profile
        setMember({
          id: memberId,
          name: 'Demo User',
          location: 'New York',
          gym: 'Fitness First NYC',
          created_at: new Date().toISOString()
        });
        setMemberWorkouts([]);
        setMemberMedia([]);
        setLoading(false);
        return;
      }

      // Fetch member profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles_gym2024')
        .select('*')
        .eq('id', memberId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setMember(profileData);
      } else {
        // Fallback to demo data if no profile found
        setMember({
          id: memberId,
          name: 'Demo User',
          location: 'New York',
          gym: 'Fitness First NYC',
          created_at: new Date().toISOString()
        });
      }

      // Fetch member workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts_gym2024')
        .select('*')
        .eq('user_id', memberId)
        .order('date', { ascending: false });

      if (workoutsError && workoutsError.code !== 'PGRST116') {
        console.error('Error fetching workouts:', workoutsError);
      }

      setMemberWorkouts(workoutsData || []);

      // Fetch member media
      const { data: mediaData, error: mediaError } = await supabase
        .from('workout_media_gym2024')
        .select('*')
        .eq('user_id', memberId)
        .order('created_at', { ascending: false });

      if (mediaError && mediaError.code !== 'PGRST116') {
        console.error('Error fetching media:', mediaError);
      }

      setMemberMedia(mediaData || []);

    } catch (error) {
      console.error('Error fetching member profile:', error);
      // Set demo data on error
      setMember({
        id: memberId,
        name: 'Demo User',
        location: 'New York',
        gym: 'Fitness First NYC',
        created_at: new Date().toISOString()
      });
      setMemberWorkouts([]);
      setMemberMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const { chat, error } = await startChat([user.id, memberId]);
      if (error) {
        toast.error('Failed to start chat');
      } else {
        navigate(`/chat/${memberId}`);
      }
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const getFilteredMedia = () => {
    if (selectedMediaType === 'all') return memberMedia;
    return memberMedia.filter(media => media.type === selectedMediaType);
  };

  const getActiveWorkouts = () => {
    return memberWorkouts.filter(workout => new Date(workout.date) >= new Date());
  };

  const getCompletedWorkouts = () => {
    return memberWorkouts.filter(workout => new Date(workout.date) < new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading member profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <SafeIcon icon={FiUser} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Member not found</h2>
            <button
              onClick={() => navigate('/search-members')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/search-members')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Search</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center mb-6">
              <div className="bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {member.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-600">Member since {new Date(member.created_at).toLocaleDateString()}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMapPin} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{member.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiHome} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Primary Gym</p>
                  <p className="text-gray-600">{member.gym}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getActiveWorkouts().length}
                </div>
                <div className="text-sm text-gray-600">Active Workouts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getCompletedWorkouts().length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>

            {/* Actions */}
            {user && user.id !== memberId && (
              <button
                onClick={handleStartChat}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiMessageCircle} />
                <span>Start Chat</span>
              </button>
            )}
          </motion.div>

          {/* Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Workouts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiActivity} className="mr-2" />
                Active Workouts
              </h2>
              
              {getActiveWorkouts().length > 0 ? (
                <div className="space-y-3">
                  {getActiveWorkouts().map((workout) => (
                    <div key={workout.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                      <h3 className="font-semibold text-gray-900">{workout.type}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <SafeIcon icon={FiCalendar} className="mr-1" />
                        {new Date(workout.date).toLocaleDateString()} at {workout.time}
                      </p>
                      <p className="text-sm text-gray-500">{workout.gym}</p>
                      {workout.notes && (
                        <p className="text-sm text-gray-600 mt-1">{workout.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No active workouts scheduled</p>
              )}
            </motion.div>

            {/* Workout Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <SafeIcon icon={FiImage} className="mr-2" />
                  Workout Media ({memberMedia.length})
                </h2>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMediaType('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedMediaType === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedMediaType('image')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedMediaType === 'image'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Images
                  </button>
                  <button
                    onClick={() => setSelectedMediaType('video')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedMediaType === 'video'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Videos
                  </button>
                </div>
              </div>

              {getFilteredMedia().length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getFilteredMedia().map((media) => (
                    <div key={media.id} className="group relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                          <SafeIcon icon={FiVideo} className="text-4xl text-blue-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                        <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-sm font-medium truncate">{media.title}</p>
                          <p className="text-xs">
                            {new Date(media.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={selectedMediaType === 'video' ? FiVideo : FiImage} className="text-4xl text-gray-300 mb-2 mx-auto" />
                  <p className="text-gray-600">
                    No {selectedMediaType === 'all' ? 'media' : selectedMediaType + 's'} uploaded yet
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;