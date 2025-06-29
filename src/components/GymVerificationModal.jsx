import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCheck, FiAlertTriangle, FiDollarSign, FiShield, FiCreditCard, FiFileText, FiMail } = FiIcons;

const GymVerificationModal = ({ gym, isOpen, onClose, onVerificationUpdate, loading }) => {
  const [verificationAction, setVerificationAction] = useState('approve');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleVerification = async (approved) => {
    if (!gym) return;

    setProcessingPayment(true);
    try {
      // Step 1: Update verification status
      await onVerificationUpdate(gym.id, approved, verificationNotes);

      if (approved) {
        // Step 2: If approved, simulate Stripe Connect setup
        await simulateStripeConnectSetup(gym);
        
        // Step 3: Enable payment processing
        await enablePaymentProcessing(gym);
        
        toast.success('🎉 Gym verified and payment processing enabled!');
        
        // Step 4: Send welcome email (simulated)
        await sendGymWelcomeEmail(gym);
      } else {
        toast.success('Gym verification status updated');
      }
      
      onClose();
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to update verification status');
    } finally {
      setProcessingPayment(false);
    }
  };

  const simulateStripeConnectSetup = async (gym) => {
    // In production, this would integrate with real Stripe Connect API
    console.log('🔗 Setting up Stripe Connect for:', gym.business_name);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock Stripe account creation
    const mockStripeAccount = {
      id: `acct_${Date.now()}`,
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
      business_profile: {
        name: gym.business_name,
        url: gym.website
      }
    };
    
    console.log('✅ Stripe Connect account created:', mockStripeAccount.id);
    return mockStripeAccount;
  };

  const enablePaymentProcessing = async (gym) => {
    console.log('💳 Enabling payment processing for:', gym.business_name);
    
    // In production, this would:
    // 1. Update database with Stripe account info
    // 2. Enable webhook endpoints
    // 3. Set up product catalog
    // 4. Configure tax settings
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Payment processing enabled');
  };

  const sendGymWelcomeEmail = async (gym) => {
    console.log('📧 Sending welcome email to:', gym.business_email);
    
    // In production, this would trigger email service
    const emailContent = {
      to: gym.business_email,
      subject: '🎉 Your gym has been verified on Gym Buddy!',
      template: 'gym_verification_approved',
      data: {
        businessName: gym.business_name,
        dashboardUrl: `${window.location.origin}/#/gym-dashboard`,
        supportEmail: 'support@gymbuddy.com'
      }
    };
    
    console.log('📧 Email queued:', emailContent);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  if (!isOpen || !gym) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <SafeIcon icon={FiShield} className="mr-3 text-blue-600" />
                Gym Verification Review
              </h2>
              <button
                onClick={onClose}
                disabled={processingPayment}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <SafeIcon icon={FiX} className="text-2xl" />
              </button>
            </div>

            {/* Gym Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gym Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <p className="text-gray-900">{gym.business_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Email</label>
                  <p className="text-gray-900">{gym.business_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{gym.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <p className="text-gray-900">{gym.website || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">{gym.address}, {gym.city}, {gym.state} {gym.zip_code}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{gym.description}</p>
                </div>
              </div>
            </div>

            {/* Verification Action */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Decision</h3>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${verificationAction === 'approve' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="verification"
                      value="approve"
                      checked={verificationAction === 'approve'}
                      onChange={(e) => setVerificationAction(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiCheck} className="text-2xl text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">Approve & Enable Payments</div>
                        <div className="text-sm text-green-700">
                          Verify gym and enable full payment processing
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${verificationAction === 'reject' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="verification"
                      value="reject"
                      checked={verificationAction === 'reject'}
                      onChange={(e) => setVerificationAction(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiAlertTriangle} className="text-2xl text-red-600" />
                      <div>
                        <div className="font-semibold text-red-900">Reject Application</div>
                        <div className="text-sm text-red-700">
                          Deny verification and disable features
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes {verificationAction === 'reject' && <span className="text-red-600">*</span>}
                  </label>
                  <textarea
                    id="verificationNotes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={verificationAction === 'approve' 
                      ? "Optional: Add any notes about the verification..." 
                      : "Required: Please explain why this application is being rejected..."
                    }
                  />
                </div>
              </div>
            </div>

            {/* Payment Processing Info */}
            {verificationAction === 'approve' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiCreditCard} className="text-blue-600 text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Payment Processing Setup</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Approving this gym will automatically:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Set up Stripe Connect account for payment processing</li>
                      <li>• Enable membership plan sales and subscriptions</li>
                      <li>• Activate payment webhooks and transaction monitoring</li>
                      <li>• Send welcome email with dashboard access instructions</li>
                      <li>• Grant access to analytics and member management tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={processingPayment}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerification(verificationAction === 'approve')}
                disabled={processingPayment || (verificationAction === 'reject' && !verificationNotes.trim())}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 ${
                  verificationAction === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={verificationAction === 'approve' ? FiCheck : FiAlertTriangle} />
                    <span>
                      {verificationAction === 'approve' ? 'Approve & Enable Payments' : 'Reject Application'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Processing Status */}
            {processingPayment && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  <div>
                    <h4 className="font-medium text-yellow-800">Setting up payment processing...</h4>
                    <p className="text-sm text-yellow-700">
                      This may take a few moments while we configure the payment system.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GymVerificationModal;