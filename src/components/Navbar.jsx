import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiHome, FiCalendar, FiUsers, FiMessageCircle, FiUser, FiLogOut, FiDumbbell,
  FiSearch, FiUpload, FiSettings, FiBuilding, FiCompass, FiMap, FiAward
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
    if (user?.account_type === 'gym_owner') {
      // Gym owner navigation
      return [
        { path: '/gym-dashboard', icon: FiBuilding, label: 'Gym Dashboard' },
        { path: '/gym-directory', icon: FiCompass, label: 'Gym Directory' },
        { path: '/schedule', icon: FiCalendar, label: 'Schedule' },
        { path: '/find-buddies', icon: FiUsers, label: 'Find Buddies' },
        { path: '/search-members', icon: FiSearch, label: 'Search Members' },
        { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
        { path: '/upload-media', icon: FiUpload, label: 'Upload Media' },
        { path: '/profile', icon: FiUser, label: 'Profile' }
      ];
    } else if (user?.account_type === 'personal_trainer') {
      // Personal trainer navigation
      return [
        { path: '/trainer-dashboard', icon: FiAward, label: 'Trainer Dashboard' },
        { path: '/gym-directory', icon: FiCompass, label: 'Gym Directory' },
        { path: '/schedule', icon: FiCalendar, label: 'Schedule' },
        { path: '/find-buddies', icon: FiUsers, label: 'Find Buddies' },
        { path: '/search-members', icon: FiSearch, label: 'Search Members' },
        { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
        { path: '/upload-media', icon: FiUpload, label: 'Upload Media' },
        { path: '/profile', icon: FiUser, label: 'Profile' }
      ];
    } else {
      // Regular user navigation
      const navItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/gym-directory', icon: FiCompass, label: 'Gym Directory' },
        { path: '/schedule', icon: FiCalendar, label: 'Schedule' },
        { path: '/find-buddies', icon: FiUsers, label: 'Find Buddies' },
        { path: '/search-members', icon: FiSearch, label: 'Search Members' },
        { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
        { path: '/upload-media', icon: FiUpload, label: 'Upload Media' },
        { path: '/profile', icon: FiUser, label: 'Profile' }
      ];

      // Add admin dashboard for admin users
      if (user?.role === 'admin') {
        navItems.push({ path: '/admin', icon: FiSettings, label: 'Admin' });
      }

      return navItems;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardPath()} className="flex items-center space-x-2">
            <SafeIcon icon={FiDumbbell} className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Gym Buddy</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={item.icon} className="text-lg" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* More Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                <span>More</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {navItems.slice(5).map((item) => (
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
        <div className="grid grid-cols-4 gap-1 py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <SafeIcon icon={item.icon} className="text-lg mb-1" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;