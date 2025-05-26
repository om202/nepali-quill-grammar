/*
  # Initial schema for Nepali text enhancement service

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `original_text` (text)
      - `created_at` (timestamp)
    - `tokens`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `text_segment` (text)
      - `start_index` (integer)
      - `end_index` (integer)
    - `suggestions`
      - `id` (uuid, primary key)
      - `token_id` (uuid, foreign key)
      - `suggested_text` (text)
      - `created_at` (timestamp)
    - `actions`
      - `id` (uuid, primary key)
      - `suggestion_id` (uuid, foreign key)
      - `action` (text, enum: 'accept' or 'reject')
      - `performed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for anonymous users to create sessions
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  original_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  text_segment text NOT NULL,
  start_index integer NOT NULL,
  end_index integer NOT NULL,
  CONSTRAINT valid_indices CHECK (start_index < end_index)
);

-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  suggested_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create actions table
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('accept', 'reject')),
  performed_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_tokens_session_id ON tokens(session_id);
CREATE INDEX idx_suggestions_token_id ON suggestions(token_id);
CREATE INDEX idx_actions_suggestion_id ON actions(suggestion_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create sessions"
  ON sessions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Tokens policies
CREATE POLICY "Users can view tokens from their sessions"
  ON tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = tokens.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can view tokens from their sessions"
  ON tokens
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = tokens.session_id
      AND sessions.user_id IS NULL
    )
  );

CREATE POLICY "Service role can insert tokens"
  ON tokens
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Suggestions policies
CREATE POLICY "Users can view suggestions for their tokens"
  ON suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tokens
      JOIN sessions ON tokens.session_id = sessions.id
      WHERE tokens.id = suggestions.token_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can view suggestions for their tokens"
  ON suggestions
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM tokens
      JOIN sessions ON tokens.session_id = sessions.id
      WHERE tokens.id = suggestions.token_id
      AND sessions.user_id IS NULL
    )
  );

CREATE POLICY "Service role can insert suggestions"
  ON suggestions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Actions policies
CREATE POLICY "Users can record actions on their suggestions"
  ON actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suggestions
      JOIN tokens ON suggestions.token_id = tokens.id
      JOIN sessions ON tokens.session_id = sessions.id
      WHERE suggestions.id = actions.suggestion_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can record actions on their suggestions"
  ON actions
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suggestions
      JOIN tokens ON suggestions.token_id = tokens.id
      JOIN sessions ON tokens.session_id = sessions.id
      WHERE suggestions.id = actions.suggestion_id
      AND sessions.user_id IS NULL
    )
  );

CREATE POLICY "Users can view actions on their suggestions"
  ON actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suggestions
      JOIN tokens ON suggestions.token_id = tokens.id
      JOIN sessions ON tokens.session_id = sessions.id
      WHERE suggestions.id = actions.suggestion_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can view actions on their suggestions"
  ON actions
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM suggestions
      JOIN tokens ON suggestions.token_id = tokens.id
      JOIN sessions ON tokens.session_id = sessions.id
      WHERE suggestions.id = actions.suggestion_id
      AND sessions.user_id IS NULL
    )
  );