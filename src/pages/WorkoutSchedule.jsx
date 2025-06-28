import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiActivity, FiMapPin, FiPlus, FiUsers, FiHeart, FiTarget, FiStar, FiMessageCircle, FiUserCheck, FiTrendingUp, FiInfo } = FiIcons;

const WorkoutSchedule = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: '',
    gym: '',
    notes: '',
    // New social fields
    experienceLevel: '',
    lookingFor: '',
    maxParticipants: '4',
    workoutIntensity: '',
    workoutGoal: '',
    isBeginnerFriendly: false,
    welcomesNewbies: false,
    preferredAge: '',
    workoutDuration: '',
    equipment: [],
    socialPreference: '',
    communicationStyle: '',
    motivation: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const { user } = useAuth();
  const { workoutTypes, gyms, addWorkout } = useData();
  const navigate = useNavigate();

  // Enhanced workout types with beginner-friendly options
  const enhancedWorkoutTypes = [
    { value: 'Beginner Cardio', label: 'Beginner Cardio', beginnerFriendly: true, description: 'Light cardio, perfect for starting out' },
    { value: 'Walking/Light Jogging', label: 'Walking/Light Jogging', beginnerFriendly: true, description: 'Easy pace, great for beginners' },
    { value: 'Strength Training', label: 'Strength Training', beginnerFriendly: false, description: 'Weight lifting and resistance exercises' },
    { value: 'Beginner Weight Training', label: 'Beginner Weight Training', beginnerFriendly: true, description: 'Learn basic weight lifting with guidance' },
    { value: 'Yoga', label: 'Yoga', beginnerFriendly: true, description: 'Gentle stretching and mindfulness' },
    { value: 'Pilates', label: 'Pilates', beginnerFriendly: true, description: 'Core strengthening and flexibility' },
    { value: 'HIIT', label: 'HIIT', beginnerFriendly: false, description: 'High-intensity interval training' },
    { value: 'Beginner HIIT', label: 'Beginner HIIT', beginnerFriendly: true, description: 'Modified high-intensity workouts' },
    { value: 'Swimming', label: 'Swimming', beginnerFriendly: true, description: 'Low-impact full body exercise' },
    { value: 'Group Fitness Class', label: 'Group Fitness Class', beginnerFriendly: true, description: 'Structured class environment' },
    { value: 'CrossFit', label: 'CrossFit', beginnerFriendly: false, description: 'Intense functional fitness' },
    { value: 'Cycling/Spin', label: 'Cycling/Spin', beginnerFriendly: true, description: 'Stationary bike workouts' },
    { value: 'Boxing/Martial Arts', label: 'Boxing/Martial Arts', beginnerFriendly: false, description: 'Combat sports training' },
    { value: 'Dance Fitness', label: 'Dance Fitness', beginnerFriendly: true, description: 'Fun, music-based movement' },
    { value: 'Stretching/Recovery', label: 'Stretching/Recovery', beginnerFriendly: true, description: 'Gentle recovery and flexibility' },
    { value: 'Gym Tour/Orientation', label: 'Gym Tour/Orientation', beginnerFriendly: true, description: 'Learn about gym equipment and layout' }
  ];

  const experienceLevels = [
    { value: 'absolute-beginner', label: 'Absolute Beginner', description: 'Never been to a gym before', icon: '🌱' },
    { value: 'beginner', label: 'Beginner', description: 'Some experience, still learning', icon: '🌿' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular gym goer, comfortable with basics', icon: '🌳' },
    { value: 'advanced', label: 'Advanced', description: 'Very experienced, can guide others', icon: '🏆' }
  ];

  const lookingForOptions = [
    { value: 'workout-buddy', label: 'Workout Buddy', description: 'Someone to exercise alongside', icon: '👥' },
    { value: 'gym-guide', label: 'Gym Guide/Mentor', description: 'Experienced person to show me around', icon: '🧭' },
    { value: 'accountability-partner', label: 'Accountability Partner', description: 'Someone to keep me motivated', icon: '🎯' },
    { value: 'new-friend', label: 'New Friend', description: 'Looking to make genuine friendships', icon: '🤝' },
    { value: 'workout-group', label: 'Small Group', description: 'A few people to work out with', icon: '👥' },
    { value: 'beginner-community', label: 'Beginner Community', description: 'Other beginners to learn with', icon: '🌟' }
  ];

  const intensityLevels = [
    { value: 'very-light', label: 'Very Light', description: 'Gentle movement, can easily chat', icon: '😌' },
    { value: 'light', label: 'Light', description: 'Comfortable pace, minimal sweating', icon: '🚶' },
    { value: 'moderate', label: 'Moderate', description: 'Some effort, light sweating', icon: '🏃' },
    { value: 'hard', label: 'Hard', description: 'Challenging, heavy breathing', icon: '💪' },
    { value: 'very-hard', label: 'Very Hard', description: 'Maximum effort, intense', icon: '🔥' }
  ];

  const workoutGoals = [
    { value: 'overcome-gym-anxiety', label: 'Overcome Gym Anxiety', description: 'Feel more comfortable in the gym environment' },
    { value: 'learn-basics', label: 'Learn the Basics', description: 'Understand how to use equipment safely' },
    { value: 'build-confidence', label: 'Build Confidence', description: 'Gain self-assurance in fitness' },
    { value: 'make-friends', label: 'Make Friends', description: 'Connect with like-minded people' },
    { value: 'weight-loss', label: 'Weight Loss', description: 'Lose weight and improve health' },
    { value: 'muscle-building', label: 'Build Muscle', description: 'Increase strength and muscle mass' },
    { value: 'general-fitness', label: 'General Fitness', description: 'Improve overall health and wellness' },
    { value: 'stress-relief', label: 'Stress Relief', description: 'Use exercise for mental wellness' }
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes', description: 'Quick and efficient' },
    { value: '45', label: '45 minutes', description: 'Standard workout length' },
    { value: '60', label: '1 hour', description: 'Full comprehensive workout' },
    { value: '90', label: '1.5 hours', description: 'Extended session' },
    { value: '120', label: '2 hours', description: 'Long training session' }
  ];

  const socialPreferences = [
    { value: 'chatty', label: 'Love to Chat', description: 'Enjoy talking during workouts', icon: '💬' },
    { value: 'moderate-chat', label: 'Some Conversation', description: 'Chat between sets', icon: '🗣️' },
    { value: 'focused-quiet', label: 'Focused & Quiet', description: 'Prefer minimal talking', icon: '🤐' },
    { value: 'encouraging', label: 'Encouraging', description: 'Love to motivate and be motivated', icon: '📣' }
  ];

  const motivationStyles = [
    { value: 'gentle-support', label: 'Gentle Support', description: 'Soft encouragement and understanding' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'High energy and excitement' },
    { value: 'calm-steady', label: 'Calm & Steady', description: 'Consistent, peaceful approach' },
    { value: 'goal-focused', label: 'Goal Focused', description: 'Achievement and progress oriented' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.date && formData.time && formData.type && formData.gym;
      case 2:
        return formData.experienceLevel && formData.lookingFor && formData.workoutIntensity;
      case 3:
        return formData.workoutGoal && formData.workoutDuration && formData.socialPreference;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workoutData = {
        ...formData,
        user_id: user.id,
        userName: user.name,
        location: user.location,
        // Add social matching metadata
        socialMetadata: {
          experienceLevel: formData.experienceLevel,
          lookingFor: formData.lookingFor,
          workoutIntensity: formData.workoutIntensity,
          workoutGoal: formData.workoutGoal,
          isBeginnerFriendly: formData.isBeginnerFriendly,
          welcomesNewbies: formData.welcomesNewbies,
          preferredAge: formData.preferredAge,
          workoutDuration: formData.workoutDuration,
          socialPreference: formData.socialPreference,
          motivation: formData.motivation,
          maxParticipants: parseInt(formData.maxParticipants)
        }
      };

      await addWorkout(workoutData);
      toast.success('Workout scheduled successfully! Other members can now find and join you.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to schedule workout');
    } finally {
      setLoading(false);
    }
  };

  // Filter gyms by user's location with better error handling
  const getAvailableGyms = () => {
    try {
      if (!user?.location) {
        console.log('WorkoutSchedule: No user location');
        return [];
      }
      
      if (!Array.isArray(gyms)) {
        console.log('WorkoutSchedule: gyms is not an array:', gyms);
        return [];
      }

      const filtered = gyms.filter(gym => {
        try {
          // Handle both direct location property and nested location object
          const gymLocation = gym.location || gym.locations_gym2024?.name;
          return gymLocation === user.location;
        } catch (err) {
          console.error('Error filtering gym:', err, gym);
          return false;
        }
      });

      console.log('WorkoutSchedule: Available gyms for', user.location, ':', filtered.length);
      return filtered;
    } catch (error) {
      console.error('WorkoutSchedule: Error getting available gyms:', error);
      return [];
    }
  };

  const availableGyms = getAvailableGyms();
  const today = new Date().toISOString().split('T')[0];

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : step === currentStep + 1 
                  ? 'bg-blue-200 text-blue-600' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {step < currentStep ? <SafeIcon icon={FiUserCheck} /> : step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <div className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>
        <div className="font-medium text-gray-900">
          {currentStep === 1 && "Workout Details"}
          {currentStep === 2 && "Experience & Goals"}
          {currentStep === 3 && "Social Preferences"}
          {currentStep === 4 && "Final Details"}
        </div>
      </div>
    </div>
  );

  const ProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
      />
    </div>
  );

  console.log('WorkoutSchedule: Rendering', { 
    userLocation: user?.location, 
    availableGymsCount: availableGyms.length,
    totalGymsCount: gyms.length 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <SafeIcon icon={FiHeart} className="text-4xl text-blue-600 mb-4 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Workout Buddy</h1>
            <p className="text-gray-600">
              Create a welcoming workout session and connect with like-minded fitness friends
            </p>
          </div>

          <ProgressBar />
          <StepIndicator />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Workout Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Workout Details</h2>
                  <p className="text-gray-600">When and where would you like to work out?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiCalendar} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiClock} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        id="time"
                        name="time"
                        type="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Workout Type *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiActivity} className="absolute left-3 top-3 text-gray-400" />
                    <select
                      id="type"
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select workout type</option>
                      {enhancedWorkoutTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} {type.beginnerFriendly ? '🌟' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.type && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {enhancedWorkoutTypes.find(t => t.value === formData.type)?.description}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="gym" className="block text-sm font-medium text-gray-700 mb-2">
                    Gym Location *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMapPin} className="absolute left-3 top-3 text-gray-400" />
                    <select
                      id="gym"
                      name="gym"
                      required
                      value={formData.gym}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select gym</option>
                      {availableGyms.map((gym) => (
                        <option key={gym.id} value={gym.name}>
                          {gym.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {availableGyms.length === 0 && user?.location && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No gyms found for your location ({user.location}). Please update your profile or contact support.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Participants (including you)
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiUsers} className="absolute left-3 top-3 text-gray-400" />
                    <select
                      id="maxParticipants"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="2">2 people (just you + 1 buddy)</option>
                      <option value="3">3 people (small group)</option>
                      <option value="4">4 people (preferred)</option>
                      <option value="5">5 people</option>
                      <option value="6">6 people (larger group)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Experience & Goals */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Experience & Goals</h2>
                  <p className="text-gray-600">Help us match you with the right workout buddies</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    What's your gym experience level? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experienceLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.experienceLevel === level.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level.value}
                          checked={formData.experienceLevel === level.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-2xl">{level.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{level.label}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    What are you looking for? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lookingForOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.lookingFor === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="lookingFor"
                          value={option.value}
                          checked={formData.lookingFor === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-2xl">{option.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Workout Intensity *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {intensityLevels.map((intensity) => (
                      <label
                        key={intensity.value}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.workoutIntensity === intensity.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="workoutIntensity"
                          value={intensity.value}
                          checked={formData.workoutIntensity === intensity.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-2xl">{intensity.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{intensity.label}</div>
                          <div className="text-sm text-gray-600">{intensity.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isBeginnerFriendly"
                      checked={formData.isBeginnerFriendly}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🌟 Beginner-friendly workout
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="welcomesNewbies"
                      checked={formData.welcomesNewbies}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🤗 Welcomes gym newbies
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 3: Social Preferences */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Preferences</h2>
                  <p className="text-gray-600">Let's find your perfect workout vibe</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    What's your main fitness goal? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workoutGoals.map((goal) => (
                      <label
                        key={goal.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.workoutGoal === goal.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="workoutGoal"
                          value={goal.value}
                          checked={formData.workoutGoal === goal.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <SafeIcon icon={FiTarget} className="text-blue-600 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">{goal.label}</div>
                          <div className="text-sm text-gray-600">{goal.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="workoutDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Workout Duration *
                  </label>
                  <select
                    id="workoutDuration"
                    name="workoutDuration"
                    required
                    value={formData.workoutDuration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select duration</option>
                    {durationOptions.map((duration) => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label} - {duration.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Social Style During Workouts *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialPreferences.map((pref) => (
                      <label
                        key={pref.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.socialPreference === pref.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="socialPreference"
                          value={pref.value}
                          checked={formData.socialPreference === pref.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-2xl">{pref.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{pref.label}</div>
                          <div className="text-sm text-gray-600">{pref.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Final Details */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Details</h2>
                  <p className="text-gray-600">Add some personal touches to attract the right buddies</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Your Motivation Style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {motivationStyles.map((style) => (
                      <label
                        key={style.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.motivation === style.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="motivation"
                          value={style.value}
                          checked={formData.motivation === style.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <SafeIcon icon={FiTrendingUp} className="text-blue-600 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">{style.label}</div>
                          <div className="text-sm text-gray-600">{style.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share anything else about yourself, your fitness journey, or what you're hoping to get from this workout session. This helps others know if you'd be a good fit!"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiInfo} className="text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-green-800 mb-2">You're almost done! 🎉</h3>
                      <p className="text-sm text-green-700">
                        Once you create this workout session, other members will be able to see it and request to join. 
                        You'll get notified when someone wants to be your workout buddy, and you can chat before meeting up.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>← Previous</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next →</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SafeIcon icon={FiHeart} />
                  <span>{loading ? 'Creating...' : 'Create Workout Session'}</span>
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkoutSchedule;