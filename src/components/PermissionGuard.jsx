import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLock } = FiIcons;

const PermissionGuard = ({ 
  children, 
  requiredRole = 'user', 
  requiredPermissions = [], 
  fallback = null,
  showMessage = true 
}) => {
  const { user } = useAuth();

  const roleHierarchy = {
    user: 1,
    moderator: 2,
    admin: 3
  };

  const permissions = {
    user: [
      'view_profile',
      'edit_own_profile',
      'create_workout',
      'join_workout',
      'send_message',
      'upload_media'
    ],
    moderator: [
      'view_profile',
      'edit_own_profile',
      'create_workout',
      'join_workout',
      'send_message',
      'upload_media',
      'moderate_content',
      'view_reports',
      'manage_user_content'
    ],
    admin: [
      'view_profile',
      'edit_own_profile',
      'create_workout',
      'join_workout',
      'send_message',
      'upload_media',
      'moderate_content',
      'view_reports',
      'manage_user_content',
      'manage_users',
      'manage_roles',
      'manage_locations',
      'manage_gyms',
      'view_analytics',
      'system_settings'
    ]
  };

  const hasRole = (userRole, requiredRole) => {
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };

  const hasPermissions = (userRole, requiredPermissions) => {
    if (!requiredPermissions.length) return true;
    
    const userPermissions = permissions[userRole] || [];
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  };

  if (!user) {
    if (fallback) return fallback;
    if (!showMessage) return null;
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <SafeIcon icon={FiLock} className="text-2xl text-yellow-600 mb-2 mx-auto" />
        <p className="text-yellow-800 font-medium">Authentication Required</p>
        <p className="text-yellow-600 text-sm">Please sign in to access this feature</p>
      </div>
    );
  }

  const hasRequiredRole = hasRole(user.role, requiredRole);
  const hasRequiredPermissions = hasPermissions(user.role, requiredPermissions);

  if (!hasRequiredRole || !hasRequiredPermissions) {
    if (fallback) return fallback;
    if (!showMessage) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <SafeIcon icon={FiLock} className="text-2xl text-red-600 mb-2 mx-auto" />
        <p className="text-red-800 font-medium">Access Denied</p>
        <p className="text-red-600 text-sm">
          You don't have permission to access this feature
        </p>
      </div>
    );
  }

  return children;
};

export default PermissionGuard;