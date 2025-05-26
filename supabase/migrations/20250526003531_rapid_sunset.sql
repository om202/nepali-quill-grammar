/*
  # Add RLS policies for anonymous users
  
  1. Changes
    - Add policy for anonymous users to create sessions (if not exists)
    - Add policy for anonymous users to read their own sessions (if not exists)
  
  2. Security
    - Enables anonymous users to create and read sessions
    - Restricts anonymous users to only read their own sessions (where user_id is NULL)
*/

DO $$ 
BEGIN
  -- Check and create policy for anonymous users to create sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Anonymous users can create sessions'
  ) THEN
    CREATE POLICY "Anonymous users can create sessions"
    ON sessions
    FOR INSERT
    TO anon
    WITH CHECK (true);
  END IF;

  -- Check and create policy for anonymous users to read their sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sessions' 
    AND policyname = 'Anonymous users can read their sessions'
  ) THEN
    CREATE POLICY "Anonymous users can read their sessions"
    ON sessions
    FOR SELECT
    TO anon
    USING (user_id IS NULL);
  END IF;
END $$;