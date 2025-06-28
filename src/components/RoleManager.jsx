import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiUser, FiEdit2, FiCheck, FiX, FiAlertTriangle } = FiIcons;

const RoleManager = ({ user, onRoleUpdate, canEdit = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      value: 'user',
      label: 'User',
      description: 'Standard user with basic access',
      color: 'bg-blue-100 text-blue-800',
      icon: FiUser
    },
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Full access to admin features',
      color: 'bg-red-100 text-red-800',
      icon: FiShield
    },
    {
      value: 'moderator',
      label: 'Moderator',
      description: 'Can moderate content and users',
      color: 'bg-yellow-100 text-yellow-800',
      icon: FiAlertTriangle
    }
  ];

  const getCurrentRole = () => {
    return roles.find(role => role.value === user.role) || roles[0];
  };

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onRoleUpdate(user.id, selectedRole);
      toast.success(`Role updated to ${roles.find(r => r.value === selectedRole)?.label}`);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update role');
      setSelectedRole(user.role);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(user.role);
    setIsEditing(false);
  };

  const currentRole = getCurrentRole();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Role Management</h3>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <SafeIcon icon={FiEdit2} className="text-sm" />
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="flex items-center space-x-3">
          <SafeIcon icon={currentRole.icon} className="text-lg" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{currentRole.label}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentRole.color}`}>
                {currentRole.value.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{currentRole.description}</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRole === role.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <SafeIcon icon={role.icon} className="text-lg" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{role.label}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                      {role.value.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleRoleChange}
              disabled={loading || selectedRole === user.role}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiCheck} />
              <span>{loading ? 'Updating...' : 'Update Role'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiX} />
              <span>Cancel</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RoleManager;