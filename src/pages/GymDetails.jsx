import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiPhone, FiGlobe, FiClock, FiUsers, FiStar, FiNavigation, FiMail, FiArrowLeft, FiCalendar, FiDollarSign, FiCheck, FiHeart, FiShare2, FiCamera, FiChevronLeft, FiChevronRight, FiExternalLink } = FiIcons;

const GymDetails = () => {
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const { gymId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Complete demo gym data with all details
  const DEMO_GYMS = {
    'gym-1': {
      id: 'gym-1',
      name: 'Fitness First NYC',
      address: '123 Broadway, New York, NY 10001',
      phone: '(212) 555-0123',
      website: 'https://fitnessfirst.com',
      email: 'info@fitnessfirst.com',
      location: 'New York',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      rating: 4.5,
      reviewCount: 247,
      verified: true,
      memberCount: 850,
      amenities: [
        'Cardio Equipment', 'Weight Training', 'Group Classes', 'Personal Training',
        'Locker Rooms', 'Sauna', 'Steam Room', 'Yoga Studio', 'Nutrition Counseling', 'Massage Therapy'
      ],
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
        {
          id: 'basic',
          name: 'Basic Membership',
          price: 29.99,
          period: 'month',
          features: ['Gym access', 'Locker room', 'Basic equipment', 'Mobile app']
        },
        {
          id: 'premium',
          name: 'Premium Membership',
          price: 49.99,
          period: 'month',
          features: ['All Basic features', 'Group classes', 'Sauna access', 'Guest passes', 'Nutrition consultation']
        }
      ],
      images: ['/gym1.jpg', '/gym1-2.jpg', '/gym1-3.jpg', '/gym1-4.jpg'],
      description: 'Modern fitness center in the heart of Manhattan with state-of-the-art equipment and expert trainers. Our facility features the latest cardio and strength training equipment, spacious group fitness studios, and luxurious amenities.',
      features: [
        'Over 100 pieces of cardio equipment',
        'Full range of free weights and machines',
        '5 group fitness studios',
        'Certified personal trainers',
        'Nutritional counseling services',
        'Member mobile app with workout tracking',
        'Towel service included',
        'Secure parking available'
      ],
      userReviews: [
        {
          id: 1,
          name: 'Sarah Johnson',
          rating: 5,
          date: '2024-01-15',
          comment: 'Amazing gym! Great equipment and friendly staff. The facilities are always clean and well-maintained.'
        },
        {
          id: 2,
          name: 'Mike Chen',
          rating: 4,
          date: '2024-01-10',
          comment: 'Good variety of equipment and classes. Can get busy during peak hours but overall a solid gym.'
        },
        {
          id: 3,
          name: 'Emily Davis',
          rating: 5,
          date: '2024-01-08',
          comment: 'Love the yoga classes here! Instructors are knowledgeable and the studio is beautiful.'
        }
      ],
      trainers: [
        {
          id: 1,
          name: 'John Smith',
          specialization: 'Strength Training',
          experience: '8 years',
          certifications: ['NASM-CPT', 'CSCS'],
          image: '/trainer1.jpg'
        },
        {
          id: 2,
          name: 'Lisa Rodriguez',
          specialization: 'Yoga & Pilates',
          experience: '6 years',
          certifications: ['RYT-500', 'PMA-CPT'],
          image: '/trainer2.jpg'
        }
      ]
    },
    'gym-2': {
      id: 'gym-2',
      name: 'Equinox Manhattan',
      address: '456 Fifth Avenue, New York, NY 10018',
      phone: '(212) 555-0456',
      website: 'https://equinox.com',
      email: 'info@equinox.com',
      location: 'New York',
      coordinates: { lat: 40.7549, lng: -73.9840 },
      rating: 4.8,
      reviewCount: 412,
      verified: true,
      memberCount: 1200,
      amenities: [
        'Cardio Equipment', 'Weight Training', 'Personal Training', 'Spa Services',
        'Pool', 'Eucalyptus Steam Room', 'Dry Sauna', 'Whirlpool', 'Lounge Area'
      ],
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
        {
          id: 'all-access',
          name: 'All Access',
          price: 89.99,
          period: 'month',
          features: ['Access to all locations', 'Group fitness classes', 'Pool access', 'Guest privileges']
        },
        {
          id: 'destination',
          name: 'Destination',
          price: 149.99,
          period: 'month',
          features: ['All Access features', 'Premium locations', 'Personal training discount', 'Spa services']
        }
      ],
      images: ['/gym2.jpg', '/gym2-2.jpg', '/gym2-3.jpg'],
      description: 'Luxury fitness club with premium amenities and expert personal training. Experience the ultimate in fitness luxury with our state-of-the-art equipment and world-class facilities.',
      features: [
        'Premium Technogym equipment',
        'Luxury spa facilities',
        'Olympic-size swimming pool',
        'Expert personal trainers',
        'Signature group fitness classes',
        'Eucalyptus steam rooms',
        'Premium locker rooms with amenities',
        'Complimentary towel service'
      ],
      userReviews: [
        {
          id: 1,
          name: 'David Wilson',
          rating: 5,
          date: '2024-01-12',
          comment: 'Premium experience worth every penny. The facilities are immaculate and staff is top-notch.'
        },
        {
          id: 2,
          name: 'Jennifer Lee',
          rating: 4,
          date: '2024-01-09',
          comment: 'Love the spa facilities and group classes. Can be crowded but that\'s expected for such a popular place.'
        }
      ],
      trainers: [
        {
          id: 1,
          name: 'Marcus Johnson',
          specialization: 'HIIT & Conditioning',
          experience: '10 years',
          certifications: ['ACSM-CPT', 'FMS'],
          image: '/trainer3.jpg'
        }
      ]
    },
    'gym-3': {
      id: 'gym-3',
      name: 'Planet Fitness Times Square',
      address: '789 Eighth Avenue, New York, NY 10019',
      phone: '(212) 555-0789',
      website: 'https://planetfitness.com',
      email: 'timessquare@planetfitness.com',
      location: 'New York',
      coordinates: { lat: 40.7590, lng: -73.9845 },
      rating: 4.2,
      reviewCount: 156,
      verified: true,
      memberCount: 650,
      amenities: [
        'Cardio Equipment', 'Weight Training', 'Locker Rooms', 'HydroMassage',
        'Massage Chairs', 'Tanning', 'Guest Privileges', 'Free Fitness Training'
      ],
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
        {
          id: 'classic',
          name: 'Classic',
          price: 10.99,
          period: 'month',
          features: ['Home club access', 'Free fitness training', 'WiFi']
        },
        {
          id: 'black-card',
          name: 'Black Card',
          price: 22.99,
          period: 'month',
          features: ['All Classic features', 'Guest privileges', 'HydroMassage', 'Massage chairs', 'All club access']
        }
      ],
      images: ['/gym3.jpg', '/gym3-2.jpg'],
      description: 'Affordable 24/7 fitness with a judgment-free environment. We believe fitness should be accessible to everyone, regardless of experience level or budget.',
      features: [
        '24/7 access for convenience',
        'Judgment Free Zone®',
        'State-of-the-art cardio equipment',
        'Circuit training area',
        'Free fitness training',
        'HydroMassage beds',
        'Massage chairs',
        'Clean and spacious facilities'
      ],
      userReviews: [
        {
          id: 1,
          name: 'Alex Martinez',
          rating: 4,
          date: '2024-01-14',
          comment: 'Great value for money. Open 24/7 which is perfect for my schedule. Staff is friendly and helpful.'
        },
        {
          id: 2,
          name: 'Rachel Green',
          rating: 4,
          date: '2024-01-11',
          comment: 'Love the judgment-free environment. Perfect for beginners like me!'
        }
      ],
      trainers: [
        {
          id: 1,
          name: 'Tony Garcia',
          specialization: 'Beginner Fitness',
          experience: '5 years',
          certifications: ['ACE-CPT'],
          image: '/trainer4.jpg'
        }
      ]
    },
    'gym-4': {
      id: 'gym-4',
      name: 'Gold\'s Gym Venice',
      address: '360 Hampton Drive, Venice, CA 90291',
      phone: '(310) 555-0360',
      website: 'https://goldsgym.com',
      email: 'venice@goldsgym.com',
      location: 'Los Angeles',
      coordinates: { lat: 33.9850, lng: -118.4695 },
      rating: 4.6,
      reviewCount: 328,
      verified: true,
      memberCount: 950,
      amenities: [
        'Cardio Equipment', 'Weight Training', 'Outdoor Training', 'Boxing Ring',
        'Muscle Beach Access', 'Locker Rooms', 'Supplement Store', 'Personal Training'
      ],
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
        {
          id: 'basic',
          name: 'Basic',
          price: 39.99,
          period: 'month',
          features: ['Gym access', 'Cardio equipment', 'Free weights', 'Locker room']
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 59.99,
          period: 'month',
          features: ['All Basic features', 'Group classes', 'Guest privileges', 'Outdoor area access']
        }
      ],
      images: ['/gym4.jpg', '/gym4-2.jpg', '/gym4-3.jpg'],
      description: 'Legendary bodybuilding gym on Venice Beach with outdoor training area. Train where the legends trained at the most famous gym in the world.',
      features: [
        'Historic Muscle Beach location',
        'Outdoor training area',
        'Professional boxing ring',
        'Olympic-style weightlifting platform',
        'Legendary atmosphere',
        'Celebrity trainer appearances',
        'Bodybuilding competition prep',
        'Supplement and gear store'
      ],
      userReviews: [
        {
          id: 1,
          name: 'Arnold Wannabe',
          rating: 5,
          date: '2024-01-13',
          comment: 'This is THE gym! Nothing beats training where Arnold himself used to work out. Incredible atmosphere.'
        },
        {
          id: 2,
          name: 'Beach Fitness',
          rating: 5,
          date: '2024-01-10',
          comment: 'Love the outdoor training area. Perfect for California weather and the Venice Beach vibe.'
        }
      ],
      trainers: [
        {
          id: 1,
          name: 'Franco Columbu Jr.',
          specialization: 'Bodybuilding',
          experience: '15 years',
          certifications: ['IFBB Pro', 'NASM-CPT'],
          image: '/trainer5.jpg'
        }
      ]
    },
    'gym-5': {
      id: 'gym-5',
      name: 'LA Fitness Downtown',
      address: '100 South Hope Street, Los Angeles, CA 90013',
      phone: '(213) 555-0100',
      website: 'https://lafitness.com',
      email: 'downtown@lafitness.com',
      location: 'Los Angeles',
      coordinates: { lat: 34.0522, lng: -118.2500 },
      rating: 4.3,
      reviewCount: 189,
      verified: true,
      memberCount: 720,
      amenities: [
        'Cardio Equipment', 'Weight Training', 'Group Classes', 'Pool', 'Basketball Court',
        'Racquetball Courts', 'Sauna', 'Whirlpool', 'Kids Klub', 'Personal Training'
      ],
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
        {
          id: 'basic',
          name: 'Basic',
          price: 34.99,
          period: 'month',
          features: ['Single club access', 'Cardio & strength equipment', 'Group fitness classes']
        },
        {
          id: 'signature',
          name: 'Signature',
          price: 44.99,
          period: 'month',
          features: ['All Basic features', 'All club access', 'Guest privileges', 'Kids Klub', 'Pool & courts']
        }
      ],
      images: ['/gym5.jpg', '/gym5-2.jpg'],
      description: 'Full-service fitness center with comprehensive amenities in downtown LA. Everything you need for a complete fitness experience under one roof.',
      features: [
        'Full-size basketball court',
        'Olympic-size swimming pool',
        'Group fitness studios',
        'Racquetball courts',
        'Kids Klub childcare',
        'Sauna and whirlpool',
        'Personal training',
        'Convenient downtown location'
      ],
      userReviews: [
        {
          id: 1,
          name: 'Downtown Worker',
          rating: 4,
          date: '2024-01-12',
          comment: 'Great location for after work. Pool is nice and basketball court gets good games going.'
        }
      ],
      trainers: [
        {
          id: 1,
          name: 'Maria Santos',
          specialization: 'Aqua Fitness',
          experience: '7 years',
          certifications: ['AEA-CPT', 'WSI'],
          image: '/trainer6.jpg'
        }
      ]
    },
    'gym-6': {
      id: 'gym-6',
      name: 'Crunch Fitness Chicago',
      address: '200 West Madison Street, Chicago, IL 60606',
      phone: '(312) 555-0200',
      website: 'https://crunch.com',
      email: 'chicago@crunch.com',
      location: 'Chicago',
      coordinates: { lat: 41.8781, lng: -87.6298 },
      rating: 4.4,
      reviewCount: 156,
      verified: true,
      memberCount: 580,
      amenities: [
        'Cardio Equipment', 'Weight Training', 'Group Classes', 'Yoga Studio',
        'Childcare', 'Tanning', 'HydroMassage', 'Personal Training', 'Functional Training Area'
      ],
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
        {
          id: 'base',
          name: 'Base',
          price: 19.99,
          period: 'month',
          features: ['Home club access', 'Cardio & strength equipment', 'Locker rooms']
        },
        {
          id: 'peak',
          name: 'Peak',
          price: 29.99,
          period: 'month',
          features: ['All Base features', 'Group fitness classes', 'Guest privileges', 'HydroMassage', 'Tanning']
        }
      ],
      images: ['/gym6.jpg', '/gym6-2.jpg'],
      description: 'Fun and energetic fitness environment with unique group fitness classes. No judgments, just fun workouts in a welcoming atmosphere.',
      features: [
        'Signature group fitness classes',
        'Fun, energetic atmosphere',
        'Functional training area',
        'Dedicated yoga studio',
        'Childcare services',
        'HydroMassage beds',
        'Tanning services',
        'Personal training available'
      ],
      userReviews: [
        {
          id: 1,
          name: 'Chicago Fitness Fan',
          rating: 4,
          date: '2024-01-11',
          comment: 'Love the group classes here! Instructors are energetic and classes are always fun.'
        }
      ],
      trainers: [
        {
          id: 1,
          name: 'Mike Chicago',
          specialization: 'Group Fitness',
          experience: '6 years',
          certifications: ['ACE-GFI', 'ACSM-CPT'],
          image: '/trainer7.jpg'
        }
      ]
    }
  };

  useEffect(() => {
    console.log('GymDetails: Loading gym with ID:', gymId);
    fetchGymDetails();
  }, [gymId]);

  const fetchGymDetails = async () => {
    setLoading(true);
    try {
      console.log('GymDetails: Fetching details for gym:', gymId);
      
      // Get gym data from our demo data
      const gymData = DEMO_GYMS[gymId];
      
      if (gymData) {
        console.log('GymDetails: Found gym data:', gymData.name);
        setGym(gymData);
      } else {
        console.log('GymDetails: No gym found with ID:', gymId);
        console.log('Available gym IDs:', Object.keys(DEMO_GYMS));
        setGym(null);
      }
    } catch (error) {
      console.error('Error fetching gym details:', error);
      setGym(null);
    } finally {
      setLoading(false);
    }
  };

  const openDirections = () => {
    if (gym) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(gym.address)}`;
      window.open(url, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: gym.name,
          text: `Check out ${gym.name} - ${gym.description}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const nextImage = () => {
    if (gym && gym.images) {
      setSelectedImageIndex((prev) => (prev + 1) % gym.images.length);
    }
  };

  const prevImage = () => {
    if (gym && gym.images) {
      setSelectedImageIndex((prev) => (prev - 1 + gym.images.length) % gym.images.length);
    }
  };

  const formatHours = (hours) => {
    return Object.entries(hours).map(([day, time]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      time
    }));
  };

  const isOpenNow = () => {
    if (!gym) return false;
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const todayHours = gym.hours[today];
    
    if (!todayHours || todayHours === '24 Hours') {
      return todayHours === '24 Hours';
    }
    
    // Simple check - in a real app, you'd parse the time strings properly
    return true; // Simplified for demo
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'plans', label: 'Membership Plans' },
    { id: 'hours', label: 'Hours & Contact' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'trainers', label: 'Trainers' }
  ];

  console.log('GymDetails: Rendering', { loading, gym: gym?.name, gymId });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gym details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <SafeIcon icon={FiMapPin} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gym not found</h2>
            <p className="text-gray-600 mb-4">
              The gym you're looking for doesn't exist or may have been removed.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <p>Gym ID: {gymId}</p>
              <p>Available gyms: gym-1, gym-2, gym-3, gym-4, gym-5, gym-6</p>
            </div>
            <button
              onClick={() => navigate('/gym-directory')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Directory
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
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/gym-directory')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Directory</span>
          </button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          {/* Image Gallery */}
          <div className="relative h-64 md:h-96">
            {gym.images && gym.images.length > 0 ? (
              <>
                <img
                  src={gym.images[selectedImageIndex]}
                  alt={gym.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <SafeIcon icon={FiCamera} className="text-6xl text-white opacity-50" />
                </div>
                
                {/* Image Navigation */}
                {gym.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <SafeIcon icon={FiChevronLeft} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <SafeIcon icon={FiChevronRight} />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {gym.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <SafeIcon icon={FiCamera} className="text-6xl text-white opacity-50" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex space-x-2">
              {gym.verified && (
                <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                  <SafeIcon icon={FiStar} className="text-sm" />
                  <span>Verified</span>
                </span>
              )}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOpenNow() ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {isOpenNow() ? 'Open Now' : 'Closed'}
              </div>
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorited 
                    ? 'bg-red-500 text-white' 
                    : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                }`}
              >
                <SafeIcon icon={FiHeart} />
              </button>
              <button
                onClick={handleShare}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <SafeIcon icon={FiShare2} />
              </button>
            </div>
          </div>

          {/* Gym Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{gym.name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <SafeIcon icon={FiMapPin} className="mr-2" />
                  <span>{gym.address}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiStar} className="text-yellow-400" />
                    <span className="font-medium">{gym.rating}</span>
                    <span>({gym.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiUsers} />
                    <span>{gym.memberCount.toLocaleString()} members</span>
                  </div>
                </div>
              </div>
              <button
                onClick={openDirections}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiNavigation} />
                <span>Directions</span>
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed">{gym.description}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {gym.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <SafeIcon icon={FiCheck} className="text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gym.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <SafeIcon icon={FiCheck} className="text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Membership Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gym.plans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                      <div className="flex items-baseline mb-4">
                        <span className="text-3xl font-bold text-blue-600">${plan.price}</span>
                        <span className="text-gray-500 ml-1">/{plan.period}</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <SafeIcon icon={FiCheck} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Select Plan
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hours & Contact Tab */}
            {activeTab === 'hours' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hours</h3>
                  <div className="space-y-3">
                    {formatHours(gym.hours).map(({ day, time }) => {
                      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                      const isToday = day === today;
                      return (
                        <div
                          key={day}
                          className={`flex justify-between p-3 rounded-lg ${
                            isToday ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                          }`}
                        >
                          <span className={`font-medium ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                            {day}
                          </span>
                          <span className={isToday ? 'text-blue-700' : 'text-gray-600'}>
                            {time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiPhone} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <a href={`tel:${gym.phone}`} className="text-blue-600 hover:text-blue-800">
                          {gym.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiMail} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <a href={`mailto:${gym.email}`} className="text-blue-600 hover:text-blue-800">
                          {gym.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiGlobe} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Website</p>
                        <a
                          href={gym.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>Visit Website</span>
                          <SafeIcon icon={FiExternalLink} className="text-sm" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiMapPin} className="text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600">{gym.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiStar} className="text-yellow-400" />
                    <span className="text-xl font-bold">{gym.rating}</span>
                    <span className="text-gray-600">({gym.userReviews.length} reviews)</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {gym.userReviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.name}</p>
                            <div className="flex items-center space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <SafeIcon key={i} icon={FiStar} className="text-yellow-400 text-sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trainers Tab */}
            {activeTab === 'trainers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Personal Trainers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gym.trainers.map((trainer) => (
                    <div key={trainer.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold">
                          {trainer.name.split(' ').map(n => n.charAt(0)).join('')}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{trainer.name}</h4>
                          <p className="text-blue-600">{trainer.specialization}</p>
                          <p className="text-sm text-gray-600">{trainer.experience} experience</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Certifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {trainer.certifications.map((cert, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Book Session
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDetails;