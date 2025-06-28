-- Trainer Availability Database Schema
-- Add this to your existing Supabase database

-- Create personal trainers table if it doesn't exist
CREATE TABLE IF NOT EXISTS personal_trainers_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  phone TEXT,
  website TEXT,
  instagram TEXT,
  location TEXT,
  gym_affiliations TEXT[] DEFAULT '{}',
  services_offered TEXT[] DEFAULT '{}',
  is_accepting_clients BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainer availability table
CREATE TABLE IF NOT EXISTS trainer_availability_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES personal_trainers_gym2024(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, day_of_week, start_time, end_time)
);

-- Create trainer bookings table
CREATE TABLE IF NOT EXISTS trainer_bookings_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES personal_trainers_gym2024(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  total_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainer reviews table
CREATE TABLE IF NOT EXISTS trainer_reviews_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES personal_trainers_gym2024(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES trainer_bookings_gym2024(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE personal_trainers_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_availability_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_bookings_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_reviews_gym2024 ENABLE ROW LEVEL SECURITY;

-- Personal Trainers Policies
CREATE POLICY "Anyone can read verified trainers" ON personal_trainers_gym2024 
FOR SELECT USING (verified = true);

CREATE POLICY "Trainers can manage their own profile" ON personal_trainers_gym2024 
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all trainer profiles" ON personal_trainers_gym2024 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);

-- Trainer Availability Policies
CREATE POLICY "Anyone can read trainer availability" ON trainer_availability_gym2024 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM personal_trainers_gym2024 WHERE id = trainer_id AND verified = true)
);

CREATE POLICY "Trainers can manage their own availability" ON trainer_availability_gym2024 
FOR ALL USING (
  EXISTS (SELECT 1 FROM personal_trainers_gym2024 WHERE id = trainer_id AND user_id = auth.uid())
);

-- Trainer Bookings Policies
CREATE POLICY "Users can view their own bookings" ON trainer_bookings_gym2024 
FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Trainers can view their bookings" ON trainer_bookings_gym2024 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM personal_trainers_gym2024 WHERE id = trainer_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create bookings" ON trainer_bookings_gym2024 
FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Trainers can update their bookings" ON trainer_bookings_gym2024 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM personal_trainers_gym2024 WHERE id = trainer_id AND user_id = auth.uid())
);

-- Trainer Reviews Policies
CREATE POLICY "Anyone can read reviews" ON trainer_reviews_gym2024 
FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for their bookings" ON trainer_reviews_gym2024 
FOR INSERT WITH CHECK (
  client_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM trainer_bookings_gym2024 
    WHERE id = booking_id AND client_id = auth.uid() AND status = 'completed'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer_day ON trainer_availability_gym2024(trainer_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_trainer_bookings_trainer_date ON trainer_bookings_gym2024(trainer_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_trainer_bookings_client ON trainer_bookings_gym2024(client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_reviews_trainer ON trainer_reviews_gym2024(trainer_id);

-- Create function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_trainer_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trainer_bookings_gym2024
    WHERE trainer_id = p_trainer_id
    AND booking_date = p_booking_date
    AND status IN ('confirmed', 'pending')
    AND (p_booking_id IS NULL OR id != p_booking_id)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get trainer availability for a specific date
CREATE OR REPLACE FUNCTION get_trainer_availability_for_date(
  p_trainer_id UUID,
  p_date DATE
) RETURNS TABLE (
  availability_id UUID,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN,
  is_booked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id as availability_id,
    ta.start_time,
    ta.end_time,
    ta.is_available,
    EXISTS (
      SELECT 1 FROM trainer_bookings_gym2024 tb
      WHERE tb.trainer_id = p_trainer_id
      AND tb.booking_date = p_date
      AND tb.start_time = ta.start_time
      AND tb.end_time = ta.end_time
      AND tb.status IN ('confirmed', 'pending')
    ) as is_booked
  FROM trainer_availability_gym2024 ta
  WHERE ta.trainer_id = p_trainer_id
  AND ta.day_of_week = EXTRACT(DOW FROM p_date)
  ORDER BY ta.start_time;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate trainer rating
CREATE OR REPLACE FUNCTION calculate_trainer_rating(p_trainer_id UUID)
RETURNS TABLE (
  average_rating DECIMAL(3,2),
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating::DECIMAL), 0.0)::DECIMAL(3,2) as average_rating,
    COUNT(*)::INTEGER as review_count
  FROM trainer_reviews_gym2024
  WHERE trainer_id = p_trainer_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample trainer data (optional)
INSERT INTO personal_trainers_gym2024 (
  user_id, business_name, bio, specializations, certifications, 
  experience_years, hourly_rate, location, services_offered, verified
) VALUES (
  'demo-trainer-12345',
  'FitLife Training',
  'Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals.',
  ARRAY['Weight Loss', 'Strength Training', 'Nutrition Coaching'],
  ARRAY['NASM-CPT', 'CSCS', 'Precision Nutrition'],
  8,
  85.00,
  'New York',
  ARRAY['Personal Training', 'Nutrition Coaching', 'Group Training'],
  false
) ON CONFLICT DO NOTHING;

-- Insert sample availability (Monday to Friday, 6 AM to 8 PM)
DO $$
DECLARE
  trainer_record RECORD;
  day_num INTEGER;
  hour_num INTEGER;
BEGIN
  FOR trainer_record IN 
    SELECT id FROM personal_trainers_gym2024 
    WHERE user_id = 'demo-trainer-12345'
  LOOP
    FOR day_num IN 1..5 LOOP  -- Monday to Friday
      FOR hour_num IN 6..19 LOOP  -- 6 AM to 7 PM (end time 8 PM)
        INSERT INTO trainer_availability_gym2024 (
          trainer_id, day_of_week, start_time, end_time, is_available
        ) VALUES (
          trainer_record.id,
          day_num,
          (hour_num || ':00:00')::TIME,
          ((hour_num + 1) || ':00:00')::TIME,
          true
        ) ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;