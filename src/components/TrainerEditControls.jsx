import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCopy, FiTrash2, FiRotateCcw, FiCalendar, FiSettings } = FiIcons;

const TrainerEditControls = ({ 
  availability, 
  onCopyDay, 
  onClearDay, 
  onResetWeek, 
  onQuickFill,
  disabled = false 
}) => {
  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const quickFillTemplates = [
    {
      name: 'Standard Weekdays',
      description: 'Mon-Fri: 6-8 AM, 5-8 PM',
      schedule: {
        monday: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '17:00', endTime: '20:00' }
        ],
        tuesday: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '17:00', endTime: '20:00' }
        ],
        wednesday: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '17:00', endTime: '20:00' }
        ],
        thursday: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '17:00', endTime: '20:00' }
        ],
        friday: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '17:00', endTime: '20:00' }
        ]
      }
    },
    {
      name: 'Weekend Warrior',
      description: 'Sat-Sun: 8 AM-12 PM',
      schedule: {
        saturday: [
          { startTime: '08:00', endTime: '12:00' }
        ],
        sunday: [
          { startTime: '08:00', endTime: '12:00' }
        ]
      }
    },
    {
      name: 'Early Bird',
      description: 'Daily: 5-7 AM',
      schedule: {
        monday: [{ startTime: '05:00', endTime: '07:00' }],
        tuesday: [{ startTime: '05:00', endTime: '07:00' }],
        wednesday: [{ startTime: '05:00', endTime: '07:00' }],
        thursday: [{ startTime: '05:00', endTime: '07:00' }],
        friday: [{ startTime: '05:00', endTime: '07:00' }],
        saturday: [{ startTime: '05:00', endTime: '07:00' }],
        sunday: [{ startTime: '05:00', endTime: '07:00' }]
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-50 border-t border-gray-200 p-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Copy Day Schedule */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <SafeIcon icon={FiCopy} className="mr-2" />
            Copy Day Schedule
          </h4>
          <div className="space-y-2">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{day.label}</span>
                <div className="flex space-x-1">
                  {daysOfWeek
                    .filter(targetDay => targetDay.id !== day.id)
                    .map((targetDay) => (
                      <button
                        key={targetDay.id}
                        onClick={() => onCopyDay(day.id, targetDay.id)}
                        disabled={disabled || !availability[day.id]?.length}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        → {targetDay.label.slice(0, 3)}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Fill Templates */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <SafeIcon icon={FiCalendar} className="mr-2" />
            Quick Fill Templates
          </h4>
          <div className="space-y-2">
            {quickFillTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => onQuickFill(template.schedule)}
                disabled={disabled}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Utility Actions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <SafeIcon icon={FiSettings} className="mr-2" />
            Utilities
          </h4>
          <div className="space-y-2">
            <button
              onClick={onResetWeek}
              disabled={disabled}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiRotateCcw} />
              <span>Reset Week</span>
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  onClick={() => onClearDay(day.id)}
                  disabled={disabled || !availability[day.id]?.length}
                  className="flex items-center justify-center space-x-1 p-2 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiTrash2} className="text-xs" />
                  <span>{day.label.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainerEditControls;