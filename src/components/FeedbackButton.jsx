import React, { useState } from 'react';
import { FeedbackWorkflow } from '@questlabs/react-sdk';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import questConfig from '../config/questConfig';

const { FiMessageSquare, FiChevronLeft } = FiIcons;

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const EventTracking = () => {
    // Track feedback button clicks for analytics
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'feedback_button_click', {
          event_category: 'engagement',
          event_label: 'floating_feedback'
        });
      }
    } catch (error) {
      console.log('Analytics tracking not available:', error);
    }
    console.log('Feedback workflow opened');
  };

  const handleToggle = () => {
    EventTracking();
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Get user ID from localStorage or use default
  const getUserId = () => {
    try {
      return localStorage.getItem('userId') || questConfig.USER_ID;
    } catch (error) {
      console.log('LocalStorage not available:', error);
      return questConfig.USER_ID;
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        onClick={handleToggle}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{ 
          background: questConfig.PRIMARY_COLOR,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed'
        }}
        className="fixed top-1/2 -right-2 transform -translate-y-1/2 z-50 flex items-center justify-center px-3 py-4 text-white font-semibold text-sm rounded-l-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-right-1 group"
        aria-label="Open feedback form"
      >
        <div className="flex items-center space-y-1 flex-col">
          <SafeIcon 
            icon={isOpen ? FiChevronLeft : FiMessageSquare} 
            className={`text-lg transition-transform duration-300 ${
              isOpen ? 'rotate-0' : 'group-hover:scale-110'
            }`} 
          />
          <span className="text-xs font-medium tracking-wider">
            FEEDBACK
          </span>
        </div>
      </motion.button>

      {/* Feedback Workflow Component */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              <FeedbackWorkflow
                uniqueUserId={getUserId()}
                questId={questConfig.QUEST_FEEDBACK_QUESTID}
                isOpen={isOpen}
                accent={questConfig.PRIMARY_COLOR}
                onClose={handleClose}
                style={{
                  maxWidth: '400px',
                  maxHeight: '600px'
                }}
              >
                <FeedbackWorkflow.ThankYou />
              </FeedbackWorkflow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackButton;