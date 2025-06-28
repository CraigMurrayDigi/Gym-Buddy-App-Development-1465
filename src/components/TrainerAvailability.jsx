import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiCalendar, FiClock, FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiCheck, 
  FiUser, FiDollarSign, FiAlertTriangle, FiCopy, FiRotateCcw, FiEye, FiEyeOff,
  FiSettings, FiRefreshCw, FiCheckCircle, FiXCircle 
} = FiIcons;

const TrainerAvailability = ({ trainerId, isEditable = false, showBookingInterface = false }) => {
  const [availability, setAvailability] = useState({});
  const [originalAvailability, setOriginalAvailability] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [changes, setChanges] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
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

  // Demo availability data with more realistic schedule
  const DEMO_AVAILABILITY = {
    monday: [
      { id: 'mon-1', startTime: '06:00', endTime: '07:00', available: true, booked: false },
      { id: 'mon-2', startTime: '07:00', endTime: '08:00', available: true, booked: true },
      { id: 'mon-3', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: 'mon-4', startTime: '10:00', endTime: '11:00', available: true, booked: true },
      { id: 'mon-5', startTime: '17:00', endTime: '18:00', available: true, booked: false },
      { id: 'mon-6', startTime: '18:00', endTime: '19:00', available: true, booked: false },
      { id: 'mon-7', startTime: '19:00', endTime: '20:00', available: false, booked: false }
    ],
    tuesday: [
      { id: 'tue-1', startTime: '07:00', endTime: '08:00', available: true, booked: false },
      { id: 'tue-2', startTime: '08:00', endTime: '09:00', available: true, booked: true },
      { id: 'tue-3', startTime: '17:00', endTime: '18:00', available: true, booked: false },
      { id: 'tue-4', startTime: '19:00', endTime: '20:00', available: true, booked: false }
    ],
    wednesday: [
      { id: 'wed-1', startTime: '06:00', endTime: '07:00', available: true, booked: false },
      { id: 'wed-2', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: 'wed-3', startTime: '10:00', endTime: '11:00', available: true, booked: true },
      { id: 'wed-4', startTime: '18:00', endTime: '19:00', available: true, booked: false }
    ],
    thursday: [
      { id: 'thu-1', startTime: '07:00', endTime: '08:00', available: true, booked: false },
      { id: 'thu-2', startTime: '17:00', endTime: '18:00', available: true, booked: true },
      { id: 'thu-3', startTime: '18:00', endTime: '19:00', available: true, booked: false },
      { id: 'thu-4', startTime: '19:00', endTime: '20:00', available: true, booked: false }
    ],
    friday: [
      { id: 'fri-1', startTime: '06:00', endTime: '08:00', available: true, booked: false },
      { id: 'fri-2', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: 'fri-3', startTime: '17:00', endTime: '18:00', available: true, booked: false }
    ],
    saturday: [
      { id: 'sat-1', startTime: '08:00', endTime: '09:00', available: true, booked: false },
      { id: 'sat-2', startTime: '09:00', endTime: '10:00', available: true, booked: true },
      { id: 'sat-3', startTime: '10:00', endTime: '11:00', available: true, booked: false },
      { id: 'sat-4', startTime: '11:00', endTime: '12:00', available: true, booked: false }
    ],
    sunday: [
      { id: 'sun-1', startTime: '09:00', endTime: '10:00', available: true, booked: false },
      { id: 'sun-2', startTime: '10:00', endTime: '11:00', available: true, booked: false }
    ]
  };

  useEffect(() => {
    fetchAvailability();
  }, [trainerId]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the database
      await new Promise(resolve => setTimeout(resolve, 500));
      setAvailability(DEMO_AVAILABILITY);
      setOriginalAvailability(JSON.parse(JSON.stringify(DEMO_AVAILABILITY)));
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const generateSlotId = (dayId) => {
    const daySlots = availability[dayId] || [];
    const maxId = daySlots.length > 0 ? Math.max(...daySlots.map(slot => {
      const idNum = parseInt(slot.id.split('-')[1]);
      return isNaN(idNum) ? 0 : idNum;
    })) : 0;
    return `${dayId.substring(0, 3)}-${maxId + 1}`;
  };

  const addTimeSlot = (dayId) => {
    const existingSlots = availability[dayId] || [];
    
    // Find a good default time (next available hour or 9 AM)
    let defaultStart = '09:00';
    if (existingSlots.length > 0) {
      const lastSlot = existingSlots[existingSlots.length - 1];
      const lastEndHour = parseInt(lastSlot.endTime.split(':')[0]);
      if (lastEndHour < 21) { // Don't go past 9 PM
        defaultStart = `${String(lastEndHour + 1).padStart(2, '0')}:00`;
      }
    }

    const newSlot = {
      id: generateSlotId(dayId),
      startTime: defaultStart,
      endTime: `${String(parseInt(defaultStart.split(':')[0]) + 1).padStart(2, '0')}:00`,
      available: true,
      booked: false
    };

    const updatedSlots = [...existingSlots, newSlot].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    setAvailability(prev => ({
      ...prev,
      [dayId]: updatedSlots
    }));

    setChanges(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), 'added']
    }));

    toast.success('New time slot added');
  };

  const removeTimeSlot = (dayId, slotId) => {
    const slot = availability[dayId]?.find(s => s.id === slotId);
    
    if (slot?.booked) {
      toast.error('Cannot remove a booked time slot');
      return;
    }

    setAvailability(prev => ({
      ...prev,
      [dayId]: prev[dayId].filter(slot => slot.id !== slotId)
    }));

    setChanges(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), 'removed']
    }));

    toast.success('Time slot removed');
  };

  const updateTimeSlot = (dayId, slotId, updates) => {
    const currentSlots = availability[dayId] || [];
    const slotIndex = currentSlots.findIndex(slot => slot.id === slotId);
    
    if (slotIndex === -1) return;

    const updatedSlot = { ...currentSlots[slotIndex], ...updates };
    
    // Validate time slot
    const validation = validateTimeSlot(updatedSlot, dayId, slotId);
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [slotId]: validation.error
      }));
      return;
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[slotId];
        return newErrors;
      });
    }

    const updatedSlots = [...currentSlots];
    updatedSlots[slotIndex] = updatedSlot;
    
    // Re-sort by time
    updatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setAvailability(prev => ({
      ...prev,
      [dayId]: updatedSlots
    }));

    setChanges(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), 'modified']
    }));
  };

  const validateTimeSlot = (slot, dayId, excludeSlotId = null) => {
    const { startTime, endTime } = slot;
    
    // Check if end time is after start time
    if (startTime >= endTime) {
      return { isValid: false, error: 'End time must be after start time' };
    }

    // Check for overlapping slots
    const daySlots = availability[dayId] || [];
    const overlapping = daySlots.find(existingSlot => {
      if (existingSlot.id === excludeSlotId) return false;
      
      return (
        (startTime >= existingSlot.startTime && startTime < existingSlot.endTime) ||
        (endTime > existingSlot.startTime && endTime <= existingSlot.endTime) ||
        (startTime <= existingSlot.startTime && endTime >= existingSlot.endTime)
      );
    });

    if (overlapping) {
      return { isValid: false, error: 'Time slot overlaps with existing slot' };
    }

    return { isValid: true };
  };

  const toggleAvailability = (dayId, slotId) => {
    const slot = availability[dayId]?.find(s => s.id === slotId);
    if (slot?.booked) {
      toast.error('Cannot change availability of booked slots');
      return;
    }

    updateTimeSlot(dayId, slotId, { 
      available: !slot.available 
    });
  };

  const toggleSlotSelection = (dayId, slotId) => {
    const slotKey = `${dayId}-${slotId}`;
    setSelectedSlots(prev => 
      prev.includes(slotKey) 
        ? prev.filter(key => key !== slotKey)
        : [...prev, slotKey]
    );
  };

  const bulkToggleAvailability = (makeAvailable) => {
    selectedSlots.forEach(slotKey => {
      const [dayId, slotId] = slotKey.split('-').reduce((acc, part, index) => {
        if (index === 0) acc[0] = part;
        else if (index === 1) acc[1] = part;
        else acc[1] += `-${part}`;
        return acc;
      }, ['', '']);
      
      const slot = availability[dayId]?.find(s => s.id === slotId);
      if (slot && !slot.booked) {
        updateTimeSlot(dayId, slotId, { available: makeAvailable });
      }
    });
    
    setSelectedSlots([]);
    setBulkEditMode(false);
    toast.success(`${selectedSlots.length} slots updated`);
  };

  const bulkRemoveSlots = () => {
    let removedCount = 0;
    selectedSlots.forEach(slotKey => {
      const [dayId, slotId] = slotKey.split('-').reduce((acc, part, index) => {
        if (index === 0) acc[0] = part;
        else if (index === 1) acc[1] = part;
        else acc[1] += `-${part}`;
        return acc;
      }, ['', '']);
      
      const slot = availability[dayId]?.find(s => s.id === slotId);
      if (slot && !slot.booked) {
        removeTimeSlot(dayId, slotId);
        removedCount++;
      }
    });
    
    setSelectedSlots([]);
    setBulkEditMode(false);
    toast.success(`${removedCount} slots removed`);
  };

  const copyDaySchedule = (fromDayId, toDayId) => {
    const fromSlots = availability[fromDayId] || [];
    const copiedSlots = fromSlots.map(slot => ({
      ...slot,
      id: generateSlotId(toDayId),
      booked: false // Don't copy bookings
    }));

    setAvailability(prev => ({
      ...prev,
      [toDayId]: copiedSlots
    }));

    setChanges(prev => ({
      ...prev,
      [toDayId]: [...(prev[toDayId] || []), 'copied']
    }));

    toast.success(`Schedule copied from ${fromDayId} to ${toDayId}`);
  };

  const clearDaySchedule = (dayId) => {
    const daySlots = availability[dayId] || [];
    const bookedSlots = daySlots.filter(slot => slot.booked);
    
    if (bookedSlots.length > 0) {
      toast.error(`Cannot clear ${dayId} - has ${bookedSlots.length} booked slot(s)`);
      return;
    }

    setAvailability(prev => ({
      ...prev,
      [dayId]: []
    }));

    setChanges(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), 'cleared']
    }));

    toast.success(`${dayId} schedule cleared`);
  };

  const saveAvailability = async () => {
    setSaveLoading(true);
    
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix validation errors before saving');
      setSaveLoading(false);
      return;
    }

    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOriginalAvailability(JSON.parse(JSON.stringify(availability)));
      setEditMode(false);
      setChanges({});
      setSelectedSlots([]);
      setBulkEditMode(false);
      
      toast.success('Availability updated successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setSaveLoading(false);
    }
  };

  const cancelEdit = () => {
    setAvailability(JSON.parse(JSON.stringify(originalAvailability)));
    setEditMode(false);
    setChanges({});
    setSelectedSlots([]);
    setBulkEditMode(false);
    setValidationErrors({});
    toast.info('Changes discarded');
  };

  const getChangeCount = () => {
    return Object.values(changes).reduce((total, dayChanges) => total + dayChanges.length, 0);
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

    if (!slot.available) {
      toast.error('This time slot is not available');
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

  const getSlotColor = (status, isSelected = false) => {
    if (isSelected) {
      return 'bg-blue-200 text-blue-900 border-blue-400 ring-2 ring-blue-500';
    }
    
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

  const TimeSlotCard = ({ slot, dayId }) => {
    const status = getSlotStatus(slot);
    const slotKey = `${dayId}-${slot.id}`;
    const isSelected = selectedSlots.includes(slotKey);
    const hasError = validationErrors[slot.id];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`p-3 rounded-lg border-2 transition-all relative ${
          hasError ? 'border-red-500 bg-red-50' : getSlotColor(status, isSelected)
        } ${
          showBookingInterface && status === 'available' ? 'cursor-pointer' : ''
        } ${
          bulkEditMode && !slot.booked ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (bulkEditMode && !slot.booked) {
            toggleSlotSelection(dayId, slot.id);
          } else if (showBookingInterface && status === 'available') {
            handleBookSession(slot, dayId);
          }
        }}
      >
        {/* Validation Error */}
        {hasError && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
            <SafeIcon icon={FiAlertTriangle} className="text-xs" />
          </div>
        )}

        <div className="flex items-center justify-between">
          {editMode && isEditable ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateTimeSlot(dayId, slot.id, { startTime: e.target.value })}
                className={`text-xs border rounded px-1 py-1 ${
                  hasError ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-xs">-</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateTimeSlot(dayId, slot.id, { endTime: e.target.value })}
                className={`text-xs border rounded px-1 py-1 ${
                  hasError ? 'border-red-500' : 'border-gray-300'
                }`}
                onClick={(e) => e.stopPropagation()}
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

          {editMode && isEditable && !bulkEditMode && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAvailability(dayId, slot.id);
                }}
                disabled={slot.booked}
                className={`p-1 rounded transition-colors ${
                  slot.available 
                    ? 'text-green-600 hover:text-green-800' 
                    : 'text-gray-400 hover:text-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={slot.available ? 'Available' : 'Unavailable'}
              >
                <SafeIcon icon={slot.available ? FiEye : FiEyeOff} className="text-xs" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTimeSlot(dayId, slot.id);
                }}
                disabled={slot.booked}
                className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove slot"
              >
                <SafeIcon icon={FiTrash2} className="text-xs" />
              </button>
            </div>
          )}

          {bulkEditMode && !slot.booked && (
            <div className={`w-4 h-4 border-2 rounded ${
              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
            } flex items-center justify-center`}>
              {isSelected && <SafeIcon icon={FiCheck} className="text-white text-xs" />}
            </div>
          )}

          {showBookingInterface && status === 'available' && (
            <SafeIcon icon={FiUser} className="text-green-600" />
          )}
        </div>

        {hasError && (
          <div className="mt-1 text-xs text-red-600">
            {hasError}
          </div>
        )}
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
            {editMode && getChangeCount() > 0 && (
              <div className="mt-2 text-yellow-200 text-sm">
                {getChangeCount()} unsaved changes
              </div>
            )}
          </div>
          
          {isEditable && (
            <div className="flex items-center space-x-2">
              {editMode ? (
                <>
                  <button
                    onClick={saveAvailability}
                    disabled={saveLoading || Object.keys(validationErrors).length > 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {saveLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <SafeIcon icon={FiSave} />
                    )}
                    <span>{saveLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saveLoading}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <SafeIcon icon={FiX} />
                  </button>
                  <button
                    onClick={() => setBulkEditMode(!bulkEditMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bulkEditMode 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <SafeIcon icon={FiSettings} />
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

        {/* Bulk Edit Controls */}
        {bulkEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white bg-opacity-20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {selectedSlots.length} slot(s) selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => bulkToggleAvailability(true)}
                  disabled={selectedSlots.length === 0}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Make Available
                </button>
                <button
                  onClick={() => bulkToggleAvailability(false)}
                  disabled={selectedSlots.length === 0}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  Make Unavailable
                </button>
                <button
                  onClick={bulkRemoveSlots}
                  disabled={selectedSlots.length === 0}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Remove Selected
                </button>
              </div>
            </div>
          </motion.div>
        )}
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
                
                {/* Day Controls */}
                {editMode && isEditable && (
                  <div className="flex justify-center space-x-1 mt-2">
                    <button
                      onClick={() => addTimeSlot(day.id)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Add slot"
                    >
                      <SafeIcon icon={FiPlus} className="text-sm" />
                    </button>
                    <div className="relative group">
                      <button
                        className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                        title="Day options"
                      >
                        <SafeIcon icon={FiSettings} className="text-sm" />
                      </button>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <button
                          onClick={() => clearDaySchedule(day.id)}
                          className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Clear Day
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <AnimatePresence>
                  {(availability[day.id] || []).map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      slot={slot}
                      dayId={day.id}
                    />
                  ))}
                </AnimatePresence>

                {/* Add Slot Button */}
                {editMode && isEditable && !bulkEditMode && (
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
          {bulkEditMode && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
              <span>Selected</span>
            </div>
          )}
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
            <h4 className="font-medium text-blue-900 mb-2">
              {bulkEditMode ? 'Bulk Edit Mode:' : 'Edit Mode Instructions:'}
            </h4>
            {bulkEditMode ? (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click on slots to select multiple slots</li>
                <li>• Use bulk actions to modify multiple slots at once</li>
                <li>• Cannot select or modify booked slots</li>
                <li>• Toggle bulk edit mode off to edit individual slots</li>
              </ul>
            ) : (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "+" to add new time slots</li>
                <li>• Edit start and end times directly in the time inputs</li>
                <li>• Use the eye icon to toggle slot availability</li>
                <li>• Use the trash icon to remove slots (cannot remove booked slots)</li>
                <li>• Click the settings icon for bulk edit mode</li>
                <li>• Click "Save" to save all changes</li>
              </ul>
            )}
          </div>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              <SafeIcon icon={FiAlertTriangle} className="mr-2" />
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-800 space-y-1">
              {Object.entries(validationErrors).map(([slotId, error]) => (
                <li key={slotId}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerAvailability;