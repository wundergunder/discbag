-- Drop and recreate the ensure_profile_exists function with better error handling
CREATE OR REPLACE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS void AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Check parameters
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'user_email cannot be null';
  END IF;

  -- Only proceed if profile doesn't exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Generate unique username
    base_username := split_part(user_email, '@', 1);
    final_username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
      counter := counter + 1;
      final_username := base_username || counter::text;
    END LOOP;

    -- Insert profile with explicit error handling
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
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
    END;

    -- Create default storage locations
    BEGIN
      INSERT INTO storage_locations (user_id, name, description)
      VALUES
        (user_id, 'Bag', 'Main disc golf bag'),
        (user_id, 'Home', 'Home storage')
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create storage locations: %', SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;