import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import TrainerAvailability from '../components/TrainerAvailability';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiCalendar, FiUser, FiDollarSign, FiClock, FiStar } = FiIcons;

const TrainerAvailabilityPage = () => {
  const { trainerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'schedule'

  // Demo trainer data
  const trainer = {
    id: trainerId || 'trainer-1',
    name: 'Sarah Johnson',
    business_name: 'FitLife Training',
    hourlyRate: 85.00,
    rating: 4.9,
    reviewCount: 47,
    specializations: ['Weight Loss', 'Strength Training', 'Nutrition Coaching'],
    bio: 'Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals.',
    location: 'New York',
    verified: true
  };

  const isOwnProfile = user?.id === trainerId;
  const showBookingInterface = !isOwnProfile;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back</span>
          </button>
        </div>

        {/* Trainer Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                {trainer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{trainer.name}</h1>
                  {trainer.verified && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-blue-600 font-medium mb-1">{trainer.business_name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiStar} className="text-yellow-400" />
                    <span>{trainer.rating} ({trainer.reviewCount} reviews)</span>
                  </div>
                  <span>•</span>
                  <span>{trainer.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatPrice(trainer.hourlyRate)}</div>
              <div className="text-sm text-gray-500">per hour</div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-700 mb-3">{trainer.bio}</p>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg p-2 inline-flex">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SafeIcon icon={FiCalendar} />
              <span>Calendar View</span>
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                viewMode === 'schedule'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SafeIcon icon={FiClock} />
              <span>Weekly Schedule</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {viewMode === 'calendar' ? (
            <AvailabilityCalendar
              trainerId={trainer.id}
              trainerName={trainer.name}
              hourlyRate={trainer.hourlyRate}
              showBookingInterface={showBookingInterface}
            />
          ) : (
            <TrainerAvailability
              trainerId={trainer.id}
              isEditable={isOwnProfile}
              showBookingInterface={showBookingInterface}
            />
          )}
        </motion.div>

        {/* Quick Action Buttons */}
        {showBookingInterface && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Start Your Fitness Journey?</h3>
                <p className="text-blue-100">
                  Book a session with {trainer.name} and take the first step towards your goals.
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Contact Trainer
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrainerAvailabilityPage;