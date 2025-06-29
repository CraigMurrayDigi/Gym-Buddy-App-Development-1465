import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiCheck, FiUser, FiDollarSign } = FiIcons;

const TrainerAvailability = ({ trainerId, isEditable = false, showBookingInterface = false }) => {
  const [availability, setAvailability] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { user } = useAuth();

  const daysOfWeek = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun' }
  ];

  // Demo availability data
  const DEMO_AVAILABILITY = {
    monday: [
      { id: '1', startTime: '06:00', endTime: '08:00', available: true, booked: false },
      { id: '2', startTime: '09:00', endTime: '10:00', available: true, booked: true },
      { id: '3', startTime: '10:00', endTime: '11:00', available: true, booked: false },
      { id: '4', startTime: '17:00', endTime: '18:00', available: true, booked: false },
      { id: '5', startTime: '18:00', endTime: '19:00', available: true, booked: false }
    ],
    tuesday: [
      { id: '6', startTime: '07:00', endTime: '08:00', available: true, booked: false },
      { id: '7', startTime: '08:00', endTime: '09:00', available: true, booked: true },
      { id: '8', startTime: '17:00', endTime: '18:00', available: true, booked: false },
      { id: '9', startTime: '19:00', endTime: '20:00', available: true, booked: false }
    ],
    wednesday: [
      { id: '10', startTime: '06:00', endTime: '07:00', available: true, booked: false },
      { id: '11', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: '12', startTime: '10:00', endTime: '11:00', available: true, booked: true },
      { id: '13', startTime: '18:00', endTime: '19:00', available: true, booked: false }
    ],
    thursday: [
      { id: '14', startTime: '07:00', endTime: '08:00', available: true, booked: false },
      { id: '15', startTime: '17:00', endTime: '18:00', available: true, booked: true },
      { id: '16', startTime: '18:00', endTime: '19:00', available: true, booked: false },
      { id: '17', startTime: '19:00', endTime: '20:00', available: true, booked: false }
    ],
    friday: [
      { id: '18', startTime: '06:00', endTime: '08:00', available: true, booked: false },
      { id: '19', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: '20', startTime: '17:00', endTime: '18:00', available: true, booked: false }
    ],
    saturday: [
      { id: '21', startTime: '08:00', endTime: '09:00', available: true, booked: false },
      { id: '22', startTime: '09:00', endTime: '10:00', available: true, booked: true },
      { id: '23', startTime: '10:00', endTime: '11:00', available: true, booked: false },
      { id: '24', startTime: '11:00', endTime: '12:00', available: true, booked: false }
    ],
    sunday: [
      { id: '25', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: '26', startTime: '10:00', endTime: '11:00', available: true, booked: false }
    ]
  };

  useEffect(() => {
    fetchAvailability();
  }, [trainerId]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the database
      // For demo, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      setAvailability(DEMO_AVAILABILITY);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayId) => {
    const newSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '10:00',
      available: true,
      booked: false
    };

    setAvailability(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
  };

  const removeTimeSlot = (dayId, slotId) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: prev[dayId].filter(slot => slot.id !== slotId)
    }));
  };

  const updateTimeSlot = (dayId, slotId, updates) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: prev[dayId].map(slot =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    }));
  };

  const toggleAvailability = (dayId, slotId) => {
    updateTimeSlot(dayId, slotId, { 
      available: !availability[dayId].find(slot => slot.id === slotId).available 
    });
  };

  const saveAvailability = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditMode(false);
      toast.success('Availability updated successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (slot, dayId) => {
    if (!user) {
      toast.error('Please sign in to book sessions');
      return;
    }

    if (slot.booked) {
      toast.error('This time slot is already booked');
      return;
    }

    try {
      // In a real app, this would create a booking
      updateTimeSlot(dayId, slot.id, { booked: true });
      toast.success('Session booked successfully!');
    } catch (error) {
      toast.error('Failed to book session');
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSlotStatus = (slot) => {
    if (slot.booked) return 'booked';
    if (!slot.available) return 'unavailable';
    return 'available';
  };

  const getSlotColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unavailable':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const TimeSlotCard = ({ slot, dayId, isEditable }) => {
    const status = getSlotStatus(slot);
    const [localStartTime, setLocalStartTime] = useState(slot.startTime);
    const [localEndTime, setLocalEndTime] = useState(slot.endTime);

    const handleTimeChange = (field, value) => {
      if (field === 'startTime') {
        setLocalStartTime(value);
        updateTimeSlot(dayId, slot.id, { startTime: value });
      } else {
        setLocalEndTime(value);
        updateTimeSlot(dayId, slot.id, { endTime: value });
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`p-3 rounded-lg border-2 transition-all ${getSlotColor(status)} ${
          showBookingInterface && status === 'available' ? 'cursor-pointer' : ''
        }`}
        onClick={() => showBookingInterface && status === 'available' && handleBookSession(slot, dayId)}
      >
        <div className="flex items-center justify-between">
          {editMode && isEditable ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="time"
                value={localStartTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="text-xs border border-gray-300 rounded px-1 py-1"
              />
              <span className="text-xs">-</span>
              <input
                type="time"
                value={localEndTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
          ) : (
            <div className="flex-1">
              <div className="text-sm font-medium">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </div>
              <div className="text-xs opacity-75">
                {status === 'booked' ? 'Booked' : 
                 status === 'unavailable' ? 'Unavailable' : 
                 showBookingInterface ? 'Click to book' : 'Available'}
              </div>
            </div>
          )}

          {editMode && isEditable && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAvailability(dayId, slot.id);
                }}
                className={`p-1 rounded transition-colors ${
                  slot.available ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                }`}
                title={slot.available ? 'Available' : 'Unavailable'}
              >
                <SafeIcon icon={FiCheck} className="text-xs" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTimeSlot(dayId, slot.id);
                }}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Remove slot"
              >
                <SafeIcon icon={FiTrash2} className="text-xs" />
              </button>
            </div>
          )}

          {showBookingInterface && status === 'available' && (
            <SafeIcon icon={FiUser} className="text-green-600" />
          )}
        </div>
      </motion.div>
    );
  };

  if (loading && Object.keys(availability).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {showBookingInterface ? 'Book a Session' : 'Weekly Availability'}
            </h2>
            <p className="text-blue-100">
              {showBookingInterface 
                ? 'Select an available time slot to book your training session'
                : editMode 
                  ? 'Edit your weekly schedule and availability'
                  : 'View your weekly training schedule'
              }
            </p>
          </div>
          
          {isEditable && (
            <div className="flex items-center space-x-2">
              {editMode ? (
                <>
                  <button
                    onClick={saveAvailability}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      fetchAvailability(); // Reset changes
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    <SafeIcon icon={FiX} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiEdit2} />
                  <span>Edit Schedule</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {daysOfWeek.map((day) => (
            <div key={day.id} className="space-y-4">
              {/* Day Header */}
              <div className="text-center">
                <h3 className="font-bold text-gray-900">{day.short}</h3>
                <p className="text-sm text-gray-500">{day.label}</p>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <AnimatePresence>
                  {(availability[day.id] || []).map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      dayId={day.id}
                      isEditable={isEditable}
                    />
                  ))}
                </AnimatePresence>

                {/* Add Slot Button */}
                {editMode && isEditable && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => addTimeSlot(day.id)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <SafeIcon icon={FiPlus} />
                    <span className="text-sm">Add Slot</span>
                  </motion.button>
                )}

                {/* Empty State */}
                {(!availability[day.id] || availability[day.id].length === 0) && !editMode && (
                  <div className="text-center py-8 text-gray-400">
                    <SafeIcon icon={FiClock} className="text-2xl mb-2 mx-auto" />
                    <p className="text-sm">No availability</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {/* Summary Stats */}
        {!editMode && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(availability).flat().filter(slot => slot.available && !slot.booked).length}
              </div>
              <div className="text-sm text-green-800">Available Slots</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(availability).flat().filter(slot => slot.booked).length}
              </div>
              <div className="text-sm text-red-800">Booked Sessions</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(availability).flat().length}
              </div>
              <div className="text-sm text-blue-800">Total Slots</div>
            </div>
          </div>
        )}

        {/* Edit Mode Instructions */}
        {editMode && isEditable && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Edit Mode Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Add Slot" to create new time slots</li>
              <li>• Edit start and end times directly</li>
              <li>• Use the check button to toggle availability</li>
              <li>• Use the trash button to remove slots</li>
              <li>• Click "Save" to save your changes</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerAvailability;