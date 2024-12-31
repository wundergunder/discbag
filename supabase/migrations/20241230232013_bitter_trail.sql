-- Improve profile creation with better error handling and race condition prevention
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

      -- Create profile and storage locations
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

      -- Create storage locations only if profile creation succeeded
      INSERT INTO storage_locations (user_id, name, description)
      VALUES
        (user_id, 'Bag', 'Main disc golf bag'),
        (user_id, 'Home', 'Home storage');

      -- If we get here, everything succeeded
      RETURN;

    EXCEPTION 
      WHEN unique_violation THEN
        -- Check if profile was created in a race condition
        IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
          RETURN;
        END IF;
        
        -- If we haven't exceeded max retries, continue to next iteration
        IF current_try < max_retries THEN
          CONTINUE;
        END IF;
        
        RAISE EXCEPTION 'Failed to create profile after % attempts', max_retries;
        
      WHEN OTHERS THEN
        -- If we haven't exceeded max retries, continue to next iteration
        IF current_try < max_retries THEN
          CONTINUE;
        END IF;
        
        RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;

-- Add index to improve username uniqueness checks
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);