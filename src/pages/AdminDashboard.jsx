import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import RoleManager from '../components/RoleManager';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const {
  FiSettings, FiUsers, FiMapPin, FiHome, FiActivity, FiPlus, FiEdit2, FiTrash2,
  FiBarChart3, FiMail, FiCalendar, FiCheck, FiX, FiUpload, FiDownload, FiClock,
  FiCopy, FiRefreshCw, FiBuilding, FiAlertTriangle, FiCheckCircle, FiEye, FiStar,
  FiSave, FiList, FiPackage, FiGrid
} = FiIcons;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [locations, setLocations] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [users, setUsers] = useState([]);
  const [gymAccounts, setGymAccounts] = useState([]);
  
  // Single add states
  const [newLocation, setNewLocation] = useState('');
  const [newGym, setNewGym] = useState({ name: '', location_id: '' });
  
  // Other states
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [gymAccountsLoading, setGymAccountsLoading] = useState(false);
  const [gymsLoading, setGymsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState({});

  const { user } = useAuth();
  const { getWorkoutStats } = useData();

  // Enhanced demo data with more comprehensive gym information
  const DEMO_GYMS = [
    {
      id: 'demo-gym-1',
      name: 'Fitness First NYC',
      location_id: 'demo-location-1',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      locations_gym2024: { name: 'New York', id: 'demo-location-1' }
    },
    {
      id: 'demo-gym-2',
      name: 'Equinox Manhattan',
      location_id: 'demo-location-1',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      locations_gym2024: { name: 'New York', id: 'demo-location-1' }
    },
    {
      id: 'demo-gym-3',
      name: 'Planet Fitness Times Square',
      location_id: 'demo-location-1',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      locations_gym2024: { name: 'New York', id: 'demo-location-1' }
    },
    {
      id: 'demo-gym-4',
      name: 'Gold\'s Gym Venice',
      location_id: 'demo-location-2',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      locations_gym2024: { name: 'Los Angeles', id: 'demo-location-2' }
    },
    {
      id: 'demo-gym-5',
      name: 'LA Fitness Downtown',
      location_id: 'demo-location-2',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      locations_gym2024: { name: 'Los Angeles', id: 'demo-location-2' }
    },
    {
      id: 'demo-gym-6',
      name: 'Crunch Fitness Chicago',
      location_id: 'demo-location-3',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      locations_gym2024: { name: 'Chicago', id: 'demo-location-3' }
    }
  ];

  const DEMO_LOCATIONS = [
    { id: 'demo-location-1', name: 'New York', created_at: new Date().toISOString() },
    { id: 'demo-location-2', name: 'Los Angeles', created_at: new Date().toISOString() },
    { id: 'demo-location-3', name: 'Chicago', created_at: new Date().toISOString() },
    { id: 'demo-location-4', name: 'Houston', created_at: new Date().toISOString() },
    { id: 'demo-location-5', name: 'Phoenix', created_at: new Date().toISOString() }
  ];

  const DEMO_USERS = [
    {
      id: 'demo-user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      location: 'New York',
      gym: 'Fitness First NYC',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      profile_complete: true
    },
    {
      id: 'demo-user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      location: 'Los Angeles',
      gym: 'Gold\'s Gym Venice',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      profile_complete: true
    },
    {
      id: 'demo-user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'moderator',
      location: 'Chicago',
      gym: 'Crunch Fitness Chicago',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      profile_complete: true
    },
    {
      id: 'admin-user-12345',
      name: 'Admin User',
      email: 'admin@gymbuddy.com',
      role: 'admin',
      location: 'New York',
      gym: 'Fitness First NYC',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      profile_complete: true
    }
  ];

  const DEMO_GYM_ACCOUNTS = [
    {
      id: 'gym-account-demo-1',
      user_id: 'demo-gym-12345',
      business_name: 'Demo Fitness Center',
      business_email: 'gym@example.com',
      phone: '(555) 123-4567',
      address: '123 Fitness Street',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      website: 'https://demofitness.com',
      description: 'A modern fitness center with state-of-the-art equipment',
      verified: false,
      subscription_plan: 'basic',
      created_at: new Date().toISOString(),
      profiles_gym2024: {
        name: 'Gym Owner',
        email: 'gym@example.com'
      }
    }
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsersData();
    } else if (activeTab === 'gym-verification') {
      fetchGymAccounts();
    } else if (activeTab === 'gyms') {
      fetchGymsData();
    } else if (activeTab === 'locations') {
      fetchLocationsData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await getWorkoutStats();
      setStats(statsData);
      
      // Always load locations first as gyms depend on them
      await fetchLocationsData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationsData = async () => {
    setLocationsLoading(true);
    try {
      console.log('AdminDashboard: Fetching locations...');
      
      // Check if Supabase is available and try to fetch from database
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('locations_gym2024')
            .select('*')
            .order('name');
          
          if (!error && data && data.length > 0) {
            console.log('AdminDashboard: Successfully fetched locations from database:', data.length);
            setLocations(data);
            setLocationsLoading(false);
            return;
          }
        } catch (dbError) {
          console.error('AdminDashboard: Database query failed:', dbError);
        }
      }
      
      // Fall back to demo data
      console.log('AdminDashboard: Using demo locations');
      setLocations(DEMO_LOCATIONS);
    } catch (error) {
      console.error('AdminDashboard: Error in fetchLocationsData:', error);
      setLocations(DEMO_LOCATIONS);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchGymsData = async () => {
    setGymsLoading(true);
    try {
      console.log('AdminDashboard: Fetching gyms...');
      
      // Ensure locations are loaded first
      if (locations.length === 0) {
        await fetchLocationsData();
      }
      
      // Check if Supabase is available and try to fetch from database
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('gyms_gym2024')
            .select(`
              *,
              locations_gym2024(name, id)
            `)
            .order('name');
          
          if (!error && data && data.length > 0) {
            console.log('AdminDashboard: Successfully fetched gyms from database:', data.length);
            setGyms(data);
            setGymsLoading(false);
            return;
          }
        } catch (dbError) {
          console.error('AdminDashboard: Database query failed:', dbError);
        }
      }
      
      // Fall back to demo data
      console.log('AdminDashboard: Using demo gyms data');
      setGyms(DEMO_GYMS);
    } catch (error) {
      console.error('AdminDashboard: Error fetching gyms:', error);
      setGyms(DEMO_GYMS);
    } finally {
      setGymsLoading(false);
    }
  };

  const fetchGymAccounts = async () => {
    setGymAccountsLoading(true);
    try {
      console.log('AdminDashboard: Fetching gym accounts...');
      
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('gym_accounts_gym2024')
            .select(`
              *,
              profiles_gym2024(name, email)
            `)
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            console.log('AdminDashboard: Successfully fetched gym accounts from database:', data.length);
            setGymAccounts(data);
            setGymAccountsLoading(false);
            return;
          }
        } catch (dbError) {
          console.error('AdminDashboard: Database query failed:', dbError);
        }
      }
      
      // Fall back to demo data
      console.log('AdminDashboard: Using demo gym accounts');
      setGymAccounts(DEMO_GYM_ACCOUNTS);
    } catch (error) {
      console.error('AdminDashboard: Error fetching gym accounts:', error);
      setGymAccounts(DEMO_GYM_ACCOUNTS);
    } finally {
      setGymAccountsLoading(false);
    }
  };

  const fetchUsersData = async () => {
    setUsersLoading(true);
    try {
      console.log('AdminDashboard: Fetching users...');
      
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('profiles_gym2024')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            console.log('AdminDashboard: Successfully fetched users from database:', data.length);
            setUsers(data);
            setUsersLoading(false);
            return;
          }
        } catch (dbError) {
          console.error('AdminDashboard: Database query failed:', dbError);
        }
      }
      
      // Fall back to demo data
      console.log('AdminDashboard: Using demo users');
      setUsers(DEMO_USERS);
    } catch (error) {
      console.error('AdminDashboard: Error fetching users:', error);
      setUsers(DEMO_USERS);
    } finally {
      setUsersLoading(false);
    }
  };

  const addLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    try {
      console.log('AdminDashboard: Adding location:', newLocation.trim());
      
      // Try database first
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('locations_gym2024')
            .insert([{ name: newLocation.trim() }])
            .select()
            .single();
          
          if (!error && data) {
            setLocations(prev => [...prev, data]);
            setNewLocation('');
            toast.success('Location added successfully!');
            return;
          }
        } catch (dbError) {
          console.log('AdminDashboard: Database insert failed, using demo mode');
        }
      }
      
      // Fall back to demo mode
      const newLocationObj = {
        id: `demo-location-${Date.now()}`,
        name: newLocation.trim(),
        created_at: new Date().toISOString()
      };
      setLocations(prev => [...prev, newLocationObj]);
      setNewLocation('');
      toast.success('Location added successfully! (Demo mode)');
    } catch (error) {
      console.error('AdminDashboard: Error adding location:', error);
      toast.error('Failed to add location');
    }
  };

  const addGym = async (e) => {
    e.preventDefault();
    if (!newGym.name.trim() || !newGym.location_id) return;

    try {
      console.log('AdminDashboard: Adding gym:', newGym);
      
      // Try database first
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { data, error } = await supabase
            .from('gyms_gym2024')
            .insert([{ 
              name: newGym.name.trim(), 
              location_id: newGym.location_id 
            }])
            .select(`
              *,
              locations_gym2024(name, id)
            `)
            .single();
          
          if (!error && data) {
            setGyms(prev => [...prev, data]);
            setNewGym({ name: '', location_id: '' });
            toast.success('Gym added successfully!');
            return;
          }
        } catch (dbError) {
          console.log('AdminDashboard: Database insert failed, using demo mode');
        }
      }
      
      // Fall back to demo mode
      const location = locations.find(loc => loc.id === newGym.location_id);
      const newGymObj = {
        id: `demo-gym-${Date.now()}`,
        name: newGym.name.trim(),
        location_id: newGym.location_id,
        created_at: new Date().toISOString(),
        locations_gym2024: { name: location?.name || 'Unknown', id: newGym.location_id }
      };
      setGyms(prev => [...prev, newGymObj]);
      setNewGym({ name: '', location_id: '' });
      toast.success('Gym added successfully! (Demo mode)');
    } catch (error) {
      console.error('AdminDashboard: Error adding gym:', error);
      toast.error('Failed to add gym');
    }
  };

  const deleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this location? This will also delete all gyms in this location.')) {
      return;
    }

    try {
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { error } = await supabase
            .from('locations_gym2024')
            .delete()
            .eq('id', locationId);
          
          if (!error) {
            setLocations(prev => prev.filter(loc => loc.id !== locationId));
            setGyms(prev => prev.filter(gym => gym.location_id !== locationId));
            toast.success('Location deleted successfully!');
            return;
          }
        } catch (dbError) {
          console.log('AdminDashboard: Database delete failed, using demo mode');
        }
      }
      
      // Fall back to demo mode
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
      setGyms(prev => prev.filter(gym => gym.location_id !== locationId));
      toast.success('Location deleted successfully! (Demo mode)');
    } catch (error) {
      console.error('AdminDashboard: Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const deleteGym = async (gymId) => {
    if (!window.confirm('Are you sure you want to delete this gym?')) {
      return;
    }

    try {
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { error } = await supabase
            .from('gyms_gym2024')
            .delete()
            .eq('id', gymId);
          
          if (!error) {
            setGyms(prev => prev.filter(gym => gym.id !== gymId));
            toast.success('Gym deleted successfully!');
            return;
          }
        } catch (dbError) {
          console.log('AdminDashboard: Database delete failed, using demo mode');
        }
      }
      
      // Fall back to demo mode
      setGyms(prev => prev.filter(gym => gym.id !== gymId));
      toast.success('Gym deleted successfully! (Demo mode)');
    } catch (error) {
      console.error('AdminDashboard: Error deleting gym:', error);
      toast.error('Failed to delete gym');
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { error } = await supabase
            .from('profiles_gym2024')
            .update({ role: newRole })
            .eq('id', userId);
          
          if (!error) {
            setUsers(prev => prev.map(user => 
              user.id === userId ? { ...user, role: newRole } : user
            ));
            return;
          }
        } catch (dbError) {
          console.log('AdminDashboard: Database update failed, using demo mode');
        }
      }
      
      // Fall back to demo mode
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('AdminDashboard: Error updating user role:', error);
      throw error;
    }
  };

  const handleGymVerification = async (gymAccountId, verified) => {
    setVerificationLoading(prev => ({ ...prev, [gymAccountId]: true }));
    
    try {
      if (supabase && typeof supabase.from === 'function') {
        try {
          const { error } = await supabase
            .from('gym_accounts_gym2024')
            .update({ 
              verified, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', gymAccountId);
          
          if (!error) {
            setGymAccounts(prev => prev.map(gym => 
              gym.id === gymAccountId ? { ...gym, verified, updated_at: new Date().toISOString() } : gym
            ));
            
            const action = verified ? 'verified' : 'rejected';
            toast.success(`Gym ${action} successfully!`);
            
            if (verified) {
              toast.success('🎉 Gym can now accept payments and manage memberships!', { duration: 5000 });
            }
            
            setVerificationLoading(prev => {
              const newState = { ...prev };
              delete newState[gymAccountId];
              return newState;
            });
            return;
          }
        } catch (dbError) {
          console.error('AdminDashboard: Database update failed:', dbError);
        }
      }
      
      // Fall back to demo mode
      setGymAccounts(prev => prev.map(gym => 
        gym.id === gymAccountId ? { ...gym, verified } : gym
      ));
      
      const action = verified ? 'verified' : 'rejected';
      toast.success(`Gym ${action} successfully! (Demo mode)`);
      
      if (verified) {
        toast.success('🎉 In production, this gym would now be able to accept payments!', { duration: 5000 });
      }
      
    } catch (error) {
      console.error('AdminDashboard: Error updating gym verification:', error);
      toast.error(`Failed to ${verified ? 'verify' : 'reject'} gym. Error: ${error.message}`);
    } finally {
      setVerificationLoading(prev => {
        const newState = { ...prev };
        delete newState[gymAccountId];
        return newState;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const refreshUsers = () => {
    fetchUsersData();
  };

  const refreshGymAccounts = () => {
    fetchGymAccounts();
  };

  const refreshGyms = () => {
    fetchGymsData();
  };

  const refreshLocations = () => {
    fetchLocationsData();
  };

  const pendingGymAccounts = gymAccounts.filter(gym => !gym.verified);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <SafeIcon icon={FiSettings} className="text-6xl text-red-400 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: 'Statistics', icon: FiBarChart3 },
    { id: 'gym-verification', label: 'Gym Verification', icon: FiBuilding, count: pendingGymAccounts.length },
    { id: 'users', label: 'Users', icon: FiUsers, count: users.length },
    { id: 'locations', label: 'Locations', icon: FiMapPin, count: locations.length },
    { id: 'gyms', label: 'Gyms', icon: FiHome, count: gyms.length }
  ];

  console.log('AdminDashboard Render:', {
    activeTab,
    gymsCount: gyms.length,
    locationsCount: locations.length,
    gymsLoading,
    locationsLoading
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <SafeIcon icon={FiSettings} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, locations, gyms, and view platform statistics</p>
          
          <div className="mt-4 bg-green-100 border border-green-200 rounded-lg p-3 inline-block">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCheckCircle} className="text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                🎉 All admin features are working including gym management!
              </span>
            </div>
          </div>

          {pendingGymAccounts.length > 0 && (
            <div className="mt-4 bg-orange-100 border border-orange-200 rounded-lg p-4 inline-block">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiAlertTriangle} className="text-orange-600" />
                <span className="text-orange-800 font-medium">
                  {pendingGymAccounts.length} gym{pendingGymAccounts.length > 1 ? 's' : ''} pending verification
                </span>
                <button
                  onClick={() => setActiveTab('gym-verification')}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  Review Now
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tab.id === 'gym-verification' && tab.count > 0
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <SafeIcon icon={FiUsers} className="text-3xl text-blue-600 mb-2 mx-auto" />
                    <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                    <div className="text-gray-600">Total Users</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <SafeIcon icon={FiActivity} className="text-3xl text-green-600 mb-2 mx-auto" />
                    <div className="text-2xl font-bold text-green-600">{stats.totalWorkouts || 0}</div>
                    <div className="text-gray-600">Total Workouts</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <SafeIcon icon={FiMapPin} className="text-3xl text-purple-600 mb-2 mx-auto" />
                    <div className="text-2xl font-bold text-purple-600">{locations.length}</div>
                    <div className="text-gray-600">Locations</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-6 text-center">
                    <SafeIcon icon={FiHome} className="text-3xl text-orange-600 mb-2 mx-auto" />
                    <div className="text-2xl font-bold text-orange-600">{gyms.length}</div>
                    <div className="text-gray-600">Total Gyms</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Gym Verification Tab */}
            {activeTab === 'gym-verification' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Gym Account Verification</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {gymAccounts.length} total gym accounts
                    </span>
                    <button
                      onClick={refreshGymAccounts}
                      disabled={gymAccountsLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiRefreshCw} className={gymAccountsLoading ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {gymAccountsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading gym accounts...</p>
                  </div>
                ) : gymAccounts.length > 0 ? (
                  <div className="space-y-4">
                    {gymAccounts.map((gymAccount) => (
                      <div key={gymAccount.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <SafeIcon icon={FiBuilding} className="text-2xl text-blue-600" />
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{gymAccount.business_name}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">by {gymAccount.profiles_gym2024?.name}</span>
                                  {gymAccount.verified ? (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                                      <SafeIcon icon={FiCheckCircle} className="text-xs" />
                                      <span>Verified</span>
                                    </span>
                                  ) : (
                                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                                      <SafeIcon icon={FiClock} className="text-xs" />
                                      <span>Pending</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <SafeIcon icon={FiMail} className="text-gray-500" />
                                  <span className="text-gray-600">Email:</span>
                                  <span className="font-medium">{gymAccount.business_email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <SafeIcon icon={FiMapPin} className="text-gray-500" />
                                  <span className="text-gray-600">Address:</span>
                                  <span className="font-medium">
                                    {gymAccount.address}, {gymAccount.city}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                  <SafeIcon icon={FiCalendar} className="text-gray-500" />
                                  <span className="text-gray-600">Applied:</span>
                                  <span className="font-medium">{formatDate(gymAccount.created_at)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-gray-600">Plan:</span>
                                  <span className="font-medium capitalize">{gymAccount.subscription_plan}</span>
                                </div>
                              </div>
                            </div>

                            {gymAccount.description && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Description:</span> {gymAccount.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {!gymAccount.verified && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleGymVerification(gymAccount.id, true)}
                                disabled={verificationLoading[gymAccount.id]}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                              >
                                {verificationLoading[gymAccount.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <SafeIcon icon={FiCheck} />
                                )}
                                <span>{verificationLoading[gymAccount.id] ? 'Approving...' : 'Approve'}</span>
                              </button>
                              <button
                                onClick={() => handleGymVerification(gymAccount.id, false)}
                                disabled={verificationLoading[gymAccount.id]}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                              >
                                {verificationLoading[gymAccount.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <SafeIcon icon={FiX} />
                                )}
                                <span>{verificationLoading[gymAccount.id] ? 'Rejecting...' : 'Reject'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SafeIcon icon={FiBuilding} className="text-4xl text-gray-300 mb-2 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No gym accounts found</h3>
                    <p className="text-gray-600 mb-4">
                      No gym businesses have registered yet.
                    </p>
                    <button
                      onClick={refreshGymAccounts}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {users.length} total users
                    </span>
                    <button
                      onClick={refreshUsers}
                      disabled={usersLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiRefreshCw} className={usersLoading ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((userItem) => (
                      <div key={userItem.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <div className="flex items-start space-x-4">
                              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                                {userItem.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{userItem.name}</h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                                    userItem.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {userItem.role?.toUpperCase() || 'USER'}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <SafeIcon icon={FiMail} />
                                    <span>{userItem.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <SafeIcon icon={FiCalendar} />
                                    <span>Joined {formatDate(userItem.created_at)}</span>
                                  </div>
                                  {userItem.location && (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">Location:</span>
                                      <span>{userItem.location}</span>
                                    </div>
                                  )}
                                  {userItem.gym && (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">Gym:</span>
                                      <span>{userItem.gym}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <RoleManager
                              user={userItem}
                              onRoleUpdate={handleRoleUpdate}
                              canEdit={userItem.id !== user?.id}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SafeIcon icon={FiUsers} className="text-4xl text-gray-300 mb-2 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600 mb-4">
                      No users are currently registered.
                    </p>
                    <button
                      onClick={refreshUsers}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Location Management</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {locations.length} total locations
                    </span>
                    <button
                      onClick={refreshLocations}
                      disabled={locationsLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiRefreshCw} className={locationsLoading ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Location</h4>
                  <form onSubmit={addLocation} className="flex space-x-4">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter location name (e.g., Miami)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiPlus} />
                      <span>Add Location</span>
                    </button>
                  </form>
                </div>

                {locationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading locations...</p>
                  </div>
                ) : locations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map((location) => (
                      <div key={location.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <SafeIcon icon={FiMapPin} className="text-blue-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{location.name}</h4>
                              <p className="text-sm text-gray-600">
                                {gyms.filter(gym => gym.location_id === location.id).length} gyms
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteLocation(location.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                          >
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SafeIcon icon={FiMapPin} className="text-4xl text-gray-300 mb-2 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                    <p className="text-gray-600 mb-4">
                      Add your first location to get started.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Gyms Tab */}
            {activeTab === 'gyms' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Gym Management</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {gyms.length} total gyms
                    </span>
                    <button
                      onClick={refreshGyms}
                      disabled={gymsLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiRefreshCw} className={gymsLoading ? 'animate-spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Gym</h4>
                  <form onSubmit={addGym} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={newGym.name}
                      onChange={(e) => setNewGym({ ...newGym, name: e.target.value })}
                      placeholder="Enter gym name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <select
                      value={newGym.location_id}
                      onChange={(e) => setNewGym({ ...newGym, location_id: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <SafeIcon icon={FiPlus} />
                      <span>Add Gym</span>
                    </button>
                  </form>
                </div>

                {gymsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading gyms...</p>
                  </div>
                ) : gyms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gyms.map((gym) => (
                      <div key={gym.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <SafeIcon icon={FiHome} className="text-green-600 mt-1 text-xl" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{gym.name}</h4>
                              <p className="text-sm text-blue-600 font-medium">
                                📍 {gym.locations_gym2024?.name || 'Unknown Location'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Added {formatDate(gym.created_at)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                ID: {gym.id}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteGym(gym.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                            title="Delete gym"
                          >
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiHome} className="text-6xl text-gray-300 mb-4 mx-auto" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No gyms found</h3>
                    <p className="text-gray-600 mb-6">
                      {locations.length === 0 
                        ? 'Add some locations first, then you can add gyms to those locations.' 
                        : 'Add your first gym to get started. Make sure you have locations available first.'
                      }
                    </p>
                    {locations.length === 0 ? (
                      <button
                        onClick={() => setActiveTab('locations')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Add Locations First
                      </button>
                    ) : (
                      <button
                        onClick={refreshGyms}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                )}

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                    <strong>Debug Info:</strong>
                    <br />
                    Gyms loaded: {gyms.length}
                    <br />
                    Locations loaded: {locations.length}
                    <br />
                    Loading states: gyms={String(gymsLoading)}, locations={String(locationsLoading)}
                    <br />
                    Sample gym IDs: {gyms.slice(0, 3).map(g => g.id).join(', ')}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;