import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiPlus, FiTrash2, FiSave, FiEdit3 } = FiIcons;

const TrainerAvailability = ({ trainer, onUpdate, canEdit = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [availability, setAvailability] = useState(
    trainer?.availability || {
      monday: { available: true, slots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { available: true, slots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { available: true, slots: [{ start: '09:00', end: '17:00' }] },
      thursday: { available: true, slots: [{ start: '09:00', end: '17:00' }] },
      friday: { available: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { available: true, slots: [{ start: '10:00', end: '15:00' }] },
      sunday: { available: false, slots: [] }
    }
  );

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const toggleDayAvailability = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        slots: !prev[day].available ? [{ start: '09:00', end: '17:00' }] : []
      }
    }));
  };

  const addTimeSlot = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: '09:00', end: '17:00' }]
      }
    }));
  };

  const removeTimeSlot = (day, index) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const handleSave = () => {
    onUpdate && onUpdate(availability);
    setIsEditing(false);
  };

  const formatTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return 'Not available';
    return slots.map(slot => `${slot.start} - ${slot.end}`).join(', ');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <SafeIcon icon={FiCalendar} className="mr-2" />
          Availability
        </h3>
        {canEdit && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
              >
                <SafeIcon icon={FiEdit3} />
                <span>Edit</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={availability[day.key]?.available || false}
                    onChange={() => toggleDayAvailability(day.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                ) : null}
                <h4 className={`font-medium ${
                  availability[day.key]?.available ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {day.label}
                </h4>
              </div>
              {isEditing && availability[day.key]?.available && (
                <button
                  onClick={() => addTimeSlot(day.key)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <SafeIcon icon={FiPlus} />
                </button>
              )}
            </div>

            {availability[day.key]?.available ? (
              <div className="space-y-2">
                {isEditing ? (
                  availability[day.key].slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <SafeIcon icon={FiClock} className="text-gray-400" />
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      {availability[day.key].slots.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(day.key, index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiClock} />
                    <span>{formatTimeSlots(availability[day.key].slots)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Not available</div>
            )}
          </div>
        ))}
      </div>

      {!isEditing && canEdit && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Keep your availability updated so clients know when they can book sessions with you.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainerAvailability;