import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  created_at: string;
  is_pro: boolean;
  last_login?: string;
  daily_queries: number;
  last_query_date?: string;
  preferred_payment?: string;
};

export type ChatSession = {
  id: string;
  user_id: string;
  user_input: string;
  ai_raw_response?: string;
  title: string;
  created_at: string;
};

export type FlashcardSet = {
  id: string;
  chat_session_id: string;
  title: string;
  created_at: string;
};

export type Flashcard = {
  id: string;
  set_id: string;
  question: string;
  answer: string;
  created_at: string;
};