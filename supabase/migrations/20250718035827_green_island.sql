-- Memora Database Schema for Supabase
-- This extends the existing faces table with AI-specific fields

-- Update faces table to include AI features
ALTER TABLE faces 
ADD COLUMN IF NOT EXISTS embedding FLOAT8[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS landmark_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS caricature_highlights JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS training_progress JSONB DEFAULT '{}';

-- Create index on embedding for faster similarity searches
CREATE INDEX IF NOT EXISTS faces_embedding_idx ON faces USING GIN (embedding);

-- Create training_sessions table to track detailed training progress
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    face_id UUID REFERENCES faces(id) ON DELETE CASCADE,
    module_type TEXT NOT NULL CHECK (module_type IN ('spacing', 'matching', 'trait_tagging', 'caricature', 'morph')),
    difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    accuracy FLOAT NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
    response_time INTEGER, -- milliseconds
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on training_sessions
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_sessions
CREATE POLICY "Users can manage own training sessions"
    ON training_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create face_recognition_logs table for scan history
CREATE TABLE IF NOT EXISTS face_recognition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recognized_face_id UUID REFERENCES faces(id) ON DELETE SET NULL,
    confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    emotion_detected TEXT,
    scan_location TEXT, -- optional location context
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on face_recognition_logs
ALTER TABLE face_recognition_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for face_recognition_logs
CREATE POLICY "Users can manage own recognition logs"
    ON face_recognition_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to calculate training statistics
CREATE OR REPLACE FUNCTION get_training_stats(p_user_id UUID, p_module_type TEXT DEFAULT NULL)
RETURNS TABLE (
    module_type TEXT,
    avg_accuracy FLOAT,
    current_level INTEGER,
    total_sessions INTEGER,
    last_session TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.module_type,
        AVG(ts.accuracy)::FLOAT as avg_accuracy,
        MAX(ts.difficulty_level) as current_level,
        COUNT(*)::INTEGER as total_sessions,
        MAX(ts.created_at) as last_session
    FROM training_sessions ts
    WHERE ts.user_id = p_user_id
    AND (p_module_type IS NULL OR ts.module_type = p_module_type)
    GROUP BY ts.module_type
    ORDER BY ts.module_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get adaptive difficulty recommendation
CREATE OR REPLACE FUNCTION get_next_difficulty(
    p_user_id UUID, 
    p_face_id UUID, 
    p_module_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
    recent_accuracy FLOAT;
    current_level INTEGER;
    next_level INTEGER;
BEGIN
    -- Get recent performance (last 5 sessions)
    SELECT 
        AVG(accuracy),
        MAX(difficulty_level)
    INTO recent_accuracy, current_level
    FROM (
        SELECT accuracy, difficulty_level
        FROM training_sessions
        WHERE user_id = p_user_id 
        AND face_id = p_face_id 
        AND module_type = p_module_type
        ORDER BY created_at DESC
        LIMIT 5
    ) recent_sessions;
    
    -- Default values if no history
    recent_accuracy := COALESCE(recent_accuracy, 0.5);
    current_level := COALESCE(current_level, 1);
    
    -- Calculate next difficulty level
    IF recent_accuracy >= 0.9 THEN
        next_level := LEAST(current_level + 1, 5);
    ELSIF recent_accuracy < 0.7 THEN
        next_level := GREATEST(current_level - 1, 1);
    ELSE
        next_level := current_level;
    END IF;
    
    RETURN next_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS training_sessions_user_module_idx ON training_sessions(user_id, module_type);
CREATE INDEX IF NOT EXISTS training_sessions_face_module_idx ON training_sessions(face_id, module_type);
CREATE INDEX IF NOT EXISTS face_recognition_logs_user_idx ON face_recognition_logs(user_id);
CREATE INDEX IF NOT EXISTS face_recognition_logs_created_at_idx ON face_recognition_logs(created_at);

-- Update existing faces table comment
COMMENT ON TABLE faces IS 'Stores face data with AI embeddings and training progress for prosopagnosia assistance';
COMMENT ON COLUMN faces.embedding IS 'Face embedding vector for similarity matching (128-dimensional)';
COMMENT ON COLUMN faces.landmark_data IS 'Facial landmark coordinates and metadata';
COMMENT ON COLUMN faces.caricature_highlights IS 'Distinctive feature highlights for caricature generation';
COMMENT ON COLUMN faces.training_progress IS 'Per-module training progress and statistics';

-- Add comments for new tables
COMMENT ON TABLE training_sessions IS 'Individual training session records with performance metrics';
COMMENT ON TABLE face_recognition_logs IS 'Real-time face recognition scan history and results';