import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBuilding, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiPhone, FiGlobe, FiMail, FiCalendar, FiUser, FiMessageSquare, FiAlertTriangle, FiEye, FiFileText, FiDollarSign, FiShield } = FiIcons;

const GymVerificationCard = ({ gymAccount, onApprove, onDecline, loading = false }) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineNotes, setDeclineNotes] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const declineReasons = [
    { value: 'incomplete_information', label: 'Incomplete Information', description: 'Missing required business details or documentation' },
    { value: 'invalid_business', label: 'Invalid Business', description: 'Unable to verify business legitimacy' },
    { value: 'policy_violation', label: 'Policy Violation', description: 'Does not meet platform guidelines' },
    { value: 'duplicate_application', label: 'Duplicate Application', description: 'Business already has an account' },
    { value: 'insufficient_documentation', label: 'Insufficient Documentation', description: 'Need additional verification documents' },
    { value: 'location_restrictions', label: 'Location Restrictions', description: 'Service not available in this area' },
    { value: 'other', label: 'Other', description: 'Please specify in notes' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return FiCheckCircle;
      case 'declined': return FiXCircle;
      case 'suspended': return FiAlertTriangle;
      default: return FiClock;
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await onApprove(gymAccount.id, approvalNotes);
      setShowApprovalModal(false);
      setApprovalNotes('');
      toast.success(`${gymAccount.business_name} has been approved! 🎉`);
    } catch (error) {
      toast.error('Failed to approve gym account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason) {
      toast.error('Please select a decline reason');
      return;
    }

    setActionLoading(true);
    try {
      await onDecline(gymAccount.id, declineReason, declineNotes);
      setShowDeclineModal(false);
      setDeclineReason('');
      setDeclineNotes('');
      toast.success(`${gymAccount.business_name} application has been declined.`);
    } catch (error) {
      toast.error('Failed to decline gym account');
    } finally {
      setActionLoading(false);
    }
  };

  const ApprovalModal = () => (
    <AnimatePresence>
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <SafeIcon icon={FiCheckCircle} className="text-5xl text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Gym Account</h3>
              <p className="text-gray-600">
                You're about to approve <strong>{gymAccount.business_name}</strong> for the platform.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ What happens when approved:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Gym can accept payments from members</li>
                  <li>• Access to membership management tools</li>
                  <li>• Listed in public gym directory</li>
                  <li>• Can create and manage membership plans</li>
                  <li>• Email notification sent to gym owner</li>
                </ul>
              </div>

              <div>
                <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  id="approvalNotes"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any notes or welcome message for the gym owner..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiCheckCircle} />
                    <span>Approve Gym</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const DeclineModal = () => (
    <AnimatePresence>
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <SafeIcon icon={FiXCircle} className="text-5xl text-red-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Decline Gym Account</h3>
              <p className="text-gray-600">
                You're about to decline <strong>{gymAccount.business_name}</strong>'s application.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decline Reason *
                </label>
                <div className="space-y-2">
                  {declineReasons.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        declineReason === reason.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="declineReason"
                        value={reason.value}
                        checked={declineReason === reason.value}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{reason.label}</div>
                        <div className="text-sm text-gray-600">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="declineNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="declineNotes"
                  value={declineNotes}
                  onChange={(e) => setDeclineNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Provide additional details or instructions for the gym owner..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ What happens when declined:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Gym cannot accept payments or manage memberships</li>
                  <li>• Email notification sent with decline reason</li>
                  <li>• Gym owner can reapply after addressing issues</li>
                  <li>• Account status changed to "declined"</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading || !declineReason}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Declining...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiXCircle} />
                    <span>Decline Application</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <SafeIcon icon={FiBuilding} className="text-3xl" />
              <div>
                <h3 className="text-xl font-bold">{gymAccount.business_name}</h3>
                <p className="text-blue-100">Business Application</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(gymAccount.verification_status || 'pending')}`}>
              <SafeIcon icon={getStatusIcon(gymAccount.verification_status || 'pending')} className="mr-1 inline" />
              {(gymAccount.verification_status || 'pending').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Business Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiMail} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Business Email</p>
                    <p className="font-medium">{gymAccount.business_email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiPhone} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{gymAccount.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiMapPin} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {gymAccount.address}<br />
                      {gymAccount.city}, {gymAccount.state} {gymAccount.zip_code}
                    </p>
                  </div>
                </div>

                {gymAccount.website && (
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiGlobe} className="text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a
                        href={gymAccount.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {gymAccount.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Application Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCalendar} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Applied</p>
                    <p className="font-medium">{formatDate(gymAccount.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiUser} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-medium">{gymAccount.profiles_gym2024?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{gymAccount.profiles_gym2024?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiDollarSign} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Subscription Plan</p>
                    <p className="font-medium capitalize">{gymAccount.subscription_plan || 'Basic'}</p>
                  </div>
                </div>

                {gymAccount.verification_status === 'approved' && (
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiShield} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-medium text-green-600">
                        {gymAccount.payment_enabled ? '✅ Enabled' : '❌ Disabled'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {gymAccount.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Business Description</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{gymAccount.description}</p>
              </div>
            </div>
          )}

          {/* Previous Actions */}
          {gymAccount.verification_status !== 'pending' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Previous Action</h4>
              <div className="text-sm text-gray-600">
                {gymAccount.verification_status === 'approved' && (
                  <p>✅ Approved on {formatDate(gymAccount.verification_date)}</p>
                )}
                {gymAccount.verification_status === 'declined' && (
                  <>
                    <p>❌ Declined on {formatDate(gymAccount.verification_date)}</p>
                    {gymAccount.decline_reason && (
                      <p className="mt-1">Reason: {gymAccount.decline_reason.replace(/_/g, ' ')}</p>
                    )}
                  </>
                )}
                {gymAccount.verification_notes && (
                  <p className="mt-2 italic">Notes: {gymAccount.verification_notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {gymAccount.verification_status === 'pending' && (
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalModal(true)}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiCheckCircle} />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiXCircle} />
                <span>Decline</span>
              </button>
            </div>
          )}

          {gymAccount.verification_status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="text-green-600 text-xl" />
                <div>
                  <p className="font-medium text-green-800">
                    🎉 This gym is approved and can now accept payments!
                  </p>
                  <p className="text-sm text-green-700">
                    Gym can manage memberships, create plans, and process payments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {gymAccount.verification_status === 'declined' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiXCircle} className="text-red-600 text-xl" />
                <div>
                  <p className="font-medium text-red-800">Application Declined</p>
                  <p className="text-sm text-red-700">
                    This gym application has been declined and cannot accept payments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <ApprovalModal />
      <DeclineModal />
    </>
  );
};

export default GymVerificationCard;