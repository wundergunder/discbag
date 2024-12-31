/*
  # Fix profile policies

  1. Changes
    - Remove recursive admin policy
    - Simplify profile access policies
    - Add proper policy for profile creation

  2. Security
    - Users can read public profiles
    - Users can read their own profile
    - Users can update their own profile
    - New users can create their profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can read public profiles"
  ON profiles FOR SELECT
  USING (inventory_visibility = 'public'::visibility_type);

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);