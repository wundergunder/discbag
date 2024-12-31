/*
  # Add disc image URLs

  1. Changes
    - Add front_url and back_url columns to user_discs table for storing disc images
    - Create and configure storage bucket for disc images
  
  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to manage their disc images
*/

-- Add image URL columns to user_discs
ALTER TABLE user_discs 
ADD COLUMN IF NOT EXISTS front_url text,
ADD COLUMN IF NOT EXISTS back_url text;

-- Create storage bucket for disc images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('disc-images', 'disc-images', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- Create storage policies
CREATE POLICY "Users can upload their own disc images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'disc-images' AND
  (auth.uid())::text = SPLIT_PART(name, '/', 1)
);

CREATE POLICY "Users can update their own disc images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'disc-images' AND
  (auth.uid())::text = SPLIT_PART(name, '/', 1)
);

CREATE POLICY "Users can read any disc image"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'disc-images');

CREATE POLICY "Users can delete their own disc images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'disc-images' AND
  (auth.uid())::text = SPLIT_PART(name, '/', 1)
);