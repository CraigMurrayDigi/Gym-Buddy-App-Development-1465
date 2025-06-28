import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import Navbar from '../components/Navbar';
import RoleManager from '../components/RoleManager';
import PermissionGuard from '../components/PermissionGuard';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiSearch, FiFilter, FiShield, FiUser, FiMail, FiCalendar, FiAlertTriangle } = FiIcons;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'user', label: 'Users' },
    { value: 'moderator', label: 'Moderators' },
    { value: 'admin', label: 'Administrators' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        // Demo data for when Supabase is not available
        const demoUsers = [
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
            role: 'moderator',
            location: 'Los Angeles',
            gym: 'Gold\'s Gym Venice',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
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
        setUsers(demoUsers);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles_gym2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        // Update demo data
        setUsers(prev => prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
        return;
      }

      const { error } = await supabase
        .from('profiles_gym2024')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return FiShield;
      case 'moderator': return FiAlertTriangle;
      default: return FiUser;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <PermissionGuard requiredPermissions={['manage_users']}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <SafeIcon icon={FiUsers} className="text-4xl text-blue-600 mb-4 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <div className="relative">
                  <SafeIcon icon={FiFilter} className="absolute left-3 top-3 text-gray-400" />
                  <select
                    id="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Users List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {user.role?.toUpperCase() || 'USER'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiMail} />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiCalendar} />
                              <span>Joined {formatDate(user.created_at)}</span>
                            </div>
                            {user.location && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Location:</span>
                                <span>{user.location}</span>
                              </div>
                            )}
                            {user.gym && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Gym:</span>
                                <span>{user.gym}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role Management */}
                    <div>
                      <PermissionGuard requiredPermissions={['manage_roles']}>
                        <RoleManager
                          user={user}
                          onRoleUpdate={handleRoleUpdate}
                          canEdit={user.id !== currentUser?.id}
                        />
                      </PermissionGuard>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <SafeIcon icon={FiUsers} className="text-6xl text-gray-300 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users are currently registered'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};

export default UserManagement;