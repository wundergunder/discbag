/*
  # Fix disc condition enum and column

  1. Changes
    - Drop and recreate disc_condition enum type with correct values
    - Update user_discs table structure with correct column name
*/

-- Drop the existing enum type (cascade will handle dependent objects)
DROP TYPE IF EXISTS disc_condition CASCADE;

-- Create the enum type with correct values
CREATE TYPE disc_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- Alter the table to use the new enum type
ALTER TABLE user_discs
ADD COLUMN disc_condition disc_condition;

-- Make the column not null
ALTER TABLE user_discs
ALTER COLUMN disc_condition SET NOT NULL;