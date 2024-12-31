-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS ensure_profile_exists(uuid, text);
DROP FUNCTION IF EXISTS handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create simplified profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  username text;
  username_counter integer := 0;
BEGIN
  -- Generate username from email
  username := split_part(NEW.email, '@', 1);
  
  -- Find unique username
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = username) LOOP
    username_counter := username_counter + 1;
    username := split_part(NEW.email, '@', 1) || username_counter::text;
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
    username,
    NEW.email,
    'private',
    now(),
    now()
  );

  -- Create default storage locations
  INSERT INTO storage_locations (user_id, name, description)
  VALUES
    (NEW.id, 'Bag', 'Main disc golf bag'),
    (NEW.id, 'Home', 'Home storage');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();