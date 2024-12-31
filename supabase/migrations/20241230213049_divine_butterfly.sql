/*
  # Initial Schema for MyDiscBag.club

  1. New Tables
    - `profiles`
      - User profile information
      - Links to Supabase auth
    - `storage_locations`
      - Disc storage locations for users
    - `disc_manufacturers`
      - List of disc manufacturers
    - `disc_models`
      - Complete database of available disc models
    - `user_discs`
      - User's disc inventory
    - `marketplace_listings`
      - Discs for sale or wanted
    
  2. Security
    - RLS policies for all tables
    - Admin role with full access
    - Member role with restricted access
*/

-- Create custom types
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'friends');
CREATE TYPE listing_type AS ENUM ('for_sale', 'wanted');
CREATE TYPE disc_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  full_name text,
  bio text,
  favorite_disc text,
  favorite_golfer text,
  email text NOT NULL,
  phone text,
  inventory_visibility visibility_type DEFAULT 'private',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage locations table
CREATE TABLE IF NOT EXISTS storage_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create disc manufacturers table
CREATE TABLE IF NOT EXISTS disc_manufacturers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Create disc models table
CREATE TABLE IF NOT EXISTS disc_models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id uuid REFERENCES disc_manufacturers(id),
  name text NOT NULL,
  type text NOT NULL,
  speed numeric(3,1) NOT NULL,
  glide numeric(3,1) NOT NULL,
  turn numeric(3,1) NOT NULL,
  fade numeric(3,1) NOT NULL,
  description text,
  best_for text[],
  retail_price decimal(10,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(manufacturer_id, name)
);

-- Create user discs table
CREATE TABLE IF NOT EXISTS user_discs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  disc_model_id uuid REFERENCES disc_models(id),
  storage_location_id uuid REFERENCES storage_locations(id),
  condition disc_condition NOT NULL,
  weight integer,
  color text,
  personal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  disc_id uuid REFERENCES user_discs(id),
  listing_type listing_type NOT NULL,
  price decimal(10,2),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (inventory_visibility = 'public');

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Storage locations policies
CREATE POLICY "Users can view own storage locations"
  ON storage_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own storage locations"
  ON storage_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage locations"
  ON storage_locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage locations"
  ON storage_locations FOR DELETE
  USING (auth.uid() = user_id);

-- Disc manufacturers policies
CREATE POLICY "Everyone can view manufacturers"
  ON disc_manufacturers FOR SELECT
  TO authenticated
  USING (true);

-- Disc models policies
CREATE POLICY "Everyone can view disc models"
  ON disc_models FOR SELECT
  TO authenticated
  USING (true);

-- User discs policies
CREATE POLICY "Users can view own discs"
  ON user_discs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "View public discs"
  ON user_discs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_discs.user_id
      AND profiles.inventory_visibility = 'public'
    )
  );

CREATE POLICY "Users can create own discs"
  ON user_discs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discs"
  ON user_discs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discs"
  ON user_discs FOR DELETE
  USING (auth.uid() = user_id);

-- Marketplace listings policies
CREATE POLICY "Everyone can view active listings"
  ON marketplace_listings FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create own listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON marketplace_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON marketplace_listings FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins have full access to profiles"
  ON profiles TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert default storage locations function
CREATE OR REPLACE FUNCTION create_default_storage_locations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO storage_locations (user_id, name, description)
  VALUES
    (NEW.id, 'Bag', 'Main disc golf bag'),
    (NEW.id, 'Home', 'Home storage');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default storage locations
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_storage_locations();