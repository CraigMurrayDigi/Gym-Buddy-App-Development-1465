import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiCheckCircle, FiAlertCircle, FiExternalLink, FiDollarSign, FiShield } = FiIcons;

const StripeConnectCard = ({ stripeAccount, onConnect, onDisconnect, loading }) => {
  if (!stripeAccount) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white"
      >
        <div className="text-center">
          <SafeIcon icon={FiCreditCard} className="text-6xl mb-4 mx-auto opacity-90" />
          <h3 className="text-2xl font-bold mb-4">Connect Your Stripe Account</h3>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Connect your Stripe account to start accepting payments for membership plans. 
            Stripe handles all payment processing securely.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <SafeIcon icon={FiShield} className="text-2xl mb-2 mx-auto" />
              <div className="font-medium">Secure</div>
              <div className="text-blue-100">Bank-level security</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <SafeIcon icon={FiDollarSign} className="text-2xl mb-2 mx-auto" />
              <div className="font-medium">Low Fees</div>
              <div className="text-blue-100">2.9% + 30¢ per transaction</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <SafeIcon icon={FiCreditCard} className="text-2xl mb-2 mx-auto" />
              <div className="font-medium">All Cards</div>
              <div className="text-blue-100">Visa, Mastercard, Amex</div>
            </div>
          </div>

          <button
            onClick={onConnect}
            disabled={loading}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
          >
            <SafeIcon icon={FiExternalLink} />
            <span>{loading ? 'Connecting...' : 'Connect with Stripe'}</span>
          </button>
          
          <p className="text-xs text-blue-200 mt-4">
            By connecting, you agree to Stripe's Terms of Service
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded-lg p-3">
            <SafeIcon icon={FiCheckCircle} className="text-2xl text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Stripe Account Connected</h3>
            <p className="text-gray-600">Your payment processing is set up and ready</p>
          </div>
        </div>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
          Active
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700">Account ID</div>
          <div className="text-gray-900 font-mono text-sm">{stripeAccount.id}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700">Email</div>
          <div className="text-gray-900">{stripeAccount.email}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700">Country</div>
          <div className="text-gray-900">{stripeAccount.country?.toUpperCase()}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700">Currency</div>
          <div className="text-gray-900">{stripeAccount.default_currency?.toUpperCase()}</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={stripeAccount.charges_enabled ? FiCheckCircle : FiAlertCircle} 
              className={stripeAccount.charges_enabled ? 'text-green-500' : 'text-orange-500'} 
            />
            <span className="text-gray-700">
              Charges {stripeAccount.charges_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={stripeAccount.payouts_enabled ? FiCheckCircle : FiAlertCircle} 
              className={stripeAccount.payouts_enabled ? 'text-green-500' : 'text-orange-500'} 
            />
            <span className="text-gray-700">
              Payouts {stripeAccount.payouts_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <button
          onClick={onDisconnect}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    </motion.div>
  );
};

export default StripeConnectCard;