import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiAward, FiSearch, FiMapPin, FiDollarSign, FiStar, FiUsers, FiClock,
  FiPhone, FiMail, FiGlobe, FiInstagram, FiMessageCircle, FiFilter,
  FiRefreshCw, FiUser, FiTarget, FiTrendingUp, FiHeart, FiBookOpen
} = FiIcons;

const TrainerDirectory = () => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('');
  const [acceptingClientsOnly, setAcceptingClientsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const { user } = useAuth();
  const navigate = useNavigate();

  // Demo trainer data
  const DEMO_TRAINERS = [
    {
      id: 'trainer-1',
      name: 'Sarah Johnson',
      business_name: 'FitLife Training',
      bio: 'Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals through personalized workout plans and nutritional guidance.',
      location: 'New York',
      specializations: ['Weight Loss', 'Strength Training', 'Nutrition Coaching'],
      certifications: ['NASM-CPT', 'CSCS', 'Precision Nutrition'],
      experience_years: 8,
      hourly_rate: 85.00,
      rating: 4.9,
      review_count: 47,
      is_accepting_clients: true,
      verified: true,
      phone: '(555) 123-4567',
      email: 'sarah@fitlife.com',
      website: 'https://fitlifetraining.com',
      instagram: '@fitlifesarah',
      services_offered: ['Personal Training', 'Nutrition Coaching', 'Group Training'],
      profile_image: null,
      total_clients: 35,
      success_stories: 28
    },
    {
      id: 'trainer-2',
      name: 'Marcus Rodriguez',
      business_name: 'Strength & Performance',
      bio: 'Former competitive athlete turned trainer. Specializing in athletic performance, functional movement, and injury prevention for athletes of all levels.',
      location: 'Los Angeles',
      specializations: ['Athletic Performance', 'Functional Training', 'Injury Prevention'],
      certifications: ['CSCS', 'FMS', 'USAW'],
      experience_years: 12,
      hourly_rate: 95.00,
      rating: 4.8,
      review_count: 63,
      is_accepting_clients: true,
      verified: true,
      phone: '(555) 987-6543',
      email: 'marcus@strengthperformance.com',
      website: 'https://strengthperformance.com',
      instagram: '@marcusstrength',
      services_offered: ['Personal Training', 'Athletic Training', 'Movement Assessment'],
      profile_image: null,
      total_clients: 42,
      success_stories: 38
    },
    {
      id: 'trainer-3',
      name: 'Emily Chen',
      business_name: 'Mindful Movement',
      bio: 'Yoga instructor and wellness coach combining traditional fitness with mindfulness practices. Perfect for stress relief and holistic wellness.',
      location: 'New York',
      specializations: ['Yoga', 'Stress Relief', 'Flexibility'],
      certifications: ['RYT-500', 'ACE-CPT', 'Meditation Teacher'],
      experience_years: 6,
      hourly_rate: 70.00,
      rating: 4.9,
      review_count: 34,
      is_accepting_clients: true,
      verified: true,
      phone: '(555) 456-7890',
      email: 'emily@mindfulmovement.com',
      website: 'https://mindfulmovement.com',
      instagram: '@mindfulemily',
      services_offered: ['Yoga Classes', 'Meditation', 'Wellness Coaching'],
      profile_image: null,
      total_clients: 28,
      success_stories: 22
    },
    {
      id: 'trainer-4',
      name: 'David Thompson',
      business_name: 'Iron Will Fitness',
      bio: 'Powerlifting champion and strength coach. Helping clients build serious strength and muscle through proven powerlifting techniques.',
      location: 'Chicago',
      specializations: ['Powerlifting', 'Strength Training', 'Muscle Building'],
      certifications: ['NSCA-CPT', 'USA Powerlifting', 'Starting Strength'],
      experience_years: 10,
      hourly_rate: 80.00,
      rating: 4.7,
      review_count: 29,
      is_accepting_clients: false,
      verified: true,
      phone: '(555) 321-0987',
      email: 'david@ironwillfitness.com',
      website: 'https://ironwillfitness.com',
      instagram: '@ironwilldavid',
      services_offered: ['Powerlifting Coaching', 'Strength Training', 'Competition Prep'],
      profile_image: null,
      total_clients: 31,
      success_stories: 26
    },
    {
      id: 'trainer-5',
      name: 'Jennifer Lopez',
      business_name: 'Transform Fitness',
      bio: 'Transformation specialist helping busy professionals get in the best shape of their lives with efficient, results-driven workouts.',
      location: 'Los Angeles',
      specializations: ['Weight Loss', 'Body Transformation', 'Time-Efficient Training'],
      certifications: ['ACSM-CPT', 'NASM-CES', 'Metabolic Conditioning'],
      experience_years: 7,
      hourly_rate: 90.00,
      rating: 4.8,
      review_count: 56,
      is_accepting_clients: true,
      verified: true,
      phone: '(555) 654-3210',
      email: 'jennifer@transformfitness.com',
      website: 'https://transformfitness.com',
      instagram: '@transformjen',
      services_offered: ['Personal Training', 'Body Transformation', 'Online Coaching'],
      profile_image: null,
      total_clients: 48,
      success_stories: 41
    },
    {
      id: 'trainer-6',
      name: 'Michael Park',
      business_name: 'Functional Fitness Pro',
      bio: 'Movement specialist focusing on functional fitness for everyday life. Perfect for beginners and those recovering from injuries.',
      location: 'Chicago',
      specializations: ['Functional Training', 'Beginner Fitness', 'Rehabilitation'],
      certifications: ['FMS', 'SFMA', 'ACE-CPT'],
      experience_years: 5,
      hourly_rate: 65.00,
      rating: 4.6,
      review_count: 23,
      is_accepting_clients: true,
      verified: false,
      phone: '(555) 789-0123',
      email: 'michael@functionalfitnesspro.com',
      website: 'https://functionalfitnesspro.com',
      instagram: '@functionalmikey',
      services_offered: ['Functional Training', 'Corrective Exercise', 'Beginner Training'],
      profile_image: null,
      total_clients: 19,
      success_stories: 15
    }
  ];

  const locations = ['All Locations', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const specializations = [
    'All Specializations', 'Weight Loss', 'Strength Training', 'Muscle Building',
    'Athletic Performance', 'Yoga', 'Functional Training', 'Nutrition Coaching',
    'Powerlifting', 'Rehabilitation', 'Beginner Fitness', 'Stress Relief'
  ];
  const priceRanges = [
    'All Prices', '$50-70/hour', '$70-90/hour', '$90-110/hour', '$110+/hour'
  ];

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchTerm, locationFilter, specializationFilter, priceRangeFilter, acceptingClientsOnly, sortBy]);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would fetch from Supabase
      // For now, we'll use demo data
      setTrainers(DEMO_TRAINERS);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const filterTrainers = () => {
    let filtered = [...trainers];

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(trainer =>
        trainer.name.toLowerCase().includes(searchLower) ||
        trainer.business_name.toLowerCase().includes(searchLower) ||
        trainer.bio.toLowerCase().includes(searchLower) ||
        trainer.specializations.some(spec => spec.toLowerCase().includes(searchLower))
      );
    }

    // Location filter
    if (locationFilter && locationFilter !== 'All Locations') {
      filtered = filtered.filter(trainer => trainer.location === locationFilter);
    }

    // Specialization filter
    if (specializationFilter && specializationFilter !== 'All Specializations') {
      filtered = filtered.filter(trainer =>
        trainer.specializations.includes(specializationFilter)
      );
    }

    // Price range filter
    if (priceRangeFilter && priceRangeFilter !== 'All Prices') {
      const priceRanges = {
        '$50-70/hour': [50, 70],
        '$70-90/hour': [70, 90],
        '$90-110/hour': [90, 110],
        '$110+/hour': [110, 1000]
      };
      const [min, max] = priceRanges[priceRangeFilter];
      filtered = filtered.filter(trainer =>
        trainer.hourly_rate >= min && trainer.hourly_rate <= max
      );
    }

    // Accepting clients filter
    if (acceptingClientsOnly) {
      filtered = filtered.filter(trainer => trainer.is_accepting_clients);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.hourly_rate - b.hourly_rate;
        case 'price-high':
          return b.hourly_rate - a.hourly_rate;
        case 'experience':
          return b.experience_years - a.experience_years;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredTrainers(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleContactTrainer = (trainer) => {
    if (!user) {
      toast.error('Please sign in to contact trainers');
      navigate('/signin');
      return;
    }
    
    // In a real app, this would open a chat or contact form
    toast.success(`Contact feature coming soon! You can reach ${trainer.name} at ${trainer.email}`);
  };

  const handleBookSession = (trainer) => {
    if (!user) {
      toast.error('Please sign in to book sessions');
      navigate('/signin');
      return;
    }
    
    if (!trainer.is_accepting_clients) {
      toast.error(`${trainer.name} is not currently accepting new clients`);
      return;
    }
    
    // In a real app, this would open booking interface
    toast.success(`Booking feature coming soon! Contact ${trainer.name} directly to schedule.`);
  };

  const TrainerCard = ({ trainer }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        {trainer.profile_image ? (
          <img 
            src={trainer.profile_image} 
            alt={trainer.name}
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center text-3xl font-bold text-blue-600">
            {trainer.name.charAt(0)}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {trainer.verified && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
              <SafeIcon icon={FiAward} className="text-xs" />
              <span>Verified</span>
            </span>
          )}
          {trainer.is_accepting_clients && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Accepting Clients
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg flex items-center space-x-1">
          <SafeIcon icon={FiStar} className="text-yellow-400 text-sm" />
          <span className="text-sm font-medium">{trainer.rating.toFixed(1)}</span>
          <span className="text-xs">({trainer.review_count})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{trainer.name}</h3>
            <p className="text-blue-600 font-medium">{trainer.business_name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{formatPrice(trainer.hourly_rate)}</div>
            <div className="text-sm text-gray-500">per hour</div>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiMapPin} />
            <span>{trainer.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiClock} />
            <span>{trainer.experience_years} years exp.</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{trainer.bio}</p>

        {/* Specializations */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {trainer.specializations.slice(0, 3).map((spec, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {spec}
              </span>
            ))}
            {trainer.specializations.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{trainer.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {trainer.certifications.slice(0, 2).map((cert, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {cert}
              </span>
            ))}
            {trainer.certifications.length > 2 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{trainer.certifications.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">{trainer.total_clients}</div>
            <div className="text-xs text-gray-600">Total Clients</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">{trainer.success_stories}</div>
            <div className="text-xs text-gray-600">Success Stories</div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
          <div className="text-sm text-gray-600">
            {trainer.services_offered.join(', ')}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          {trainer.website && (
            <a href={trainer.website} target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <SafeIcon icon={FiGlobe} className="text-xs" />
              <span>Website</span>
            </a>
          )}
          {trainer.instagram && (
            <a href={`https://instagram.com/${trainer.instagram.replace('@', '')}`} 
               target="_blank" rel="noopener noreferrer"
               className="text-pink-600 hover:text-pink-800 flex items-center space-x-1">
              <SafeIcon icon={FiInstagram} className="text-xs" />
              <span>Instagram</span>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleContactTrainer(trainer)}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiMessageCircle} className="text-sm" />
            <span>Contact</span>
          </button>
          <button
            onClick={() => handleBookSession(trainer)}
            disabled={!trainer.is_accepting_clients}
            className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              trainer.is_accepting_clients
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <SafeIcon icon={FiCalendar} className="text-sm" />
            <span>{trainer.is_accepting_clients ? 'Book Session' : 'Not Available'}</span>
          </button>
        </div>
      </div>
    </motion.div>
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
          <SafeIcon icon={FiAward} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Trainer Directory</h1>
          <p className="text-gray-600">Find certified personal trainers to help you achieve your fitness goals</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Trainers
              </label>
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, business, or specialization..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                id="location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locations.map((location) => (
                  <option key={location} value={location === 'All Locations' ? '' : location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialization */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                id="specialization"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec === 'All Specializations' ? '' : spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                id="price-range"
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priceRanges.map((range) => (
                  <option key={range} value={range === 'All Prices' ? '' : range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={acceptingClientsOnly}
                  onChange={(e) => setAcceptingClientsOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Accepting new clients only</span>
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="experience">Most Experience</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">
                Found <strong>{filteredTrainers.length}</strong> trainer{filteredTrainers.length !== 1 ? 's' : ''} matching your criteria
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('');
                  setSpecializationFilter('');
                  setPriceRangeFilter('');
                  setAcceptingClientsOnly(false);
                  setSortBy('rating');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trainers Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trainers...</p>
          </div>
        ) : filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <SafeIcon icon={FiAward} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trainers Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || locationFilter || specializationFilter || priceRangeFilter
                ? 'Try adjusting your search criteria.'
                : 'No trainers are currently available.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setSpecializationFilter('');
                setPriceRangeFilter('');
                setAcceptingClientsOnly(false);
                fetchTrainers();
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {searchTerm || locationFilter || specializationFilter || priceRangeFilter
                ? 'Clear Filters'
                : 'Refresh'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrainerDirectory;