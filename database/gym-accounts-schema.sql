-- Additional tables for gym accounts
-- Run this after the main setup.sql

-- Create gym_accounts table for gym businesses
CREATE TABLE IF NOT EXISTS gym_accounts_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  business_license TEXT,
  verified BOOLEAN DEFAULT FALSE,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_facilities table for gym amenities
CREATE TABLE IF NOT EXISTS gym_facilities_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_hours table for operating hours
CREATE TABLE IF NOT EXISTS gym_hours_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_membership_plans table
CREATE TABLE IF NOT EXISTS gym_membership_plans_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_account_id UUID REFERENCES gym_accounts_gym2024(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'quarterly', 'yearly')),
  description TEXT,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table to include account type
ALTER TABLE profiles_gym2024 ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user', 'gym_owner'));

-- Enable Row Level Security
ALTER TABLE gym_accounts_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_facilities_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_hours_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_membership_plans_gym2024 ENABLE ROW LEVEL SECURITY;

-- Create policies for gym_accounts_gym2024
CREATE POLICY "Users can read verified gym accounts" ON gym_accounts_gym2024 FOR SELECT USING (verified = true);
CREATE POLICY "Gym owners can manage their own accounts" ON gym_accounts_gym2024 FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all gym accounts" ON gym_accounts_gym2024 FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for gym_facilities_gym2024
CREATE POLICY "Anyone can read gym facilities" ON gym_facilities_gym2024 FOR SELECT USING (
  EXISTS (SELECT 1 FROM gym_accounts_gym2024 WHERE id = gym_account_id AND verified = true)
);
CREATE POLICY "Gym owners can manage their facilities" ON gym_facilities_gym2024 FOR ALL USING (
  EXISTS (SELECT 1 FROM gym_accounts_gym2024 WHERE id = gym_account_id AND user_id = auth.uid())
);

-- Create policies for gym_hours_gym2024
CREATE POLICY "Anyone can read gym hours" ON gym_hours_gym2024 FOR SELECT USING (
  EXISTS (SELECT 1 FROM gym_accounts_gym2024 WHERE id = gym_account_id AND verified = true)
);
CREATE POLICY "Gym owners can manage their hours" ON gym_hours_gym2024 FOR ALL USING (
  EXISTS (SELECT 1 FROM gym_accounts_gym2024 WHERE id = gym_account_id AND user_id = auth.uid())
);

-- Create policies for gym_membership_plans_gym2024
CREATE POLICY "Anyone can read active membership plans" ON gym_membership_plans_gym2024 FOR SELECT USING (
  is_active = true AND EXISTS (SELECT 1 FROM gym_accounts_gym2024 WHERE id = gym_account_id AND verified = true)
);
CREATE POLICY "Gym owners can manage their membership plans" ON gym_membership_plans_gym2024 FOR ALL USING (
  EXISTS (SELECT 1 FROM gym_accounts_gym2024 WHERE id = gym_account_id AND user_id = auth.uid())
);

-- Create function to handle gym account creation
CREATE OR REPLACE FUNCTION handle_gym_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile to indicate this is a gym owner
  UPDATE profiles_gym2024 
  SET account_type = 'gym_owner' 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for gym account creation
CREATE TRIGGER on_gym_account_created
  AFTER INSERT ON gym_accounts_gym2024
  FOR EACH ROW EXECUTE FUNCTION handle_gym_signup();

-- Create function to notify admins of new gym signups (for future real-time notifications)
CREATE OR REPLACE FUNCTION notify_admin_gym_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used for real-time notifications
  -- For now, we'll just log the event
  PERFORM pg_notify('gym_signup', json_build_object(
    'gym_account_id', NEW.id,
    'business_name', NEW.business_name,
    'business_email', NEW.business_email,
    'created_at', NEW.created_at
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for gym signup notifications
CREATE TRIGGER on_gym_signup_notification
  AFTER INSERT ON gym_accounts_gym2024
  FOR EACH ROW EXECUTE FUNCTION notify_admin_gym_signup();

-- Insert sample gym facilities
INSERT INTO gym_facilities_gym2024 (gym_account_id, facility_name, description)
SELECT 
  'sample-gym-id'::uuid,
  facility,
  description
FROM (VALUES 
  ('Cardio Equipment', 'Treadmills, ellipticals, stationary bikes'),
  ('Weight Training', 'Free weights, dumbbells, barbells'),
  ('Strength Machines', 'Cable machines, weight machines'),
  ('Group Fitness Studio', 'Space for group classes and training'),
  ('Locker Rooms', 'Men and women locker rooms with showers'),
  ('Sauna', 'Relaxation and recovery facility'),
  ('Swimming Pool', '25-meter lap pool'),
  ('Basketball Court', 'Full-size basketball court'),
  ('Yoga Studio', 'Dedicated space for yoga and meditation'),
  ('Personal Training Area', 'Private area for one-on-one training'),
  ('Functional Training Zone', 'TRX, kettlebells, functional equipment'),
  ('Childcare', 'Supervised childcare during workout hours')
) AS facilities(facility, description)
WHERE NOT EXISTS (SELECT 1 FROM gym_facilities_gym2024 LIMIT 1);