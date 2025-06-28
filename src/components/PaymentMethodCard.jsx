import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiCheck, FiTrash2 } = FiIcons;

const PaymentMethodCard = ({ paymentMethod, isSelected, onSelect, onDelete, showActions = true }) => {
  const getBrandIcon = (brand) => {
    // In a real app, you'd use actual brand icons
    return FiCreditCard;
  };

  const getBrandColor = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return 'text-blue-600';
      case 'mastercard': return 'text-red-600';
      case 'amex': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onSelect && onSelect(paymentMethod)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SafeIcon 
            icon={getBrandIcon(paymentMethod.brand)} 
            className={`text-2xl ${getBrandColor(paymentMethod.brand)}`}
          />
          <div>
            <div className="font-medium text-gray-900">
              •••• •••• •••• {paymentMethod.last4}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {paymentMethod.brand} {paymentMethod.type}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {paymentMethod.is_default && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Default
            </span>
          )}
          
          {isSelected && (
            <SafeIcon icon={FiCheck} className="text-blue-600" />
          )}

          {showActions && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(paymentMethod.id);
              }}
              className="text-red-600 hover:text-red-800 transition-colors p-1"
            >
              <SafeIcon icon={FiTrash2} className="text-sm" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentMethodCard;