/*
  # Fix disc condition enum and column with default value

  1. Changes
    - Drop and recreate disc_condition enum type with correct values
    - Add disc_condition column with default value 'new'
    - Set NOT NULL constraint after setting default value
*/

-- Drop the existing enum type (cascade will handle dependent objects)
DROP TYPE IF EXISTS disc_condition CASCADE;

-- Create the enum type with correct values
CREATE TYPE disc_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- Add the column with a default value
ALTER TABLE user_discs
ADD COLUMN disc_condition disc_condition DEFAULT 'new';

-- Update any existing NULL values
UPDATE user_discs
SET disc_condition = 'new'
WHERE disc_condition IS NULL;

-- Now we can safely set NOT NULL constraint
ALTER TABLE user_discs
ALTER COLUMN disc_condition SET NOT NULL;