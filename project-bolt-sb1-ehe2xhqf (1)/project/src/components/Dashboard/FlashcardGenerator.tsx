import React, { useState } from 'react';
import { Sparkles, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface FlashcardGeneratorProps {
  onSuccess: () => void;
}

export default function FlashcardGenerator({ onSuccess }: FlashcardGeneratorProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const checkDailyLimit = () => {
    if (!profile) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const lastQueryDate = profile.last_query_date;
    
    // Reset daily queries if it's a new day
    if (lastQueryDate !== today) {
      updateProfile({ 
        daily_queries: profile.is_pro ? 5 : 5, 
        last_query_date: today 
      });
      return true;
    }
    
    return profile.is_pro || profile.daily_queries > 0;
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some text to generate flashcards');
      return;
    }

    if (!checkDailyLimit()) {
      setError('Daily limit reached. Upgrade to Pro for unlimited generations!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create chat session first
      const title = input.substring(0, 50) + (input.length > 50 ? '...' : '');
      
      const { data: chatSession, error: chatError } = await supabase
        .from('chat_sessions')
        .insert({
          user_input: input,
          title: title,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Call the edge function to generate flashcards
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_session_id: chatSession.id,
          user_input: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const result = await response.json();

      // Update daily queries for non-pro users
      if (!profile?.is_pro && profile) {
        await updateProfile({
          daily_queries: Math.max(0, profile.daily_queries - 1),
          last_query_date: new Date().toISOString().split('T')[0],
        });
      }

      // Navigate to the flashcard set
      navigate(`/set/${result.flashcard_set_id}`);
      onSuccess();

    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Generate Flashcards</h3>
          <p className="text-gray-600">Transform your notes into interactive flashcards</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Your Study Notes
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              id="notes"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your study notes here... The AI will generate flashcards based on the key concepts."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={6}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Pro tip: Include key concepts, definitions, and important facts for best results
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Flashcards</span>
            </>
          )}
        </button>

        {!profile?.is_pro && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {profile?.daily_queries || 0} generations remaining today
            </p>
            <button
              onClick={() => navigate('/upgrade')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Upgrade to Pro for unlimited generations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}