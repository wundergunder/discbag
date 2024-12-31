-- Improve profile creation with better transaction handling
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
  max_retries constant integer := 3;
  current_try integer := 0;
BEGIN
  -- Input validation
  IF user_id IS NULL OR user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'Invalid input parameters';
  END IF;

  -- Early return if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN;
  END IF;

  -- Use transaction for atomicity
  BEGIN
    -- Lock the profiles table for this user_id to prevent race conditions
    PERFORM pg_advisory_xact_lock(hashtext('profile_' || user_id::text));
    
    -- Double check if profile was created while waiting for lock
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
      RETURN;
    END IF;

    -- Generate unique username
    base_username := split_part(user_email, '@', 1);
    final_username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
      counter := counter + 1;
      final_username := base_username || counter::text;
      
      IF counter > 100 THEN
        RAISE EXCEPTION 'Could not generate unique username';
      END IF;
    END LOOP;

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

    -- Create storage locations
    INSERT INTO storage_locations (user_id, name, description)
    VALUES
      (user_id, 'Bag', 'Main disc golf bag'),
      (user_id, 'Home', 'Home storage');

    -- If we get here, everything succeeded
    RETURN;
  EXCEPTION 
    WHEN unique_violation THEN
      -- Final check for race condition
      IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RETURN;
      END IF;
      RAISE EXCEPTION 'Profile creation failed: unique violation';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions and indexes
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);