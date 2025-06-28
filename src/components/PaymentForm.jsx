import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiLock, FiCalendar, FiUser } = FiIcons;

const PaymentForm = ({ onSubmit, loading, buttonText = 'Add Payment Method' }) => {
  const [formData, setFormData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    brand: 'visa'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Limit to 16 digits + spaces
    }

    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return; // Limit to MM/YY
    }

    // Format CVC
    if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return; // Limit to 4 digits
    }

    setFormData({ ...formData, [name]: formattedValue });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number || formData.number.replace(/\s/g, '').length < 16) {
      newErrors.number = 'Please enter a valid card number';
    }

    if (!formData.expiry || formData.expiry.length < 5) {
      newErrors.expiry = 'Please enter a valid expiry date';
    }

    if (!formData.cvc || formData.cvc.length < 3) {
      newErrors.cvc = 'Please enter a valid CVC';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className="relative">
          <SafeIcon icon={FiCreditCard} className="absolute left-3 top-3 text-gray-400" />
          <input
            id="number"
            name="number"
            type="text"
            value={formData.number}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.number ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.number && (
          <p className="mt-1 text-sm text-red-600">{errors.number}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div className="relative">
            <SafeIcon icon={FiCalendar} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="expiry"
              name="expiry"
              type="text"
              value={formData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expiry ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.expiry && (
            <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
          )}
        </div>

        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-2">
            CVC
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
            <input
              id="cvc"
              name="cvc"
              type="text"
              value={formData.cvc}
              onChange={handleChange}
              placeholder="123"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cvc ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.cvc && (
            <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name
        </label>
        <div className="relative">
          <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <SafeIcon icon={FiLock} />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : buttonText}
      </button>
    </motion.form>
  );
};

export default PaymentForm;