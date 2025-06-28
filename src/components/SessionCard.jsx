import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUser, FiMapPin, FiDollarSign, FiMessageCircle, FiVideo, FiCheck, FiX, FiEdit3 } = FiIcons;

const SessionCard = ({ session, onAccept, onDecline, onReschedule, onCancel, onMessage, userType = 'client' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{session.sessionType || 'Personal Training'}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <SafeIcon icon={FiUser} className="text-gray-500" />
            <span className="text-gray-600">
              {userType === 'trainer' ? `with ${session.clientName}` : `with ${session.trainerName}`}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
          {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
        </span>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <SafeIcon icon={FiCalendar} />
          <span>{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <SafeIcon icon={FiClock} />
          <span>{formatTime(session.time)} ({session.duration} min)</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <SafeIcon icon={FiMapPin} />
          <span>{session.location || 'Trainer Location'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <SafeIcon icon={FiDollarSign} />
          <span>{formatPrice(session.totalCost || 75)}</span>
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{session.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Message Button - Always available */}
        <button
          onClick={() => onMessage && onMessage(session)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <SafeIcon icon={FiMessageCircle} />
          <span>Message</span>
        </button>

        {/* Status-specific buttons */}
        {session.status === 'pending' && userType === 'trainer' && (
          <>
            <button
              onClick={() => onAccept && onAccept(session)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <SafeIcon icon={FiCheck} />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onDecline && onDecline(session)}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <SafeIcon icon={FiX} />
              <span>Decline</span>
            </button>
          </>
        )}

        {session.status === 'confirmed' && (
          <>
            <button
              onClick={() => onReschedule && onReschedule(session)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <SafeIcon icon={FiEdit3} />
              <span>Reschedule</span>
            </button>
            
            {/* Video Call button for confirmed sessions */}
            {new Date(`${session.date}T${session.time}`) <= new Date() && (
              <button
                onClick={() => window.open('#', '_blank')}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <SafeIcon icon={FiVideo} />
                <span>Join Video</span>
              </button>
            )}
          </>
        )}

        {(session.status === 'pending' || session.status === 'confirmed') && (
          <button
            onClick={() => onCancel && onCancel(session)}
            className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <SafeIcon icon={FiX} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Session Info for upcoming sessions */}
      {session.status === 'confirmed' && new Date(`${session.date}T${session.time}`) > new Date() && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Reminder:</strong> Your session is coming up. Make sure to arrive 5-10 minutes early.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SessionCard;