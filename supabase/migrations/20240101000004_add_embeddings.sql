-- Migration: 004_add_embeddings
-- Description: Add vector embeddings for fashion compatibility using pgvector

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to wardrobe_items (64-dimensional embedding from fashion-compatibility model)
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS embedding vector(64);

-- Create index for fast similarity search using cosine distance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_embedding 
ON wardrobe_items USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create a table for debug embeddings (unassociated with users, for testing)
CREATE TABLE IF NOT EXISTS debug_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    embedding vector(64) NOT NULL,
    filename VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for debug embeddings
CREATE INDEX IF NOT EXISTS idx_debug_embeddings_embedding 
ON debug_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to calculate cosine similarity between two embeddings
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float AS $$
BEGIN
    RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find similar items based on embedding
CREATE OR REPLACE FUNCTION find_similar_items(
    target_embedding vector(64),
    limit_count integer DEFAULT 10,
    exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
    item_id UUID,
    image_url TEXT,
    category item_category,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wi.id as item_id,
        wi.image_url,
        wi.category,
        1 - (wi.embedding <=> target_embedding) as similarity
    FROM wardrobe_items wi
    WHERE wi.embedding IS NOT NULL
      AND (exclude_id IS NULL OR wi.id != exclude_id)
    ORDER BY wi.embedding <=> target_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find similar debug embeddings
CREATE OR REPLACE FUNCTION find_similar_debug_embeddings(
    target_embedding vector(64),
    limit_count integer DEFAULT 10,
    exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
    embedding_id UUID,
    image_url TEXT,
    filename VARCHAR,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.id as embedding_id,
        de.image_url,
        de.filename,
        1 - (de.embedding <=> target_embedding) as similarity
    FROM debug_embeddings de
    WHERE (exclude_id IS NULL OR de.id != exclude_id)
    ORDER BY de.embedding <=> target_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Policy for debug_embeddings (public access for debugging)
-- Note: In production, you'd want to restrict this
ALTER TABLE debug_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users on debug table
CREATE POLICY "Authenticated users can manage debug embeddings" ON debug_embeddings
    FOR ALL USING (true) WITH CHECK (true);
