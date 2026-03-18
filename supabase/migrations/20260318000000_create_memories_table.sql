-- Phase 1: Persistent Memory via pgvector
-- pgvector extension is already enabled in the public schema on this project.
-- This migration drops the legacy (empty) memories table and recreates it
-- with the correct schema for vector-backed memory storage.

DROP TABLE IF EXISTS memories CASCADE;

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX memories_user_id_idx ON memories(user_id);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own memories" ON memories
  FOR ALL USING (auth.uid() = user_id);
