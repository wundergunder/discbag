-- Drop existing function if it exists
DROP FUNCTION IF EXISTS ensure_profile_exists(uuid, text);

-- Create improved ensure_profile_exists function
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Validate inputs
  IF user_id IS NULL OR user_email IS NULL THEN
    RAISE EXCEPTION 'user_id and user_email are required';
  END IF;

  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN;
  END IF;

  -- Generate unique username
  base_username := split_part(user_email, '@', 1);
  final_username := base_username;
  
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  -- Create profile and storage locations in a transaction
  BEGIN
    -- Create profile
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
    );

    -- Create default storage locations
    INSERT INTO storage_locations (user_id, name, description)
    VALUES
      (user_id, 'Bag', 'Main disc golf bag'),
      (user_id, 'Home', 'Home storage');

    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read any profile" ON profiles;
CREATE POLICY "Users can read any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);