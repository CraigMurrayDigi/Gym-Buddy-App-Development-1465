import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiAlertTriangle, FiCheckCircle, FiClock, FiCalendar } = FiIcons;

const SlotValidation = ({ errors, warnings, onFixError, onDismissWarning }) => {
  if (!errors.length && !warnings.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-3">
              <SafeIcon icon={FiAlertTriangle} className="text-red-600 mr-2" />
              <h4 className="font-medium text-red-900">
                {errors.length} Validation Error{errors.length > 1 ? 's' : ''} Found
              </h4>
            </div>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex items-start justify-between bg-white rounded p-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900">{error.title}</div>
                    <div className="text-xs text-red-700 mt-1">{error.description}</div>
                    {error.suggestion && (
                      <div className="text-xs text-red-600 mt-1 italic">
                        Suggestion: {error.suggestion}
                      </div>
                    )}
                  </div>
                  {error.fixable && (
                    <button
                      onClick={() => onFixError(error)}
                      className="ml-3 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Auto Fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <SafeIcon icon={FiClock} className="text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">
                {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
              </h4>
            </div>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start justify-between bg-white rounded p-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-yellow-900">{warning.title}</div>
                    <div className="text-xs text-yellow-700 mt-1">{warning.description}</div>
                  </div>
                  <button
                    onClick={() => onDismissWarning(index)}
                    className="ml-3 text-xs text-yellow-600 hover:text-yellow-800"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SlotValidation;