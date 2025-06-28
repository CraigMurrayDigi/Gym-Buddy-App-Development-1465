import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import SafeIcon from '../common/SafeIcon';
import PaymentMethodCard from './PaymentMethodCard';
import PaymentForm from './PaymentForm';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCalendar, FiClock, FiDollarSign, FiUser, FiMapPin, FiMessageCircle, FiCreditCard, FiCheck, FiAlertTriangle } = FiIcons;

const SessionBookingModal = ({ isOpen, onClose, trainer, onBookingComplete }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: '60',
    sessionType: 'personal-training',
    notes: '',
    location: 'trainer-location'
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const { user } = useAuth();
  const { paymentMethods, addPaymentMethod, purchaseTrainingSession } = usePayment();

  const sessionTypes = [
    { value: 'personal-training', label: 'Personal Training', description: 'One-on-one training session' },
    { value: 'assessment', label: 'Fitness Assessment', description: 'Initial fitness evaluation' },
    { value: 'consultation', label: 'Consultation', description: 'Planning and goal setting' },
    { value: 'group-training', label: 'Small Group Training', description: 'Train with 2-3 people' }
  ];

  const durations = [
    { value: '30', label: '30 minutes', multiplier: 0.5 },
    { value: '45', label: '45 minutes', multiplier: 0.75 },
    { value: '60', label: '1 hour', multiplier: 1 },
    { value: '90', label: '1.5 hours', multiplier: 1.5 },
    { value: '120', label: '2 hours', multiplier: 2 }
  ];

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  useEffect(() => {
    if (trainer && bookingData.duration) {
      const duration = durations.find(d => d.value === bookingData.duration);
      const baseCost = trainer.hourly_rate || 75;
      setTotalCost(baseCost * duration.multiplier);
    }
  }, [trainer, bookingData.duration]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateBookingDetails = () => {
    if (!bookingData.date) {
      toast.error('Please select a date');
      return false;
    }
    if (!bookingData.time) {
      toast.error('Please select a time');
      return false;
    }
    if (new Date(`${bookingData.date}T${bookingData.time}`) <= new Date()) {
      toast.error('Please select a future date and time');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateBookingDetails()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (!selectedPaymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      handleBookSession();
    }
  };

  const handleBookSession = async () => {
    setLoading(true);
    try {
      // Create booking data
      const bookingDetails = {
        ...bookingData,
        trainerId: trainer.id,
        userId: user.id,
        totalCost,
        status: 'pending'
      };

      // Process payment
      const { transaction, error } = await purchaseTrainingSession(
        'training-session',
        selectedPaymentMethod.id,
        trainer.id
      );

      if (error) {
        toast.error(error);
        return;
      }

      // Move to confirmation step
      setCurrentStep(3);
      
      // Call completion callback after a delay
      setTimeout(() => {
        onBookingComplete && onBookingComplete(bookingDetails);
        toast.success('Session booked successfully!');
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (cardData) => {
    const { paymentMethod, error } = await addPaymentMethod(cardData);
    if (error) {
      toast.error(error);
    } else {
      setSelectedPaymentMethod(paymentMethod);
      setShowAddPayment(false);
      toast.success('Payment method added successfully');
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Training Session</h2>
                <p className="text-gray-600">with {trainer?.name}</p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiX} className="text-2xl" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center space-x-4 mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <SafeIcon icon={FiCheck} /> : step}
                  </div>
                  {step < 3 && <div className={`w-8 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Booking Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiCalendar} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        min={getMinDate()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiClock} className="absolute left-3 top-3 text-gray-400" />
                      <select
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sessionTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          bookingData.sessionType === type.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sessionType"
                          value={type.value}
                          checked={bookingData.sessionType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={bookingData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {durations.map((duration) => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="location"
                        value="trainer-location"
                        checked={bookingData.location === 'trainer-location'}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <span>Trainer's Location ({trainer?.location})</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="location"
                        value="client-location"
                        checked={bookingData.location === 'client-location'}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <span>My Location (additional travel fee may apply)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any specific goals, concerns, or requests for this session..."
                  />
                </div>

                {/* Cost Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">Session Cost:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(totalCost)}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {formatPrice(trainer?.hourly_rate || 75)}/hour × {bookingData.duration} minutes
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(bookingData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{bookingData.duration} minutes</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatPrice(totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                {!showAddPayment ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Select Payment Method</h4>
                      <button
                        onClick={() => setShowAddPayment(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                      >
                        <SafeIcon icon={FiCreditCard} />
                        <span>Add New</span>
                      </button>
                    </div>

                    {paymentMethods.length > 0 ? (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <PaymentMethodCard
                            key={method.id}
                            paymentMethod={method}
                            isSelected={selectedPaymentMethod?.id === method.id}
                            onSelect={setSelectedPaymentMethod}
                            showActions={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <SafeIcon icon={FiCreditCard} className="text-4xl text-gray-300 mb-2 mx-auto" />
                        <p className="text-gray-600 mb-4">No payment methods found</p>
                        <button
                          onClick={() => setShowAddPayment(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Payment Method
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Add Payment Method</h4>
                      <button
                        onClick={() => setShowAddPayment(false)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <SafeIcon icon={FiX} />
                      </button>
                    </div>
                    <PaymentForm
                      onSubmit={handleAddPaymentMethod}
                      loading={loading}
                      buttonText="Add & Select"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-green-600 mb-4">
                  <SafeIcon icon={FiCheck} className="text-6xl mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Booked!</h3>
                <p className="text-gray-600 mb-6">
                  Your training session has been successfully booked with {trainer?.name}
                </p>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="text-sm space-y-1">
                    <div><strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}</div>
                    <div><strong>Time:</strong> {bookingData.time}</div>
                    <div><strong>Duration:</strong> {bookingData.duration} minutes</div>
                    <div><strong>Total Paid:</strong> {formatPrice(totalCost)}</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiMessageCircle} className="text-blue-600 mt-1" />
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900">Next Steps</h4>
                      <p className="text-sm text-blue-700">
                        You'll receive a confirmation email shortly. You can also message {trainer?.name} 
                        directly to discuss session details.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {currentStep < 3 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                {currentStep > 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={loading || (currentStep === 2 && !selectedPaymentMethod)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {currentStep === 1 ? 'Continue to Payment' : 'Book Session'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SessionBookingModal;