/*
  # AI StudyBuddy Database Schema

  1. New Tables
    - `profiles` - Extended user profiles with app-specific data
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `is_pro` (boolean, default false)
      - `last_login` (timestamp)
      - `daily_queries` (integer, default 5)
      - `last_query_date` (date)
      - `preferred_payment` (text, nullable)
    
    - `chat_sessions` - Stores AI chat interactions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `user_input` (text, original notes)
      - `ai_raw_response` (text, full AI response)
      - `title` (text, first 50 chars of input)
      - `created_at` (timestamp)
    
    - `flashcard_sets` - Links flashcards to chat sessions
      - `id` (uuid, primary key)
      - `chat_session_id` (uuid, foreign key to chat_sessions)
      - `title` (text)
      - `created_at` (timestamp)
    
    - `flashcards` - Individual flashcard data
      - `id` (uuid, primary key)
      - `set_id` (uuid, foreign key to flashcard_sets)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Secure foreign key relationships
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_pro boolean DEFAULT false,
  last_login timestamptz,
  daily_queries integer DEFAULT 5,
  last_query_date date,
  preferred_payment text
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_input text NOT NULL,
  ai_raw_response text,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create flashcard_sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for chat_sessions
CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for flashcard_sets
CREATE POLICY "Users can read own flashcard sets"
  ON flashcard_sets
  FOR SELECT
  TO authenticated
  USING (
    chat_session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flashcard sets"
  ON flashcard_sets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    chat_session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Create policies for flashcards
CREATE POLICY "Users can read own flashcards"
  ON flashcards
  FOR SELECT
  TO authenticated
  USING (
    set_id IN (
      SELECT fs.id FROM flashcard_sets fs
      JOIN chat_sessions cs ON fs.chat_session_id = cs.id
      WHERE cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flashcards"
  ON flashcards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    set_id IN (
      SELECT fs.id FROM flashcard_sets fs
      JOIN chat_sessions cs ON fs.chat_session_id = cs.id
      WHERE cs.user_id = auth.uid()
    )
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;