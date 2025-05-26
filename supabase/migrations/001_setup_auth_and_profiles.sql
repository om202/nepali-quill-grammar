-- Create profiles table that references auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update sessions table to have better RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
-- Allow anyone to create sessions (for anonymous users)
CREATE POLICY "Anyone can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

-- Users can view sessions they created or anonymous sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (
    user_id IS NULL OR 
    auth.uid() = user_id
  );

-- Users can update sessions they created
CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (
    user_id IS NULL OR 
    auth.uid() = user_id
  );

-- Enable RLS on other tables
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- Tokens policies (inherit from sessions)
CREATE POLICY "Users can view tokens from their sessions" ON public.tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = tokens.session_id 
      AND (sessions.user_id IS NULL OR sessions.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert tokens to their sessions" ON public.tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = tokens.session_id 
      AND (sessions.user_id IS NULL OR sessions.user_id = auth.uid())
    )
  );

-- Suggestions policies (inherit from tokens)
CREATE POLICY "Users can view suggestions from their tokens" ON public.suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tokens 
      JOIN public.sessions ON sessions.id = tokens.session_id
      WHERE tokens.id = suggestions.token_id 
      AND (sessions.user_id IS NULL OR sessions.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert suggestions to their tokens" ON public.suggestions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tokens 
      JOIN public.sessions ON sessions.id = tokens.session_id
      WHERE tokens.id = suggestions.token_id 
      AND (sessions.user_id IS NULL OR sessions.user_id = auth.uid())
    )
  );

-- Actions policies (inherit from suggestions)
CREATE POLICY "Users can view actions from their suggestions" ON public.actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.suggestions 
      JOIN public.tokens ON tokens.id = suggestions.token_id
      JOIN public.sessions ON sessions.id = tokens.session_id
      WHERE suggestions.id = actions.suggestion_id 
      AND (sessions.user_id IS NULL OR sessions.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert actions to their suggestions" ON public.actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.suggestions 
      JOIN public.tokens ON tokens.id = suggestions.token_id
      JOIN public.sessions ON sessions.id = tokens.session_id
      WHERE suggestions.id = actions.suggestion_id 
      AND (sessions.user_id IS NULL OR sessions.user_id = auth.uid())
    )
  ); 