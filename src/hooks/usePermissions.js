import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
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

  const hasRole = (requiredRole) => {
    if (!user) return false;
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (!user) return false;
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList) => {
    if (!user) return false;
    return permissionList.every(permission => hasPermission(permission));
  };

  const getUserPermissions = () => {
    if (!user) return [];
    return permissions[user.role] || [];
  };

  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator');
  const isUser = () => hasRole('user');

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    isAdmin,
    isModerator,
    isUser,
    userRole: user?.role || 'user'
  };
};