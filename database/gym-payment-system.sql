-- Production Gym Payment System Schema
-- This sets up the complete payment infrastructure for gym businesses

-- Enhanced gym accounts table with payment fields
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS stripe_account_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS payment_processing_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]';
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles_gym2024(id);
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'rejected', 'under_review'));

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_charge_id TEXT,
  membership_plan_id UUID REFERENCES gym_membership_plans_gym2024(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')),
  payment_method TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  stripe_fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS gym_subscriptions_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  membership_plan_id UUID REFERENCES gym_membership_plans_gym2024(id),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS customer_payment_methods_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym verification audit log
CREATE TABLE IF NOT EXISTS gym_verification_log_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles_gym2024(id),
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'documents_requested', 'stripe_connected', 'payment_enabled')),
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE payment_transactions_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_subscriptions_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payment_methods_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_verification_log_gym2024 ENABLE ROW LEVEL SECURITY;

-- Create policies for payment transactions
CREATE POLICY "Gym owners can view their transactions" ON payment_transactions_gym2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gym_accounts_gym2024 
      WHERE id = gym_account_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their transactions" ON payment_transactions_gym2024
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON payment_transactions_gym2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles_gym2024 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for subscriptions
CREATE POLICY "Gym owners can view their subscriptions" ON gym_subscriptions_gym2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gym_accounts_gym2024 
      WHERE id = gym_account_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their subscriptions" ON gym_subscriptions_gym2024
  FOR SELECT USING (customer_id = auth.uid());

-- Create policies for payment methods
CREATE POLICY "Users can manage their payment methods" ON customer_payment_methods_gym2024
  FOR ALL USING (customer_id = auth.uid());

-- Create policies for verification log
CREATE POLICY "Admins can view verification logs" ON gym_verification_log_gym2024
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_gym2024 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Gym owners can view their verification logs" ON gym_verification_log_gym2024
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gym_accounts_gym2024 
      WHERE id = gym_account_id AND user_id = auth.uid()
    )
  );

-- Function to log verification actions
CREATE OR REPLACE FUNCTION log_gym_verification_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO gym_verification_log_gym2024 (
    gym_account_id,
    admin_id,
    action,
    previous_status,
    new_status,
    notes,
    metadata
  ) VALUES (
    NEW.id,
    auth.uid(),
    CASE 
      WHEN OLD.verified IS FALSE AND NEW.verified IS TRUE THEN 'approved'
      WHEN OLD.verified IS TRUE AND NEW.verified IS FALSE THEN 'rejected'
      WHEN OLD.stripe_account_enabled IS FALSE AND NEW.stripe_account_enabled IS TRUE THEN 'stripe_connected'
      WHEN OLD.payment_processing_enabled IS FALSE AND NEW.payment_processing_enabled IS TRUE THEN 'payment_enabled'
      ELSE 'updated'
    END,
    COALESCE(OLD.compliance_status, 'pending'),
    NEW.compliance_status,
    NEW.verification_notes,
    json_build_object(
      'stripe_account_id', NEW.stripe_account_id,
      'charges_enabled', NEW.stripe_charges_enabled,
      'payouts_enabled', NEW.stripe_payouts_enabled
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for verification logging
DROP TRIGGER IF EXISTS gym_verification_audit_trigger ON gym_accounts_gym2024;
CREATE TRIGGER gym_verification_audit_trigger
  AFTER UPDATE ON gym_accounts_gym2024
  FOR EACH ROW
  EXECUTE FUNCTION log_gym_verification_action();

-- Function to automatically enable payment processing when gym is fully verified
CREATE OR REPLACE FUNCTION enable_gym_payment_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if gym is verified and has valid Stripe account
  IF NEW.verified = TRUE AND 
     NEW.stripe_account_enabled = TRUE AND 
     NEW.stripe_charges_enabled = TRUE AND 
     NEW.stripe_payouts_enabled = TRUE AND
     OLD.payment_processing_enabled = FALSE THEN
    
    -- Enable payment processing
    NEW.payment_processing_enabled = TRUE;
    NEW.compliance_status = 'approved';
    NEW.verified_at = NOW();
    NEW.verified_by = auth.uid();
    
    -- Send notification (placeholder for webhook/email service)
    PERFORM pg_notify(
      'gym_payment_enabled',
      json_build_object(
        'gym_account_id', NEW.id,
        'business_name', NEW.business_name,
        'business_email', NEW.business_email,
        'enabled_at', NOW()
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic payment enabling
DROP TRIGGER IF EXISTS enable_payment_processing_trigger ON gym_accounts_gym2024;
CREATE TRIGGER enable_payment_processing_trigger
  BEFORE UPDATE ON gym_accounts_gym2024
  FOR EACH ROW
  EXECUTE FUNCTION enable_gym_payment_processing();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gym_accounts_verification_status ON gym_accounts_gym2024(verified, compliance_status);
CREATE INDEX IF NOT EXISTS idx_gym_accounts_stripe ON gym_accounts_gym2024(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gym ON payment_transactions_gym2024(gym_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer ON payment_transactions_gym2024(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_gym ON gym_subscriptions_gym2024(gym_account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON gym_subscriptions_gym2024(customer_id);
CREATE INDEX IF NOT EXISTS idx_verification_log_gym ON gym_verification_log_gym2024(gym_account_id);

-- Insert sample verification data for demo
INSERT INTO gym_verification_log_gym2024 (gym_account_id, action, new_status, notes) 
VALUES (
  (SELECT id FROM gym_accounts_gym2024 LIMIT 1),
  'submitted',
  'pending',
  'Initial application submitted'
) ON CONFLICT DO NOTHING;