import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiDollarSign, FiTrendingUp, FiUsers, FiCalendar, FiArrowUpRight, FiRefreshCw } = FiIcons;

const PaymentProcessingCard = ({ gymAccount, transactions = [], subscriptions = [] }) => {
  const [timeRange, setTimeRange] = useState('30d');

  // Calculate analytics
  const calculateAnalytics = () => {
    const now = new Date();
    const rangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const startDate = new Date(now.getTime() - rangeMs);

    const recentTransactions = transactions.filter(t => 
      new Date(t.created_at) >= startDate && t.status === 'succeeded'
    );

    const totalRevenue = recentTransactions.reduce((sum, t) => sum + (t.net_amount || 0), 0);
    const totalTransactions = recentTransactions.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      activeSubscriptions,
      averageTransactionValue
    };
  };

  const analytics = calculateAnalytics();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!gymAccount?.payment_processing_enabled) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center py-8">
          <SafeIcon icon={FiCreditCard} className="text-6xl text-gray-300 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Processing Disabled</h3>
          <p className="text-gray-600 mb-4">
            Payment processing is not enabled for this gym account.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-yellow-800 mb-2">To enable payments:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Complete gym verification process</li>
              <li>• Connect Stripe account</li>
              <li>• Submit required business documents</li>
              <li>• Wait for admin approval</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Status */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">💳 Payment Processing Active</h3>
            <p className="text-green-100">
              Your gym can now accept payments and manage memberships!
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <SafeIcon icon={FiCreditCard} className="text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiDollarSign} className="text-2xl text-green-600" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="flex items-center mt-2 text-xs text-green-600">
            <SafeIcon icon={FiTrendingUp} className="mr-1" />
            <span>Last {timeRange === '7d' ? '7 days' : '30 days'}</span>
          </div>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiCreditCard} className="text-2xl text-blue-600" />
            <SafeIcon icon={FiRefreshCw} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.totalTransactions}
          </div>
          <div className="text-sm text-gray-600">Transactions</div>
          <div className="text-xs text-gray-500 mt-2">
            Avg: {formatCurrency(analytics.averageTransactionValue)}
          </div>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiUsers} className="text-2xl text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.activeSubscriptions}
          </div>
          <div className="text-sm text-gray-600">Active Members</div>
          <div className="text-xs text-gray-500 mt-2">
            Recurring subscriptions
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="text-center">
            <SafeIcon icon={FiCalendar} className="text-2xl text-orange-600 mb-3 mx-auto" />
            <div className="text-lg font-bold text-gray-900 mb-1">
              Next Payout
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center mx-auto">
              View Details <SafeIcon icon={FiArrowUpRight} className="ml-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View All
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.status === 'succeeded' ? 'bg-green-500' : 
                    transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description || 'Membership Payment'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiCreditCard} className="text-4xl text-gray-300 mb-3 mx-auto" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Transactions will appear here once members start purchasing memberships
            </p>
          </div>
        )}
      </div>

      {/* Payment Setup Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">🎉 Payment Processing Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">What's Enabled:</h5>
            <ul className="text-blue-700 space-y-1">
              <li>• Credit & debit card payments</li>
              <li>• Recurring subscription billing</li>
              <li>• Automatic payment processing</li>
              <li>• Refund & dispute management</li>
              <li>• Real-time transaction monitoring</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">Payment Schedule:</h5>
            <ul className="text-blue-700 space-y-1">
              <li>• Payouts: Every 2 business days</li>
              <li>• Platform fee: 2.9% + $0.30 per transaction</li>
              <li>• No monthly fees or minimums</li>
              <li>• Instant payout available (1% fee)</li>
              <li>• Full transaction history & reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingCard;