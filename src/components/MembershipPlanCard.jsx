import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiEdit2, FiTrash2, FiDollarSign, FiClock, FiStar } = FiIcons;

const MembershipPlanCard = ({ plan, onEdit, onDelete, canManage = true }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getBillingPeriodLabel = (period) => {
    switch (period) {
      case 'monthly': return 'per month';
      case 'quarterly': return 'per quarter';
      case 'yearly': return 'per year';
      default: return `per ${period}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-xl shadow-lg p-6 relative ${
        plan.name.toLowerCase().includes('premium') ? 'ring-2 ring-blue-500' : 'border border-gray-200'
      }`}
    >
      {plan.name.toLowerCase().includes('premium') && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <SafeIcon icon={FiStar} className="text-xs" />
            <span>Most Popular</span>
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center mb-2">
          <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
          <span className="text-gray-500 ml-2">{getBillingPeriodLabel(plan.billing_period)}</span>
        </div>
        <p className="text-gray-600">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <SafeIcon icon={FiCheck} className="text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            plan.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {plan.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Created:</span>
          <span>{new Date(plan.created_at).toLocaleDateString()}</span>
        </div>

        {canManage && (
          <div className="flex space-x-2 pt-4">
            <button
              onClick={() => onEdit(plan)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiEdit2} className="text-sm" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(plan.id)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiTrash2} className="text-sm" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MembershipPlanCard;