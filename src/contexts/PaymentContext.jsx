import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Demo payment plans
  const PAYMENT_PLANS = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      features: [
        'Find workout buddies',
        'Schedule workouts',
        'Basic chat features',
        'Upload up to 10 photos'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      interval: 'month',
      features: [
        'All Basic features',
        'Unlimited photo & video uploads',
        'Advanced search filters',
        'Priority customer support',
        'Workout analytics',
        'Personal trainer booking'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 39.99,
      interval: 'month',
      features: [
        'All Premium features',
        'Create workout groups',
        'Advanced analytics dashboard',
        'Custom workout programs',
        'Nutrition tracking',
        'Direct trainer messaging'
      ],
      popular: false
    }
  ];

  // Demo personal training sessions
  const TRAINING_SESSIONS = [
    {
      id: 'pt-1',
      name: 'Personal Training Session',
      price: 75.00,
      duration: '60 minutes',
      description: 'One-on-one personal training session with certified trainer'
    },
    {
      id: 'pt-3',
      name: '3 Session Package',
      price: 210.00,
      originalPrice: 225.00,
      duration: '3 x 60 minutes',
      description: 'Package of 3 personal training sessions (Save $15!)'
    },
    {
      id: 'pt-10',
      name: '10 Session Package',
      price: 650.00,
      originalPrice: 750.00,
      duration: '10 x 60 minutes',
      description: 'Package of 10 personal training sessions (Save $100!)'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserSubscriptions();
      fetchUserTransactions();
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchUserSubscriptions = async () => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        // Demo data
        setSubscriptions([
          {
            id: 'sub-1',
            user_id: user.id,
            plan_id: 'basic',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions_gym2024')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchUserTransactions = async () => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        // Demo data
        setTransactions([
          {
            id: 'txn-1',
            user_id: user.id,
            amount: 9.99,
            currency: 'USD',
            type: 'subscription',
            status: 'completed',
            description: 'Basic Plan - Monthly Subscription',
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('transactions_gym2024')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      if (!supabase || typeof supabase.from !== 'function') {
        // Demo data
        setPaymentMethods([
          {
            id: 'pm-1',
            user_id: user.id,
            type: 'card',
            last4: '4242',
            brand: 'visa',
            is_default: true,
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('payment_methods_gym2024')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const createSubscription = async (planId, paymentMethodId) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const newSubscription = {
        id: `sub-${Date.now()}`,
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      const newTransaction = {
        id: `txn-${Date.now()}`,
        user_id: user.id,
        amount: plan.price,
        currency: 'USD',
        type: 'subscription',
        status: 'completed',
        description: `${plan.name} Plan - Monthly Subscription`,
        created_at: new Date().toISOString()
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      setTransactions(prev => [newTransaction, ...prev]);

      // Try to save to database if available
      if (supabase && typeof supabase.from === 'function') {
        try {
          await supabase.from('subscriptions_gym2024').insert([newSubscription]);
          await supabase.from('transactions_gym2024').insert([newTransaction]);
        } catch (dbError) {
          console.log('Database save failed, keeping local data');
        }
      }

      return { subscription: newSubscription, error: null };
    } catch (error) {
      console.error('Create subscription error:', error);
      return { subscription: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const purchaseTrainingSession = async (sessionId, paymentMethodId, trainerId) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const session = TRAINING_SESSIONS.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Training session not found');
      }

      const newTransaction = {
        id: `txn-${Date.now()}`,
        user_id: user.id,
        amount: session.price,
        currency: 'USD',
        type: 'training_session',
        status: 'completed',
        description: session.name,
        metadata: {
          session_id: sessionId,
          trainer_id: trainerId,
          duration: session.duration
        },
        created_at: new Date().toISOString()
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Try to save to database if available
      if (supabase && typeof supabase.from === 'function') {
        try {
          await supabase.from('transactions_gym2024').insert([newTransaction]);
        } catch (dbError) {
          console.log('Database save failed, keeping local data');
        }
      }

      return { transaction: newTransaction, error: null };
    } catch (error) {
      console.error('Purchase training session error:', error);
      return { transaction: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (cardData) => {
    setLoading(true);
    try {
      // Simulate payment method validation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPaymentMethod = {
        id: `pm-${Date.now()}`,
        user_id: user.id,
        type: 'card',
        last4: cardData.number.slice(-4),
        brand: cardData.brand || 'visa',
        is_default: paymentMethods.length === 0,
        created_at: new Date().toISOString()
      };

      setPaymentMethods(prev => [newPaymentMethod, ...prev]);

      // Try to save to database if available
      if (supabase && typeof supabase.from === 'function') {
        try {
          await supabase.from('payment_methods_gym2024').insert([newPaymentMethod]);
        } catch (dbError) {
          console.log('Database save failed, keeping local data');
        }
      }

      return { paymentMethod: newPaymentMethod, error: null };
    } catch (error) {
      console.error('Add payment method error:', error);
      return { paymentMethod: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    setLoading(true);
    try {
      // Simulate cancellation processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled', cancelled_at: new Date().toISOString() }
            : sub
        )
      );

      // Try to update database if available
      if (supabase && typeof supabase.from === 'function') {
        try {
          await supabase
            .from('subscriptions_gym2024')
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq('id', subscriptionId);
        } catch (dbError) {
          console.log('Database update failed, keeping local data');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getActiveSubscription = () => {
    return subscriptions.find(sub => sub.status === 'active');
  };

  const getCurrentPlan = () => {
    const activeSub = getActiveSubscription();
    if (!activeSub) return null;
    return PAYMENT_PLANS.find(plan => plan.id === activeSub.plan_id);
  };

  const formatPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const value = {
    // Data
    subscriptions,
    transactions,
    paymentMethods,
    PAYMENT_PLANS,
    TRAINING_SESSIONS,
    loading,

    // Methods
    createSubscription,
    purchaseTrainingSession,
    addPaymentMethod,
    cancelSubscription,
    getActiveSubscription,
    getCurrentPlan,
    formatPrice,

    // Utilities
    fetchUserSubscriptions,
    fetchUserTransactions,
    fetchPaymentMethods
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};