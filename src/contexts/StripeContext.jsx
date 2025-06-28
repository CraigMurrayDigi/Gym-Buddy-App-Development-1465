import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const StripeContext = createContext();

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [stripeAccount, setStripeAccount] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Demo Stripe account data
  const DEMO_STRIPE_ACCOUNT = {
    id: 'acct_demo12345',
    email: 'gym@example.com',
    country: 'US',
    default_currency: 'usd',
    charges_enabled: true,
    payouts_enabled: true,
    details_submitted: true,
    created: new Date().getTime() / 1000
  };

  // Demo membership plans
  const DEMO_PLANS = [
    {
      id: 'plan_basic_demo',
      name: 'Basic Membership',
      price: 29.99,
      billing_period: 'monthly',
      description: 'Access to gym equipment and basic facilities',
      features: [
        'Gym equipment access',
        'Locker room access',
        'Basic workout tracking',
        'Mobile app access'
      ],
      stripe_price_id: 'price_demo_basic',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'plan_premium_demo',
      name: 'Premium Membership',
      price: 59.99,
      billing_period: 'monthly',
      description: 'Premium access with personal training sessions',
      features: [
        'All Basic features',
        '2 personal training sessions/month',
        'Group fitness classes',
        'Nutrition consultation',
        'Priority equipment access'
      ],
      stripe_price_id: 'price_demo_premium',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (user?.account_type === 'gym_owner') {
      fetchStripeAccount();
      fetchMembershipPlans();
    }
  }, [user]);

  const fetchStripeAccount = async () => {
    try {
      // In real app, this would fetch from your backend
      // For demo, we'll use mock data if gym owner has connected Stripe
      if (user?.gym_data?.stripe_connected) {
        setStripeAccount(DEMO_STRIPE_ACCOUNT);
      }
    } catch (error) {
      console.error('Error fetching Stripe account:', error);
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      // In real app, this would fetch from database
      // For demo, we'll use mock data
      if (user?.gym_data?.stripe_connected) {
        setMembershipPlans(DEMO_PLANS);
      } else {
        setMembershipPlans([]);
      }
    } catch (error) {
      console.error('Error fetching membership plans:', error);
    }
  };

  const connectStripeAccount = async () => {
    setLoading(true);
    try {
      // In a real app, this would:
      // 1. Create Stripe Connect account
      // 2. Redirect to Stripe onboarding
      // 3. Handle the return and save account details
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      setStripeAccount(DEMO_STRIPE_ACCOUNT);
      setMembershipPlans(DEMO_PLANS);
      
      toast.success('Stripe account connected successfully!');
      return { success: true, account: DEMO_STRIPE_ACCOUNT };
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error('Failed to connect Stripe account');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disconnectStripeAccount = async () => {
    setLoading(true);
    try {
      // In real app, this would disconnect the Stripe account
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStripeAccount(null);
      setMembershipPlans([]);
      
      toast.success('Stripe account disconnected successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast.error('Failed to disconnect Stripe account');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const createMembershipPlan = async (planData) => {
    setLoading(true);
    try {
      // In real app, this would:
      // 1. Create Stripe product
      // 2. Create Stripe price
      // 3. Save to database
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPlan = {
        id: `plan_${Date.now()}`,
        ...planData,
        stripe_price_id: `price_${Date.now()}`,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      setMembershipPlans(prev => [...prev, newPlan]);
      toast.success('Membership plan created successfully!');
      
      return { success: true, plan: newPlan };
    } catch (error) {
      console.error('Error creating membership plan:', error);
      toast.error('Failed to create membership plan');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateMembershipPlan = async (planId, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembershipPlans(prev => 
        prev.map(plan => 
          plan.id === planId 
            ? { ...plan, ...updates, updated_at: new Date().toISOString() }
            : plan
        )
      );
      
      toast.success('Membership plan updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error updating membership plan:', error);
      toast.error('Failed to update membership plan');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteMembershipPlan = async (planId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembershipPlans(prev => prev.filter(plan => plan.id !== planId));
      toast.success('Membership plan deleted successfully!');
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting membership plan:', error);
      toast.error('Failed to delete membership plan');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    stripeAccount,
    membershipPlans,
    loading,
    connectStripeAccount,
    disconnectStripeAccount,
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan,
    fetchMembershipPlans,
    fetchStripeAccount
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};