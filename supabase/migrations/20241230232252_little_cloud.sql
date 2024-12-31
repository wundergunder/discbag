-- Add better error handling and validation to ensure_profile_exists
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
  max_retries constant integer := 3;
  current_try integer := 0;
  lock_key text;
BEGIN
  -- Input validation
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'user_email cannot be null or empty';
  END IF;

  -- Early return if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN;
  END IF;

  -- Use advisory lock to prevent race conditions
  lock_key := 'profile_creation_' || user_id::text;
  IF NOT pg_try_advisory_xact_lock(hashtext(lock_key)) THEN
    RAISE EXCEPTION 'Could not acquire lock for profile creation';
  END IF;

  -- Generate unique username with retry logic
  LOOP
    current_try := current_try + 1;
    
    BEGIN
      -- Generate username
      base_username := split_part(user_email, '@', 1);
      final_username := base_username;
      
      WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || counter::text;
        
        IF counter > 100 THEN
          RAISE EXCEPTION 'Could not generate unique username';
        END IF;
      END LOOP;

      -- Create profile and storage locations in a transaction
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

      INSERT INTO storage_locations (user_id, name, description)
      VALUES
        (user_id, 'Bag', 'Main disc golf bag'),
        (user_id, 'Home', 'Home storage');

      RETURN;

    EXCEPTION 
      WHEN unique_violation THEN
        -- Check if profile was created in a race condition
        IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
          RETURN;
        END IF;
        
        IF current_try < max_retries THEN
          PERFORM pg_sleep(0.1 * current_try); -- Add delay between retries
          CONTINUE;
        END IF;
        
        RAISE EXCEPTION 'Failed to create profile after % attempts', max_retries;
        
      WHEN OTHERS THEN
        IF current_try < max_retries THEN
          PERFORM pg_sleep(0.1 * current_try);
          CONTINUE;
        END IF;
        
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions and indexes
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);