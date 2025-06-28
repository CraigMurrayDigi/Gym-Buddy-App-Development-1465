import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiSearch, FiFilter, FiNavigation, FiPhone, FiGlobe, FiClock, FiUsers, FiStar, FiMap, FiList, FiRefreshCw, FiTarget, FiCompass } = FiIcons;

const GymDirectory = () => {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { locations, gyms: contextGyms } = useData();
  const navigate = useNavigate();

  // Comprehensive demo gym data - UPDATED WITH CORRECT IDs
  const DEMO_GYMS = [
    {
      id: 'gym-1', // ✅ Correct format
      name: 'Fitness First NYC',
      address: '123 Broadway, New York, NY 10001',
      phone: '(212) 555-0123',
      website: 'https://fitnessfirst.com',
      location: 'New York',
      rating: 4.5,
      reviewCount: 247,
      verified: true,
      memberCount: 850,
      amenities: ['Cardio Equipment', 'Weight Training', 'Group Classes', 'Locker Rooms', 'Sauna'],
      hours: {
        monday: '5:00 AM - 11:00 PM',
        tuesday: '5:00 AM - 11:00 PM',
        wednesday: '5:00 AM - 11:00 PM',
        thursday: '5:00 AM - 11:00 PM',
        friday: '5:00 AM - 10:00 PM',
        saturday: '6:00 AM - 9:00 PM',
        sunday: '7:00 AM - 8:00 PM'
      },
      plans: [
        { name: 'Basic', price: 29.99, period: 'month' },
        { name: 'Premium', price: 49.99, period: 'month' }
      ],
      description: 'Modern fitness center in the heart of Manhattan with state-of-the-art equipment.'
    },
    {
      id: 'gym-2', // ✅ Correct format
      name: 'Equinox Manhattan',
      address: '456 Fifth Avenue, New York, NY 10018',
      phone: '(212) 555-0456',
      website: 'https://equinox.com',
      location: 'New York',
      rating: 4.8,
      reviewCount: 412,
      verified: true,
      memberCount: 1200,
      amenities: ['Cardio Equipment', 'Weight Training', 'Personal Training', 'Spa Services', 'Pool'],
      hours: {
        monday: '5:00 AM - 12:00 AM',
        tuesday: '5:00 AM - 12:00 AM',
        wednesday: '5:00 AM - 12:00 AM',
        thursday: '5:00 AM - 12:00 AM',
        friday: '5:00 AM - 11:00 PM',
        saturday: '6:00 AM - 10:00 PM',
        sunday: '6:00 AM - 10:00 PM'
      },
      plans: [
        { name: 'All Access', price: 89.99, period: 'month' },
        { name: 'Destination', price: 149.99, period: 'month' }
      ],
      description: 'Luxury fitness club with premium amenities and expert personal training.'
    },
    {
      id: 'gym-3', // ✅ Correct format
      name: 'Planet Fitness Times Square',
      address: '789 Eighth Avenue, New York, NY 10019',
      phone: '(212) 555-0789',
      website: 'https://planetfitness.com',
      location: 'New York',
      rating: 4.2,
      reviewCount: 156,
      verified: true,
      memberCount: 650,
      amenities: ['Cardio Equipment', 'Weight Training', 'Locker Rooms', 'HydroMassage'],
      hours: {
        monday: '24 Hours',
        tuesday: '24 Hours',
        wednesday: '24 Hours',
        thursday: '24 Hours',
        friday: '24 Hours',
        saturday: '24 Hours',
        sunday: '24 Hours'
      },
      plans: [
        { name: 'Classic', price: 10.99, period: 'month' },
        { name: 'Black Card', price: 22.99, period: 'month' }
      ],
      description: 'Affordable 24/7 fitness with a judgment-free environment.'
    },
    {
      id: 'gym-4', // ✅ Correct format
      name: 'Gold\'s Gym Venice',
      address: '360 Hampton Drive, Venice, CA 90291',
      phone: '(310) 555-0360',
      website: 'https://goldsgym.com',
      location: 'Los Angeles',
      rating: 4.6,
      reviewCount: 328,
      verified: true,
      memberCount: 950,
      amenities: ['Cardio Equipment', 'Weight Training', 'Outdoor Training', 'Boxing Ring'],
      hours: {
        monday: '4:00 AM - 12:00 AM',
        tuesday: '4:00 AM - 12:00 AM',
        wednesday: '4:00 AM - 12:00 AM',
        thursday: '4:00 AM - 12:00 AM',
        friday: '4:00 AM - 11:00 PM',
        saturday: '5:00 AM - 11:00 PM',
        sunday: '5:00 AM - 11:00 PM'
      },
      plans: [
        { name: 'Basic', price: 39.99, period: 'month' },
        { name: 'Premium', price: 59.99, period: 'month' }
      ],
      description: 'Legendary bodybuilding gym on Venice Beach with outdoor training area.'
    },
    {
      id: 'gym-5', // ✅ Correct format
      name: 'LA Fitness Downtown',
      address: '100 South Hope Street, Los Angeles, CA 90013',
      phone: '(213) 555-0100',
      website: 'https://lafitness.com',
      location: 'Los Angeles',
      rating: 4.3,
      reviewCount: 189,
      verified: true,
      memberCount: 720,
      amenities: ['Cardio Equipment', 'Weight Training', 'Group Classes', 'Pool', 'Basketball Court'],
      hours: {
        monday: '5:00 AM - 11:00 PM',
        tuesday: '5:00 AM - 11:00 PM',
        wednesday: '5:00 AM - 11:00 PM',
        thursday: '5:00 AM - 11:00 PM',
        friday: '5:00 AM - 10:00 PM',
        saturday: '6:00 AM - 9:00 PM',
        sunday: '6:00 AM - 9:00 PM'
      },
      plans: [
        { name: 'Basic', price: 34.99, period: 'month' },
        { name: 'Signature', price: 44.99, period: 'month' }
      ],
      description: 'Full-service fitness center with comprehensive amenities in downtown LA.'
    },
    {
      id: 'gym-6', // ✅ Correct format
      name: 'Crunch Fitness Chicago',
      address: '200 West Madison Street, Chicago, IL 60606',
      phone: '(312) 555-0200',
      website: 'https://crunch.com',
      location: 'Chicago',
      rating: 4.4,
      reviewCount: 156,
      verified: true,
      memberCount: 580,
      amenities: ['Cardio Equipment', 'Weight Training', 'Group Classes', 'Yoga Studio', 'Childcare'],
      hours: {
        monday: '5:00 AM - 11:00 PM',
        tuesday: '5:00 AM - 11:00 PM',
        wednesday: '5:00 AM - 11:00 PM',
        thursday: '5:00 AM - 11:00 PM',
        friday: '5:00 AM - 10:00 PM',
        saturday: '7:00 AM - 8:00 PM',
        sunday: '7:00 AM - 8:00 PM'
      },
      plans: [
        { name: 'Base', price: 19.99, period: 'month' },
        { name: 'Peak', price: 29.99, period: 'month' }
      ],
      description: 'Fun and energetic fitness environment with unique group fitness classes.'
    }
  ];

  useEffect(() => {
    console.log('GymDirectory: Component mounted');
    fetchGyms();
  }, []);

  useEffect(() => {
    console.log('GymDirectory: Filtering gyms', { gyms: gyms.length, searchTerm, selectedLocation });
    filterGyms();
  }, [gyms, searchTerm, selectedLocation, sortBy]);

  const fetchGyms = async () => {
    console.log('GymDirectory: Starting to fetch gyms');
    setLoading(true);
    setError(null);

    try {
      // Always start with demo data to ensure something shows
      console.log('GymDirectory: Setting demo data first');
      setGyms(DEMO_GYMS);

      // Try to get real data if available
      if (contextGyms && Array.isArray(contextGyms) && contextGyms.length > 0) {
        console.log('GymDirectory: Using context gyms:', contextGyms.length);
        
        const transformedGyms = contextGyms.map((gym, index) => {
          try {
            return {
              id: gym.id || `gym-${index + 1}`, // ✅ Fixed: Use proper gym-X format
              name: gym.name || 'Unnamed Gym',
              location: gym.locations_gym2024?.name || 'Unknown Location',
              address: `123 Fitness St, ${gym.locations_gym2024?.name || 'City'}, State 12345`,
              phone: '(555) 123-4567',
              website: 'https://example.com',
              rating: 4.0 + Math.random() * 1.0,
              reviewCount: Math.floor(Math.random() * 300) + 50,
              verified: true,
              memberCount: Math.floor(Math.random() * 800) + 200,
              amenities: ['Cardio Equipment', 'Weight Training', 'Locker Rooms'],
              hours: {
                monday: '5:00 AM - 11:00 PM',
                tuesday: '5:00 AM - 11:00 PM',
                wednesday: '5:00 AM - 11:00 PM',
                thursday: '5:00 AM - 11:00 PM',
                friday: '5:00 AM - 10:00 PM',
                saturday: '6:00 AM - 9:00 PM',
                sunday: '7:00 AM - 8:00 PM'
              },
              plans: [
                { name: 'Basic', price: 29.99, period: 'month' },
                { name: 'Premium', price: 49.99, period: 'month' }
              ],
              description: 'Modern fitness center with quality equipment and friendly staff.'
            };
          } catch (err) {
            console.error('Error transforming gym:', err);
            return null;
          }
        }).filter(Boolean);

        if (transformedGyms.length > 0) {
          console.log('GymDirectory: Using transformed gyms:', transformedGyms.length);
          setGyms(transformedGyms);
        }
      } else {
        console.log('GymDirectory: No context gyms, using demo data');
      }
    } catch (error) {
      console.error('GymDirectory: Error fetching gyms:', error);
      setError(error.message);
      // Keep demo data as fallback
    } finally {
      setLoading(false);
    }
  };

  const filterGyms = () => {
    try {
      console.log('GymDirectory: Starting to filter gyms', { total: gyms.length });
      
      if (!Array.isArray(gyms)) {
        console.error('GymDirectory: gyms is not an array:', gyms);
        setFilteredGyms([]);
        return;
      }

      let filtered = [...gyms];

      // Text search
      if (searchTerm && searchTerm.trim()) {
        filtered = filtered.filter(gym => {
          try {
            const searchLower = searchTerm.toLowerCase();
            return (
              (gym.name && gym.name.toLowerCase().includes(searchLower)) ||
              (gym.address && gym.address.toLowerCase().includes(searchLower)) ||
              (gym.amenities && Array.isArray(gym.amenities) && 
               gym.amenities.some(amenity => amenity.toLowerCase().includes(searchLower)))
            );
          } catch (err) {
            console.error('Error filtering gym:', err, gym);
            return false;
          }
        });
      }

      // Location filter
      if (selectedLocation && selectedLocation.trim()) {
        filtered = filtered.filter(gym => 
          gym.location && gym.location === selectedLocation
        );
      }

      // Sorting
      filtered.sort((a, b) => {
        try {
          switch (sortBy) {
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            case 'members':
              return (b.memberCount || 0) - (a.memberCount || 0);
            case 'name':
            default:
              return (a.name || '').localeCompare(b.name || '');
          }
        } catch (err) {
          console.error('Error sorting gyms:', err);
          return 0;
        }
      });

      console.log('GymDirectory: Filtered gyms:', filtered.length);
      setFilteredGyms(filtered);
    } catch (error) {
      console.error('GymDirectory: Error in filterGyms:', error);
      setFilteredGyms(gyms);
    }
  };

  const formatHours = (hours) => {
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      return hours[today] || 'Hours not available';
    } catch (error) {
      return 'Hours not available';
    }
  };

  const isOpenNow = (hours) => {
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      const todayHours = hours[today];
      return todayHours === '24 Hours' || todayHours !== 'Closed';
    } catch (error) {
      return true;
    }
  };

  const openDirections = (gym) => {
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gym.address)}`;
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Unable to open directions');
    }
  };

  // ✅ FIXED: Updated GymCard component with proper navigation
  const GymCard = ({ gym }) => {
    if (!gym) return null;

    const handleViewDetails = () => {
      console.log('GymCard: Navigating to gym details:', gym.id);
      navigate(`/gym/${gym.id}`); // ✅ This will now pass gym-1, gym-2, etc.
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
      >
        {/* Gym Header */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <SafeIcon icon={FiMap} className="text-6xl text-white opacity-50" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex space-x-2">
            {gym.verified && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                <SafeIcon icon={FiStar} className="text-xs" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
            <SafeIcon icon={FiStar} className="text-yellow-400 text-sm" />
            <span className="text-sm font-medium">{(gym.rating || 4.0).toFixed(1)}</span>
            <span className="text-xs">({gym.reviewCount || 0})</span>
          </div>
        </div>

        {/* Gym Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{gym.name || 'Gym'}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <SafeIcon icon={FiMapPin} className="mr-1 text-sm" />
                <span className="text-sm">{gym.address || 'Address not available'}</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOpenNow(gym.hours || {}) 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOpenNow(gym.hours || {}) ? 'Open' : 'Closed'}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4">{gym.description || 'Quality fitness facility'}</p>

          {/* Hours */}
          <div className="flex items-center text-gray-600 mb-3">
            <SafeIcon icon={FiClock} className="mr-2" />
            <span className="text-sm">{formatHours(gym.hours || {})}</span>
          </div>

          {/* Members */}
          <div className="flex items-center text-gray-600 mb-4">
            <SafeIcon icon={FiUsers} className="mr-2" />
            <span className="text-sm">{(gym.memberCount || 0).toLocaleString()} members</span>
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {(gym.amenities || []).slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {(gym.amenities || []).length > 4 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{(gym.amenities || []).length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Membership Plans</h4>
            <div className="space-y-1">
              {(gym.plans || []).slice(0, 2).map((plan, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{plan.name}</span>
                  <span className="font-medium">${plan.price}/{plan.period}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openDirections(gym)}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <SafeIcon icon={FiNavigation} className="text-sm" />
              <span>Directions</span>
            </button>
            <button
              onClick={handleViewDetails} // ✅ Fixed: Now uses proper gym ID
              className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <span>View Details</span>
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
            {gym.phone && (
              <a
                href={`tel:${gym.phone}`}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <SafeIcon icon={FiPhone} className="text-xs" />
                <span>Call</span>
              </a>
            )}
            {gym.website && (
              <a
                href={gym.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <SafeIcon icon={FiGlobe} className="text-xs" />
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  console.log('GymDirectory: Rendering component', {
    loading,
    error,
    gymsCount: gyms.length,
    filteredGymsCount: filteredGyms.length,
    locationsCount: locations.length
  });

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
          <SafeIcon icon={FiCompass} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Gyms Near You</h1>
          <p className="text-gray-600">Discover the best fitness centers in your area</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Gyms
              </label>
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location, or amenities..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {(locations || []).map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="relative">
                <SafeIcon icon={FiFilter} className="absolute left-3 top-3 text-gray-400" />
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="members">Members</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <SafeIcon icon={FiTarget} className="text-red-600 mr-2" />
              <span className="text-red-800">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            Found <span className="font-semibold">{filteredGyms.length}</span> gym(s)
          </div>
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <SafeIcon icon={FiRefreshCw} className="animate-spin" />
              <span>Loading gyms...</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gyms...</p>
          </div>
        ) : (
          <>
            {/* Gym Grid */}
            {filteredGyms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGyms.map((gym) => (
                  <GymCard key={gym.id} gym={gym} />
                ))}
              </div>
            ) : (
              /* No Results */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <SafeIcon icon={FiCompass} className="text-6xl text-gray-300 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Gyms Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedLocation
                    ? 'Try adjusting your search criteria.'
                    : 'No gyms are currently available.'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLocation('');
                    fetchGyms();
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {searchTerm || selectedLocation ? 'Clear Filters' : 'Refresh'}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GymDirectory;