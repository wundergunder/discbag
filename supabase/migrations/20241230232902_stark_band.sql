-- Drop existing function
DROP FUNCTION IF EXISTS ensure_profile_exists(uuid, text);

-- Create improved profile creation function
CREATE FUNCTION ensure_profile_exists(user_id uuid, user_email text)
RETURNS jsonb AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Input validation
  IF user_id IS NULL OR user_email IS NULL OR user_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid input parameters');
  END IF;

  -- Early success if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  -- Use transaction for atomicity
  BEGIN
    -- Lock to prevent race conditions
    PERFORM pg_advisory_xact_lock(hashtext('profile_' || user_id::text));
    
    -- Double check after lock
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
      RETURN jsonb_build_object('success', true);
    END IF;

    -- Generate sanitized username
    base_username := regexp_replace(
      split_part(lower(user_email), '@', 1),
      '[^a-z0-9]',
      '',
      'g'
    );
    
    -- Ensure minimum length
    IF length(base_username) < 3 THEN
      base_username := base_username || 'user';
    END IF;
    
    -- Find unique username
    final_username := base_username;
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
      counter := counter + 1;
      IF counter > 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Could not generate unique username');
      END IF;
      final_username := base_username || counter::text;
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
      lower(user_email),
      'private',
      now(),
      now()
    );

    INSERT INTO storage_locations (user_id, name, description)
    VALUES
      (user_id, 'Bag', 'Main disc golf bag'),
      (user_id, 'Home', 'Home storage');

    RETURN jsonb_build_object('success', true);

  EXCEPTION 
    WHEN unique_violation THEN
      IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RETURN jsonb_build_object('success', true);
      END IF;
      RETURN jsonb_build_object('success', false, 'error', 'Profile creation failed: unique violation');
    WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', 'Profile creation failed: ' || SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper permissions and indexes
GRANT EXECUTE ON FUNCTION ensure_profile_exists TO authenticated;
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);