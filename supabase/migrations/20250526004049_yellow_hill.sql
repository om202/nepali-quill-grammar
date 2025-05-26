/*
  # Add INSERT policies for tokens table

  1. Changes
    - Add INSERT policy for anonymous users to create tokens for their sessions
    - Add INSERT policy for authenticated users to create tokens for their sessions
    
  2. Security
    - Policies ensure users can only insert tokens for sessions they own
    - Maintains existing security model where session ownership is verified
*/

-- Policy for anonymous users
CREATE POLICY "Anonymous users can create tokens for their sessions"
ON public.tokens
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = tokens.session_id
    AND sessions.user_id IS NULL
  )
);

-- Policy for authenticated users
CREATE POLICY "Users can create tokens for their sessions"
ON public.tokens
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = tokens.session_id
    AND sessions.user_id = auth.uid()
  )
);