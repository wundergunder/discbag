-- Improve the ensure_profile_exists function with better error handling
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Early return if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN;
  END IF;

  -- Input validation
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'user_email cannot be null or empty';
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

  -- Create profile and storage locations in a single transaction
  BEGIN
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

  EXCEPTION 
    WHEN unique_violation THEN
      -- Handle race condition where profile was created between our check and insert
      IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RETURN;
      ELSE
        RAISE EXCEPTION 'Unique constraint violation while creating profile';
      END IF;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;