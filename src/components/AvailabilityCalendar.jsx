import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TrainerAvailability from './TrainerAvailability';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiUser } = FiIcons;

const AvailabilityCalendar = ({ trainerId, trainerName, hourlyRate, showBookingInterface = true }) => {
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  const [selectedDate, setSelectedDate] = useState(null);

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (start, end) => {
    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (start.getMonth() === end.getMonth()) {
      return `${startStr} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${startStr} - ${endStr}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {showBookingInterface ? `Book with ${trainerName}` : 'Availability Calendar'}
            </h2>
            <p className="text-gray-600">
              {showBookingInterface ? `$${hourlyRate}/hour` : 'Manage your weekly availability'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiChevronLeft} />
            </button>
            
            <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg font-medium">
              {formatDateRange(weekStart, weekEnd)}
            </div>
            
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              disabled={currentWeek >= 4} // Limit to 4 weeks ahead
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiChevronRight} />
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const isPastDate = isPast(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={index}
                whileHover={!isPastDate ? { scale: 1.05 } : {}}
                onClick={() => !isPastDate && setSelectedDate(date)}
                className={`p-4 rounded-lg text-center cursor-pointer transition-all ${
                  isPastDate
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : selectedDate?.toDateString() === date.toDateString()
                    ? 'bg-blue-600 text-white'
                    : isTodayDate
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                }`}
              >
                <div className="text-sm font-medium">{dayNames[date.getDay()]}</div>
                <div className="text-lg font-bold">{date.getDate()}</div>
                {isTodayDate && !isPastDate && (
                  <div className="text-xs text-blue-600 font-medium">Today</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {currentWeek === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Current week • Today is highlighted
          </div>
        )}
      </div>

      {/* Availability Component */}
      <TrainerAvailability
        trainerId={trainerId}
        isEditable={!showBookingInterface}
        showBookingInterface={showBookingInterface}
      />

      {/* Booking Instructions */}
      {showBookingInterface && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <SafeIcon icon={FiClock} className="text-green-600 text-xl mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How to Book</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Green slots are available for booking</li>
                <li>• Red slots are already booked</li>
                <li>• Click on any available slot to book instantly</li>
                <li>• You'll receive a confirmation email after booking</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;