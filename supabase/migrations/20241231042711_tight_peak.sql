-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS ensure_profile_exists(uuid, text) CASCADE;

-- Create new handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Generate sanitized username
  base_username := regexp_replace(
    split_part(lower(NEW.email), '@', 1),
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
      RAISE EXCEPTION 'Could not generate unique username';
    END IF;
    final_username := base_username || counter::text;
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
    NEW.id,
    final_username,
    lower(NEW.email),
    'private',
    now(),
    now()
  );

  -- Create storage locations
  INSERT INTO storage_locations (user_id, name, description)
  VALUES
    (NEW.id, 'Bag', 'Main disc golf bag'),
    (NEW.id, 'Home', 'Home storage');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);