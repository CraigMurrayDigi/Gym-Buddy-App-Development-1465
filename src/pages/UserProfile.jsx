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

const { 
  FiUser, FiMapPin, FiHome, FiActivity, FiCalendar, FiMessageCircle, 
  FiImage, FiVideo, FiArrowLeft, FiUserPlus, FiClock, FiUsers, 
  FiCamera, FiEdit3, FiMail
} = FiIcons;

const UserProfile = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [hostedWorkouts, setHostedWorkouts] = useState([]);
  const [joinedWorkouts, setJoinedWorkouts] = useState([]);
  const [userMedia, setUserMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('workouts');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  
  const { userId } = useParams();
  const { user } = useAuth();
  const { startChat } = useData();
  const navigate = useNavigate();

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Demo data for when Supabase is not available
      const demoUsers = {
        'demo-user-12345': {
          id: 'demo-user-12345',
          name: 'Demo User',
          email: 'test@example.com',
          location: 'New York',
          gym: 'Fitness First NYC',
          profile_picture_url: null,
          created_at: new Date().toISOString(),
          role: 'user'
        },
        'admin-user-12345': {
          id: 'admin-user-12345',
          name: 'Admin User',
          email: 'admin@gymbuddy.com',
          location: 'New York',
          gym: 'Fitness First NYC',
          profile_picture_url: null,
          created_at: new Date().toISOString(),
          role: 'admin'
        }
      };

      // Check if Supabase is properly configured
      if (!supabase || typeof supabase.from !== 'function') {
        console.log('Supabase not properly configured, using demo data');
        const demoUser = demoUsers[userId] || demoUsers['demo-user-12345'];
        setProfileUser(demoUser);
        setHostedWorkouts([]);
        setJoinedWorkouts([]);
        setUserMedia([]);
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles_gym2024')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfileUser(profileData);
      } else {
        // Fallback to demo data if no profile found
        const demoUser = demoUsers[userId] || demoUsers['demo-user-12345'];
        setProfileUser(demoUser);
      }

      // Fetch hosted workouts
      const { data: hostedData, error: hostedError } = await supabase
        .from('workouts_gym2024')
        .select('*, workout_participants_gym2024(profiles_gym2024(id, name))')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (hostedError && hostedError.code !== 'PGRST116') {
        console.error('Error fetching hosted workouts:', hostedError);
      }
      setHostedWorkouts(hostedData || []);

      // Fetch joined workouts
      const { data: joinedData, error: joinedError } = await supabase
        .from('workout_participants_gym2024')
        .select(`
          *,
          workouts_gym2024(
            *,
            profiles_gym2024(name),
            workout_participants_gym2024(profiles_gym2024(id, name))
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (joinedError && joinedError.code !== 'PGRST116') {
        console.error('Error fetching joined workouts:', joinedError);
      }
      setJoinedWorkouts(joinedData || []);

      // Fetch user media
      const { data: mediaData, error: mediaError } = await supabase
        .from('workout_media_gym2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (mediaError && mediaError.code !== 'PGRST116') {
        console.error('Error fetching media:', mediaError);
      }
      setUserMedia(mediaData || []);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set demo data on error
      const demoUsers = {
        'demo-user-12345': {
          id: 'demo-user-12345',
          name: 'Demo User',
          email: 'test@example.com',
          location: 'New York',
          gym: 'Fitness First NYC',
          profile_picture_url: null,
          created_at: new Date().toISOString(),
          role: 'user'
        }
      };
      setProfileUser(demoUsers[userId] || demoUsers['demo-user-12345']);
      setHostedWorkouts([]);
      setJoinedWorkouts([]);
      setUserMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const { chat, error } = await startChat([user.id, userId]);
      if (error) {
        toast.error('Failed to start chat');
      } else {
        navigate(`/chat/${userId}`);
      }
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const getFilteredMedia = () => {
    if (selectedMediaType === 'all') return userMedia;
    return userMedia.filter(media => media.type === selectedMediaType);
  };

  const getActiveWorkouts = () => {
    return hostedWorkouts.filter(workout => new Date(workout.date) >= new Date());
  };

  const getCompletedWorkouts = () => {
    return hostedWorkouts.filter(workout => new Date(workout.date) < new Date());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <SafeIcon icon={FiUser} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Back
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
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center mb-6">
              {profileUser.profile_picture_url ? (
                <img
                  src={profileUser.profile_picture_url}
                  alt={profileUser.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="bg-blue-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {profileUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
              <p className="text-gray-600 flex items-center justify-center">
                <SafeIcon icon={FiMail} className="mr-1" />
                {profileUser.email}
              </p>
              <p className="text-gray-500 text-sm">
                Member since {formatDate(profileUser.created_at)}
              </p>
              
              {profileUser.role === 'admin' && (
                <div className="mt-2">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    Administrator
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMapPin} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{profileUser.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiHome} className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Primary Gym</p>
                  <p className="text-gray-600">{profileUser.gym}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {getActiveWorkouts().length}
                </div>
                <div className="text-xs text-gray-600">Active Workouts</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {joinedWorkouts.length}
                </div>
                <div className="text-xs text-gray-600">Joined</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {getCompletedWorkouts().length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {userMedia.length}
                </div>
                <div className="text-xs text-gray-600">Media</div>
              </div>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="space-y-3">
                <button
                  onClick={handleStartChat}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiMessageCircle} />
                  <span>Start Chat</span>
                </button>
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiEdit3} />
                <span>Edit Profile</span>
              </button>
            )}
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setSelectedTab('workouts')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === 'workouts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Workouts
                  </button>
                  <button
                    onClick={() => setSelectedTab('media')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === 'media'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Media ({userMedia.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Workouts Tab */}
                {selectedTab === 'workouts' && (
                  <div className="space-y-6">
                    {/* Active Workouts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <SafeIcon icon={FiActivity} className="mr-2" />
                        Active Workouts ({getActiveWorkouts().length})
                      </h3>
                      {getActiveWorkouts().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getActiveWorkouts().map((workout) => (
                            <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <h4 className="font-semibold text-gray-900">{workout.type}</h4>
                              <div className="flex items-center text-gray-600 mt-1">
                                <SafeIcon icon={FiCalendar} className="mr-1" />
                                <span className="text-sm">{formatDate(workout.date)} at {formatTime(workout.time)}</span>
                              </div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <SafeIcon icon={FiMapPin} className="mr-1" />
                                <span className="text-sm">{workout.gym}</span>
                              </div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <SafeIcon icon={FiUsers} className="mr-1" />
                                <span className="text-sm">{workout.workout_participants_gym2024?.length || 0} joined</span>
                              </div>
                              {workout.notes && (
                                <p className="text-sm text-gray-600 mt-2">{workout.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No active workouts</p>
                      )}
                    </div>

                    {/* Joined Workouts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <SafeIcon icon={FiUserPlus} className="mr-2" />
                        Joined Workouts ({joinedWorkouts.length})
                      </h3>
                      {joinedWorkouts.length > 0 ? (
                        <div className="space-y-3">
                          {joinedWorkouts.slice(0, 5).map((participant) => {
                            const workout = participant.workouts_gym2024;
                            return (
                              <div key={participant.id} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
                                <h4 className="font-semibold text-gray-900">{workout.type}</h4>
                                <div className="flex items-center text-gray-600 mt-1">
                                  <SafeIcon icon={FiCalendar} className="mr-1" />
                                  <span className="text-sm">{formatDate(workout.date)} at {formatTime(workout.time)}</span>
                                </div>
                                <p className="text-sm text-gray-500">Hosted by {workout.profiles_gym2024?.name}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-600">No joined workouts</p>
                      )}
                    </div>

                    {/* Completed Workouts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <SafeIcon icon={FiClock} className="mr-2" />
                        Completed Workouts ({getCompletedWorkouts().length})
                      </h3>
                      {getCompletedWorkouts().length > 0 ? (
                        <div className="space-y-3">
                          {getCompletedWorkouts().slice(0, 5).map((workout) => (
                            <div key={workout.id} className="border-l-4 border-gray-400 pl-4 py-2 bg-gray-50 rounded-r-lg">
                              <h4 className="font-semibold text-gray-900">{workout.type}</h4>
                              <div className="flex items-center text-gray-600 mt-1">
                                <SafeIcon icon={FiCalendar} className="mr-1" />
                                <span className="text-sm">{formatDate(workout.date)}</span>
                              </div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <SafeIcon icon={FiUsers} className="mr-1" />
                                <span className="text-sm">{workout.workout_participants_gym2024?.length || 0} participated</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No completed workouts</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Media Tab */}
                {selectedTab === 'media' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <SafeIcon icon={FiImage} className="mr-2" />
                        Workout Media ({userMedia.length})
                      </h3>
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
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                  {formatDate(media.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <SafeIcon
                          icon={selectedMediaType === 'video' ? FiVideo : FiImage}
                          className="text-6xl text-gray-300 mb-4 mx-auto"
                        />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          No {selectedMediaType === 'all' ? 'media' : selectedMediaType + 's'} found
                        </h4>
                        <p className="text-gray-600">
                          {isOwnProfile
                            ? 'Upload some workout photos and videos to share with the community!'
                            : `${profileUser.name} hasn't uploaded any ${selectedMediaType === 'all' ? 'media' : selectedMediaType + 's'} yet.`
                          }
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate('/upload-media')}
                            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                          >
                            <SafeIcon icon={FiCamera} />
                            <span>Upload Media</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;