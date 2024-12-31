/*
  # Fix profile creation and policies

  1. Changes
    - Add ON CONFLICT handling for profile creation
    - Ensure unique username generation
    - Fix storage location creation timing
    - Simplify profile policies

  2. Security
    - Maintain RLS while fixing access issues
    - Ensure proper profile creation on signup
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  username_counter integer := 0;
BEGIN
  -- Generate base username from email
  base_username := split_part(NEW.email, '@', 1);
  final_username := base_username;
  
  -- Handle username conflicts
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    username_counter := username_counter + 1;
    final_username := base_username || username_counter::text;
  END LOOP;

  -- Insert profile with conflict handling
  INSERT INTO public.profiles (
    id,
    username,
    email,
    inventory_visibility,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    final_username,
    NEW.email,
    'private',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default storage locations after ensuring profile exists
  INSERT INTO storage_locations (user_id, name, description)
  VALUES
    (NEW.id, 'Bag', 'Main disc golf bag'),
    (NEW.id, 'Home', 'Home storage')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Recreate simplified policies
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "System can create profiles" ON profiles;

CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow system profile creation"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = profiles.id
  ));