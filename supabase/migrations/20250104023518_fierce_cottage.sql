/*
  # Fix disc condition column

  1. Changes
    - Rename 'condition' column to 'disc_condition' in user_discs table to match enum type
    - Update existing RLS policies to use new column name
*/

-- Rename the column
ALTER TABLE user_discs 
RENAME COLUMN condition TO disc_condition;