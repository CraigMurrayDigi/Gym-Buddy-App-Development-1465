-- Enhanced Gym Verification System for Production
-- This script sets up the complete gym approval workflow

-- First, ensure the gym_accounts table has all necessary fields
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'declined', 'suspended'));
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS business_documents JSONB;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS contact_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE gym_accounts_gym2024 ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create gym verification history table
CREATE TABLE IF NOT EXISTS gym_verification_history_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'declined', 'suspended', 'reactivated')),
  reason TEXT,
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym notifications table
CREATE TABLE IF NOT EXISTS gym_notifications_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('verification_approved', 'verification_declined', 'payment_enabled', 'suspension_notice', 'reactivation_notice')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE gym_verification_history_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_notifications_gym2024 ENABLE ROW LEVEL SECURITY;

-- Policies for gym_verification_history_gym2024
CREATE POLICY "Admins can view all verification history" ON gym_verification_history_gym2024
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert verification history" ON gym_verification_history_gym2024
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies for gym_notifications_gym2024
CREATE POLICY "Gym owners can view their notifications" ON gym_notifications_gym2024
  FOR SELECT USING (
    gym_account_id IN (
      SELECT id FROM gym_accounts_gym2024 WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all notifications" ON gym_notifications_gym2024
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to approve gym account
CREATE OR REPLACE FUNCTION approve_gym_account(
  gym_id UUID,
  admin_id UUID,
  approval_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  gym_record RECORD;
  result JSONB;
BEGIN
  -- Get gym account details
  SELECT * INTO gym_record FROM gym_accounts_gym2024 WHERE id = gym_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gym account not found');
  END IF;

  -- Update gym account status
  UPDATE gym_accounts_gym2024 
  SET 
    verification_status = 'approved',
    verified = true,
    verification_date = NOW(),
    verified_by = admin_id,
    verification_notes = approval_notes,
    payment_enabled = true,
    updated_at = NOW()
  WHERE id = gym_id;

  -- Insert verification history
  INSERT INTO gym_verification_history_gym2024 (
    gym_account_id, admin_id, action, notes, previous_status, new_status
  ) VALUES (
    gym_id, admin_id, 'approved', approval_notes, gym_record.verification_status, 'approved'
  );

  -- Create notification for gym owner
  INSERT INTO gym_notifications_gym2024 (
    gym_account_id, notification_type, title, message
  ) VALUES (
    gym_id, 
    'verification_approved',
    'Gym Account Approved! 🎉',
    'Congratulations! Your gym account has been approved and you can now accept payments and manage memberships. Welcome to the Gym Buddy platform!'
  );

  -- Update user profile to ensure gym_owner account type
  UPDATE profiles_gym2024 
  SET account_type = 'gym_owner'
  WHERE id = gym_record.user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Gym account approved successfully',
    'gym_name', gym_record.business_name,
    'payment_enabled', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline gym account
CREATE OR REPLACE FUNCTION decline_gym_account(
  gym_id UUID,
  admin_id UUID,
  decline_reason TEXT,
  decline_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  gym_record RECORD;
  result JSONB;
BEGIN
  -- Get gym account details
  SELECT * INTO gym_record FROM gym_accounts_gym2024 WHERE id = gym_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gym account not found');
  END IF;

  -- Update gym account status
  UPDATE gym_accounts_gym2024 
  SET 
    verification_status = 'declined',
    verified = false,
    verification_date = NOW(),
    verified_by = admin_id,
    verification_notes = decline_notes,
    decline_reason = decline_reason,
    payment_enabled = false,
    updated_at = NOW()
  WHERE id = gym_id;

  -- Insert verification history
  INSERT INTO gym_verification_history_gym2024 (
    gym_account_id, admin_id, action, reason, notes, previous_status, new_status
  ) VALUES (
    gym_id, admin_id, 'declined', decline_reason, decline_notes, gym_record.verification_status, 'declined'
  );

  -- Create notification for gym owner
  INSERT INTO gym_notifications_gym2024 (
    gym_account_id, notification_type, title, message
  ) VALUES (
    gym_id, 
    'verification_declined',
    'Gym Account Application Update',
    'Your gym account application has been reviewed. Reason: ' || decline_reason || '. Please contact support if you have questions or would like to reapply.'
  );

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Gym account declined',
    'gym_name', gym_record.business_name,
    'reason', decline_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get gym verification statistics
CREATE OR REPLACE FUNCTION get_gym_verification_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_applications', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE verification_status = 'pending'),
    'approved', COUNT(*) FILTER (WHERE verification_status = 'approved'),
    'declined', COUNT(*) FILTER (WHERE verification_status = 'declined'),
    'suspended', COUNT(*) FILTER (WHERE verification_status = 'suspended'),
    'payment_enabled', COUNT(*) FILTER (WHERE payment_enabled = true)
  ) INTO stats
  FROM gym_accounts_gym2024;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify gym owners via email (placeholder for production email service)
CREATE OR REPLACE FUNCTION send_gym_notification_email(
  gym_id UUID,
  notification_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  gym_record RECORD;
  email_sent BOOLEAN := false;
BEGIN
  -- Get gym and owner details
  SELECT 
    ga.business_name,
    ga.business_email,
    p.name as owner_name,
    p.email as owner_email
  INTO gym_record
  FROM gym_accounts_gym2024 ga
  JOIN profiles_gym2024 p ON ga.user_id = p.id
  WHERE ga.id = gym_id;

  -- In production, this would integrate with your email service
  -- For now, we'll just log the email that would be sent
  RAISE NOTICE 'EMAIL: To: %, Subject: Gym Account %, Body: Your gym account % has been %', 
    gym_record.business_email, 
    notification_type, 
    gym_record.business_name,
    notification_type;

  -- Mark notification as email sent
  UPDATE gym_notifications_gym2024 
  SET email_sent = true 
  WHERE gym_account_id = gym_id 
    AND notification_type = send_gym_notification_email.notification_type
    AND email_sent = false;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to send email notifications
CREATE OR REPLACE FUNCTION trigger_gym_email_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send email notification for new notifications
  PERFORM send_gym_notification_email(NEW.gym_account_id, NEW.notification_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email notifications
DROP TRIGGER IF EXISTS gym_notification_email_trigger ON gym_notifications_gym2024;
CREATE TRIGGER gym_notification_email_trigger
  AFTER INSERT ON gym_notifications_gym2024
  FOR EACH ROW
  EXECUTE FUNCTION trigger_gym_email_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION approve_gym_account TO authenticated;
GRANT EXECUTE ON FUNCTION decline_gym_account TO authenticated;
GRANT EXECUTE ON FUNCTION get_gym_verification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION send_gym_notification_email TO authenticated;

-- Insert some sample data for testing
INSERT INTO gym_accounts_gym2024 (
  user_id, business_name, business_email, phone, address, city, state, zip_code,
  website, description, verification_status, created_at
) VALUES 
(
  'demo-gym-user-1'::uuid,
  'Elite Fitness Center',
  'info@elitefitness.com',
  '(555) 123-4567',
  '456 Workout Ave',
  'New York',
  'NY',
  '10001',
  'https://elitefitness.com',
  'Premium fitness facility with state-of-the-art equipment and expert trainers.',
  'pending',
  NOW() - INTERVAL '2 days'
),
(
  'demo-gym-user-2'::uuid,
  'Community Gym Plus',
  'hello@communitygym.com',
  '(555) 987-6543',
  '789 Health Street',
  'Los Angeles',
  'CA',
  '90210',
  'https://communitygym.com',
  'Affordable community gym focused on making fitness accessible to everyone.',
  'pending',
  NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- Test the functions
SELECT 'Gym verification system setup complete!' as status;
SELECT get_gym_verification_stats() as current_stats;