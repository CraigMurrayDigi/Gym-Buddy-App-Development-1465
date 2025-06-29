-- Ensure all required tables exist with correct structure

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles_gym2024 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  gym TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  account_type TEXT DEFAULT 'user' CHECK (account_type IN ('user', 'gym_owner', 'personal_trainer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles_gym2024 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles_gym2024;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles_gym2024;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles_gym2024;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles_gym2024;

-- Create comprehensive policies
CREATE POLICY "Users can read all profiles" ON profiles_gym2024
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles_gym2024
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles_gym2024
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles_gym2024
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles_gym2024 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_gym2024 (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the table
SELECT 'profiles_gym2024 table is ready!' as status;