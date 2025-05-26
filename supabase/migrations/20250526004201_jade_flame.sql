/*
  # Add INSERT policies for suggestions table

  1. Security Changes
    - Add INSERT policy for anonymous users to create suggestions for their tokens
    - Add INSERT policy for authenticated users to create suggestions for their tokens

  2. Changes
    - Adds two new RLS policies to maintain data isolation between users
*/

-- Policy for anonymous users to create suggestions for their tokens
CREATE POLICY "Anonymous users can create suggestions"
ON suggestions
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tokens
    JOIN sessions ON tokens.session_id = sessions.id
    WHERE tokens.id = suggestions.token_id
    AND sessions.user_id IS NULL
  )
);

-- Policy for authenticated users to create suggestions for their tokens
CREATE POLICY "Users can create suggestions"
ON suggestions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM tokens
    JOIN sessions ON tokens.session_id = sessions.id
    WHERE tokens.id = suggestions.token_id
    AND sessions.user_id = auth.uid()
  )
);