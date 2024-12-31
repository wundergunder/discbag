/*
  # Add profile creation trigger

  1. Changes
    - Add trigger to create profile on user signup
    - Set default username to user's email
    - Set default visibility to private

  2. Security
    - Profile is automatically created with user's auth data
    - Ensures every user has a profile
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    email,
    inventory_visibility,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email, -- Use email as initial username
    NEW.email,
    'private',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();