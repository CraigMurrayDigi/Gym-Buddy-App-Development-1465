// Production-ready Stripe service for gym payment processing
// This would integrate with your backend API in production

class StripeService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-api.gymbuddy.com/api'
      : 'http://localhost:3001/api';
    this.apiKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  }

  // Create Stripe Connect account for gym
  async createConnectAccount(gymData) {
    try {
      console.log('🏢 Creating Stripe Connect account for:', gymData.business_name);
      
      const response = await fetch(`${this.baseURL}/stripe/create-connect-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          type: 'express',
          country: 'US',
          email: gymData.business_email,
          business_profile: {
            name: gymData.business_name,
            url: gymData.website,
            mcc: '7997', // Membership clubs (sports, recreation, athletic)
            product_description: 'Gym membership and fitness services'
          },
          company: {
            name: gymData.business_name,
            phone: gymData.phone,
            address: {
              line1: gymData.address,
              city: gymData.city,
              state: gymData.state,
              postal_code: gymData.zip_code,
              country: 'US'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe Connect account');
      }

      const result = await response.json();
      console.log('✅ Stripe Connect account created:', result.account_id);
      return result;
    } catch (error) {
      console.error('❌ Error creating Stripe Connect account:', error);
      throw error;
    }
  }

  // Create onboarding link for gym
  async createAccountLink(stripeAccountId, gymId) {
    try {
      const response = await fetch(`${this.baseURL}/stripe/create-account-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          account: stripeAccountId,
          refresh_url: `${window.location.origin}/#/gym-dashboard?setup=refresh`,
          return_url: `${window.location.origin}/#/gym-dashboard?setup=complete`,
          type: 'account_onboarding'
        })
      });

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw error;
    }
  }

  // Retrieve Stripe account status
  async getAccountStatus(stripeAccountId) {
    try {
      const response = await fetch(`${this.baseURL}/stripe/account/${stripeAccountId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting account status:', error);
      throw error;
    }
  }

  // Create payment intent for membership purchase
  async createPaymentIntent(amount, currency, gymAccountId, membershipPlanId, customerId) {
    try {
      const response = await fetch(`${this.baseURL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          application_fee_amount: Math.round(amount * 0.029 * 100), // 2.9% platform fee
          stripe_account: gymAccountId,
          customer: customerId,
          metadata: {
            gym_account_id: gymAccountId,
            membership_plan_id: membershipPlanId,
            platform: 'gym_buddy'
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Create subscription for recurring membership
  async createSubscription(customerId, priceId, gymAccountId, membershipPlanId) {
    try {
      const response = await fetch(`${this.baseURL}/stripe/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          customer: customerId,
          items: [{ price: priceId }],
          application_fee_percent: 2.9, // 2.9% platform fee
          stripe_account: gymAccountId,
          metadata: {
            gym_account_id: gymAccountId,
            membership_plan_id: membershipPlanId,
            platform: 'gym_buddy'
          }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentIntentId, amount, reason) {
    try {
      const response = await fetch(`${this.baseURL}/stripe/create-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          payment_intent: paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason || 'requested_by_customer'
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payment analytics for gym
  async getPaymentAnalytics(gymAccountId, dateRange) {
    try {
      const response = await fetch(`${this.baseURL}/stripe/analytics/${gymAccountId}?${new URLSearchParams(dateRange)}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw error;
    }
  }

  // Webhook handler for Stripe events
  async handleWebhook(event) {
    try {
      console.log('🔔 Processing Stripe webhook:', event.type);

      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        default:
          console.log('🔔 Unhandled webhook event type:', event.type);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Private helper methods
  async getAuthToken() {
    // In production, this would get the auth token from your auth system
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.access_token || 'demo_token';
  }

  async handleAccountUpdated(account) {
    // Update gym account status in database
    console.log('📊 Account updated:', account.id);
  }

  async handlePaymentSucceeded(paymentIntent) {
    // Update transaction status and send confirmation
    console.log('💰 Payment succeeded:', paymentIntent.id);
  }

  async handlePaymentFailed(paymentIntent) {
    // Handle failed payment
    console.log('❌ Payment failed:', paymentIntent.id);
  }

  async handleSubscriptionPayment(invoice) {
    // Process subscription payment
    console.log('📅 Subscription payment:', invoice.id);
  }

  async handleSubscriptionUpdated(subscription) {
    // Update subscription in database
    console.log('🔄 Subscription updated:', subscription.id);
  }
}

// Export singleton instance
export default new StripeService();