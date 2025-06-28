import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiStar } = FiIcons;

const PricingCard = ({ plan, isCurrentPlan, onSelectPlan, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-xl shadow-lg p-8 ${
        plan.popular ? 'ring-2 ring-blue-500' : 'border border-gray-200'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <SafeIcon icon={FiStar} className="text-xs" />
            <span>Most Popular</span>
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-500 ml-1">/{plan.interval}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <SafeIcon icon={FiCheck} className="text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelectPlan(plan)}
        disabled={loading || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isCurrentPlan
            ? 'bg-green-100 text-green-800 cursor-not-allowed'
            : plan.popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
      </button>
    </motion.div>
  );
};

export default PricingCard;