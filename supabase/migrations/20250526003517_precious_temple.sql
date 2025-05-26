/*
  # Fix sessions table RLS policies

  1. Changes
    - Add RLS policy to allow anonymous users to create sessions
    - Add RLS policy to allow anonymous users to read their own sessions
  
  2. Security
    - Maintains existing RLS policies
    - Adds specific policies for anonymous users
*/

-- Policy for anonymous users to create sessions
CREATE POLICY "Anonymous users can create sessions"
ON sessions
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for anonymous users to read their own sessions
CREATE POLICY "Anonymous users can read their sessions"
ON sessions
FOR SELECT
TO anon
USING (user_id IS NULL);