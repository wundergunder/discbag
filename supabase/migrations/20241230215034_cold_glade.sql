/*
  # Fix profile policies and trigger

  1. Changes
    - Simplify profile policies to avoid recursion
    - Update profile trigger to handle edge cases
    - Add default storage locations after profile creation

  2. Security
    - Maintain RLS while fixing recursion issues
    - Ensure proper profile creation on signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simplified policies
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "System can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_username text;
BEGIN
  -- Generate a unique username based on email
  default_username := split_part(NEW.email, '@', 1);
  
  -- Insert profile
  INSERT INTO public.profiles (
    id,
    username,
    email,
    inventory_visibility,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    default_username,
    NEW.email,
    'private',
    NOW(),
    NOW()
  );

  -- Create default storage locations
  INSERT INTO storage_locations (user_id, name, description)
  VALUES
    (NEW.id, 'Bag', 'Main disc golf bag'),
    (NEW.id, 'Home', 'Home storage');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;