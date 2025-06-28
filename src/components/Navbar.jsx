import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiHome, FiCalendar, FiUsers, FiMessageCircle, FiUser, FiLogOut, FiDumbbell,
  FiSearch, FiUpload, FiSettings, FiBuilding, FiCompass, FiAward
} = FiIcons;

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Determine dashboard path based on account type
  const getDashboardPath = () => {
    if (user?.account_type === 'gym_owner') {
      return '/gym-dashboard';
    } else if (user?.account_type === 'personal_trainer') {
      return '/trainer-dashboard';
    }
    return '/dashboard';
  };

  // Get navigation items based on account type
  const getNavItems = () => {
    const baseItems = [
      // Dashboard (varies by account type)
      user?.account_type === 'gym_owner' 
        ? { path: '/gym-dashboard', icon: FiBuilding, label: 'Dashboard' }
        : user?.account_type === 'personal_trainer'
        ? { path: '/trainer-dashboard', icon: FiAward, label: 'Dashboard' }
        : { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
      
      // Directory items - ALWAYS SHOW THESE
      { path: '/gym-directory', icon: FiCompass, label: 'Gyms' },
      { path: '/trainer-directory', icon: FiAward, label: 'Trainers' },
      
      // Core workout features
      { path: '/schedule', icon: FiCalendar, label: 'Schedule' },
      { path: '/find-buddies', icon: FiUsers, label: 'Find Buddies' },
      { path: '/search-members', icon: FiSearch, label: 'Members' },
      { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
      { path: '/upload-media', icon: FiUpload, label: 'Media' },
      { path: '/profile', icon: FiUser, label: 'Profile' }
    ];

    // Add admin dashboard for admin users
    if (user?.role === 'admin') {
      baseItems.push({ path: '/admin', icon: FiSettings, label: 'Admin' });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  console.log('Navigation items:', navItems); // Debug log

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardPath()} className="flex items-center space-x-2">
            <SafeIcon icon={FiDumbbell} className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Gym Buddy</span>
          </Link>

          {/* Desktop Navigation - Show first 8 items directly */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.slice(0, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={item.icon} className="text-lg" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}

            {/* More Menu - Only show if there are more than 8 items */}
            {navItems.length > 8 && (
              <div className="relative group">
                <button className="flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                  <span className="text-xs">More</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {navItems.slice(8).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                        location.pathname === item.path
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <SafeIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Hi, {user?.name || 'User'}</span>

            {/* Account Type Badge */}
            {user?.account_type === 'gym_owner' && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                Gym Owner
              </span>
            )}
            {user?.account_type === 'personal_trainer' && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                Personal Trainer
              </span>
            )}
            {user?.role === 'admin' && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                Admin
              </span>
            )}
            {user?.role === 'moderator' && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Moderator
              </span>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="text-lg" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-t border-gray-200">
        {/* First row - Core features including Trainer Directory */}
        <div className="grid grid-cols-5 gap-1 py-2">
          <Link
            to={getDashboardPath()}
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === getDashboardPath()
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={user?.account_type === 'gym_owner' ? FiBuilding : user?.account_type === 'personal_trainer' ? FiAward : FiHome} className="text-lg mb-1" />
            <span className="truncate">Home</span>
          </Link>
          
          <Link
            to="/gym-directory"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/gym-directory'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiCompass} className="text-lg mb-1" />
            <span className="truncate">Gyms</span>
          </Link>
          
          <Link
            to="/trainer-directory"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/trainer-directory'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiAward} className="text-lg mb-1" />
            <span className="truncate">Trainers</span>
          </Link>
          
          <Link
            to="/schedule"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/schedule'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiCalendar} className="text-lg mb-1" />
            <span className="truncate">Schedule</span>
          </Link>
          
          <Link
            to="/find-buddies"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/find-buddies'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiUsers} className="text-lg mb-1" />
            <span className="truncate">Buddies</span>
          </Link>
        </div>

        {/* Second row for mobile */}
        <div className="grid grid-cols-4 gap-1 py-2 border-t border-gray-100">
          <Link
            to="/search-members"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/search-members'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiSearch} className="text-lg mb-1" />
            <span className="truncate">Search</span>
          </Link>
          
          <Link
            to="/chat"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/chat'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiMessageCircle} className="text-lg mb-1" />
            <span className="truncate">Chat</span>
          </Link>
          
          <Link
            to="/upload-media"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/upload-media'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiUpload} className="text-lg mb-1" />
            <span className="truncate">Media</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <SafeIcon icon={FiUser} className="text-lg mb-1" />
            <span className="truncate">Profile</span>
          </Link>
        </div>

        {/* Admin row if admin */}
        {user?.role === 'admin' && (
          <div className="border-t border-gray-100 py-2">
            <Link
              to="/admin"
              className={`flex items-center justify-center py-2 px-4 rounded-md text-xs font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <SafeIcon icon={FiSettings} className="text-lg mr-2" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;