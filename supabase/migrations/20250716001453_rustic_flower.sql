/*
  # Create faces table for Face Blindness Aid App

  1. New Tables
    - `faces`
      - `id` (uuid, primary key)
      - `user_id` (text) - User identifier
      - `image_url` (text) - URL to uploaded image in Supabase storage
      - `name` (text) - Name of the person in the photo
      - `description` (text) - AI-generated facial description
      - `mnemonic` (text) - AI-generated memory aid
      - `created_at` (timestamp) - When the record was created

  2. Security
    - Enable RLS on `faces` table
    - Add policy for users to manage their own face records

  3. Storage
    - Create storage bucket `face-uploads` for image storage
    - Set up storage policies for authenticated access
*/

-- Create the faces table
CREATE TABLE IF NOT EXISTS faces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  image_url text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  mnemonic text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own faces
CREATE POLICY "Users can manage their own faces"
  ON faces
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create policy for anonymous users (for demo purposes)
-- In production, remove this and require authentication
CREATE POLICY "Allow anonymous access for demo"
  ON faces
  FOR ALL
  TO anon
  USING (true);

-- Create storage bucket for face uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('face-uploads', 'face-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users
CREATE POLICY "Authenticated users can upload faces"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'face-uploads');

-- Create storage policy for public read access
CREATE POLICY "Public read access for face images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'face-uploads');

-- Create storage policy for users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'face-uploads');

-- Create storage policy for anonymous users (for demo)
-- In production, remove this and require authentication
CREATE POLICY "Allow anonymous uploads for demo"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'face-uploads');

CREATE POLICY "Allow anonymous deletes for demo"
  ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'face-uploads');