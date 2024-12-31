/*
  # Fix profile policies and triggers

  1. Changes
    - Simplify profile policies
    - Add better error handling for profile creation
    - Ensure atomic profile creation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow system profile creation" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can read any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Only proceed if profile doesn't exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Generate unique username
    base_username := split_part(user_email, '@', 1);
    final_username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
      counter := counter + 1;
      final_username := base_username || counter::text;
    END LOOP;

    -- Insert profile
    INSERT INTO profiles (
      id,
      username,
      email,
      inventory_visibility,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      final_username,
      user_email,
      'private',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create default storage locations
    INSERT INTO storage_locations (user_id, name, description)
    VALUES
      (user_id, 'Bag', 'Main disc golf bag'),
      (user_id, 'Home', 'Home storage')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;