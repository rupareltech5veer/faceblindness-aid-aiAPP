/*
  # Add Face Recognition Fields to Connections Table

  1. New Columns
    - `face_embedding` (double precision array) - FaceNet embedding vector
    - `facial_traits` (jsonb) - Analyzed facial measurements and ratios
    - `trait_descriptions` (text array) - Human-readable trait descriptions
    - `landmark_data` (jsonb) - MediaPipe facial landmark coordinates

  2. Indexes
    - Add GIN index on face_embedding for similarity searches
    - Add GIN index on facial_traits for trait-based queries

  3. Security
    - Maintain existing RLS policies
*/

-- Add face recognition columns to connections table
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS face_embedding double precision[],
ADD COLUMN IF NOT EXISTS facial_traits jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS trait_descriptions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS landmark_data jsonb DEFAULT '{}';

-- Create indexes for efficient face matching
CREATE INDEX IF NOT EXISTS connections_face_embedding_idx 
ON connections USING gin (face_embedding);

CREATE INDEX IF NOT EXISTS connections_facial_traits_idx 
ON connections USING gin (facial_traits);

CREATE INDEX IF NOT EXISTS connections_user_embedding_idx 
ON connections (user_id) WHERE face_embedding IS NOT NULL;

-- Add comment explaining the face recognition fields
COMMENT ON COLUMN connections.face_embedding IS 'FaceNet embedding vector (512-dimensional) for face similarity matching';
COMMENT ON COLUMN connections.facial_traits IS 'Analyzed facial measurements and ratios from MediaPipe landmarks';
COMMENT ON COLUMN connections.trait_descriptions IS 'Human-readable descriptions of distinctive facial features';
COMMENT ON COLUMN connections.landmark_data IS 'MediaPipe facial landmark coordinates and metadata';