-- Gym Buddy Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create locations table
CREATE TABLE IF NOT EXISTS locations_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gyms table
CREATE TABLE IF NOT EXISTS gyms_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_id UUID REFERENCES locations_gym2024(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles_gym2024 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  gym TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT NOT NULL,
  gym TEXT NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout participants table
CREATE TABLE IF NOT EXISTS workout_participants_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts_gym2024(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workout_id, user_id)
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat participants table
CREATE TABLE IF NOT EXISTS chat_participants_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats_gym2024(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats_gym2024(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout media table
CREATE TABLE IF NOT EXISTS workout_media_gym2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles_gym2024(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE locations_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_participants_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_gym2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_media_gym2024 ENABLE ROW LEVEL SECURITY;

-- Create policies for locations_gym2024
CREATE POLICY "Anyone can read locations" ON locations_gym2024 FOR SELECT USING (true);
CREATE POLICY "Only admins can insert locations" ON locations_gym2024 FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update locations" ON locations_gym2024 FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete locations" ON locations_gym2024 FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for gyms_gym2024
CREATE POLICY "Anyone can read gyms" ON gyms_gym2024 FOR SELECT USING (true);
CREATE POLICY "Only admins can insert gyms" ON gyms_gym2024 FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update gyms" ON gyms_gym2024 FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete gyms" ON gyms_gym2024 FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for profiles_gym2024
CREATE POLICY "Users can read all profiles" ON profiles_gym2024 FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles_gym2024 FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles_gym2024 FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles_gym2024 FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles_gym2024 WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for workouts_gym2024
CREATE POLICY "Anyone can read workouts" ON workouts_gym2024 FOR SELECT USING (true);
CREATE POLICY "Users can insert their own workouts" ON workouts_gym2024 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON workouts_gym2024 FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON workouts_gym2024 FOR DELETE USING (auth.uid() = user_id);

-- Create policies for workout_participants_gym2024
CREATE POLICY "Anyone can read workout participants" ON workout_participants_gym2024 FOR SELECT USING (true);
CREATE POLICY "Users can join workouts" ON workout_participants_gym2024 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave workouts they joined" ON workout_participants_gym2024 FOR DELETE USING (auth.uid() = user_id);

-- Create policies for chats_gym2024
CREATE POLICY "Users can read chats they participate in" ON chats_gym2024 FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants_gym2024 WHERE chat_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create chats" ON chats_gym2024 FOR INSERT WITH CHECK (true);

-- Create policies for chat_participants_gym2024
CREATE POLICY "Users can read chat participants for their chats" ON chat_participants_gym2024 FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants_gym2024 WHERE chat_id = chat_participants_gym2024.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can add participants to chats" ON chat_participants_gym2024 FOR INSERT WITH CHECK (true);

-- Create policies for messages_gym2024
CREATE POLICY "Users can read messages from their chats" ON messages_gym2024 FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_participants_gym2024 WHERE chat_id = messages_gym2024.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages to their chats" ON messages_gym2024 FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (SELECT 1 FROM chat_participants_gym2024 WHERE chat_id = messages_gym2024.chat_id AND user_id = auth.uid())
);

-- Create policies for workout_media_gym2024
CREATE POLICY "Anyone can read workout media" ON workout_media_gym2024 FOR SELECT USING (true);
CREATE POLICY "Users can upload their own media" ON workout_media_gym2024 FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own media" ON workout_media_gym2024 FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own media" ON workout_media_gym2024 FOR DELETE USING (auth.uid() = user_id);

-- Insert default locations
INSERT INTO locations_gym2024 (name) VALUES 
  ('New York'),
  ('Los Angeles'),
  ('Chicago'),
  ('Houston'),
  ('Phoenix'),
  ('Philadelphia'),
  ('San Antonio'),
  ('San Diego'),
  ('Dallas'),
  ('San Jose')
ON CONFLICT (name) DO NOTHING;

-- Insert sample gyms for New York
INSERT INTO gyms_gym2024 (name, location_id) 
SELECT 'Fitness First NYC', id FROM locations_gym2024 WHERE name = 'New York'
UNION ALL
SELECT 'Equinox Manhattan', id FROM locations_gym2024 WHERE name = 'New York'
UNION ALL
SELECT 'Planet Fitness Times Square', id FROM locations_gym2024 WHERE name = 'New York'
UNION ALL
SELECT 'Crunch Fitness', id FROM locations_gym2024 WHERE name = 'New York'
UNION ALL
SELECT 'Blink Fitness', id FROM locations_gym2024 WHERE name = 'New York';

-- Insert sample gyms for Los Angeles
INSERT INTO gyms_gym2024 (name, location_id) 
SELECT 'Gold''s Gym Venice', id FROM locations_gym2024 WHERE name = 'Los Angeles'
UNION ALL
SELECT 'Equinox West Hollywood', id FROM locations_gym2024 WHERE name = 'Los Angeles'
UNION ALL
SELECT '24 Hour Fitness', id FROM locations_gym2024 WHERE name = 'Los Angeles'
UNION ALL
SELECT 'LA Fitness', id FROM locations_gym2024 WHERE name = 'Los Angeles'
UNION ALL
SELECT 'Crunch Fitness LA', id FROM locations_gym2024 WHERE name = 'Los Angeles';

-- Create storage bucket for media files (run this separately if needed)
INSERT INTO storage.buckets (id, name, public) VALUES ('gym-buddy-media', 'gym-buddy-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create admin user function (optional - for creating first admin)
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT, user_name TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- This function should be called after a user signs up
  -- to promote them to admin role
  UPDATE profiles_gym2024 
  SET role = 'admin' 
  WHERE email = user_email;
  
  IF FOUND THEN
    RETURN 'User promoted to admin successfully';
  ELSE
    RETURN 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;