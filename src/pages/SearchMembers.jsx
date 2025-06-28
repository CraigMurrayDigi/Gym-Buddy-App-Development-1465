import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiMapPin, FiHome, FiUser, FiCalendar, FiActivity } = FiIcons;

const SearchMembers = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    gym: '',
    hasActiveWorkout: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { locations, gyms, searchMembers } = useData();
  const navigate = useNavigate();

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchFilters({
      ...searchFilters,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'location' && { gym: '' })
    });
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await searchMembers(searchFilters);
      if (error) {
        console.error('Search error:', error);
      } else {
        setSearchResults(data.filter(member => member.id !== user?.id));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableGyms = () => {
    if (!searchFilters.location) return [];
    return gyms.filter(gym => gym.location === searchFilters.location);
  };

  const viewMemberProfile = (memberId) => {
    navigate(`/member/${memberId}`);
  };

  useEffect(() => {
    if (searchFilters.location || searchFilters.gym) {
      handleSearch();
    }
  }, [searchFilters]);

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
          <SafeIcon icon={FiSearch} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Gym Members</h1>
          <p className="text-gray-600">Find workout partners in your area</p>
        </motion.div>

        {/* Search Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
                <select
                  id="location"
                  name="location"
                  value={searchFilters.location}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Locations</option>
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
                Gym
              </label>
              <div className="relative">
                <SafeIcon icon={FiHome} className="absolute left-3 top-3 text-gray-400" />
                <select
                  id="gym"
                  name="gym"
                  value={searchFilters.gym}
                  onChange={handleFilterChange}
                  disabled={!searchFilters.location}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                >
                  <option value="">All Gyms</option>
                  {getAvailableGyms().map((gym) => (
                    <option key={gym.id} value={gym.name}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hasActiveWorkout"
                  checked={searchFilters.hasActiveWorkout}
                  onChange={handleFilterChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Has Active Workouts
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiSearch} />
            <span>{loading ? 'Searching...' : 'Search Members'}</span>
          </button>
        </motion.div>

        {/* Search Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => viewMemberProfile(member.id)}
            >
              <div className="text-center mb-4">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {member.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <SafeIcon icon={FiMapPin} className="mr-1" />
                  {member.location}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <SafeIcon icon={FiHome} className="mr-2" />
                  <span className="text-sm">{member.gym}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <SafeIcon icon={FiActivity} className="mr-2" />
                  <span className="text-sm">
                    {member.workouts_gym2024?.filter(w => new Date(w.date) >= new Date()).length || 0} active workouts
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <SafeIcon icon={FiCalendar} className="mr-2" />
                  <span className="text-sm">
                    {member.workouts_gym2024?.length || 0} total workouts
                  </span>
                </div>
              </div>

              {member.workout_media_gym2024?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {member.workout_media_gym2024.length} media uploads
                  </div>
                  <div className="flex space-x-1">
                    {member.workout_media_gym2024.slice(0, 3).map((media, idx) => (
                      <div key={idx} className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <SafeIcon icon={FiActivity} className="text-blue-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    {member.workout_media_gym2024.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{member.workout_media_gym2024.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <span className="text-blue-600 font-medium text-sm">View Profile</span>
              </div>
            </motion.div>
          ))}
        </div>

        {searchResults.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <SafeIcon icon={FiUser} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters to find more members.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchMembers;