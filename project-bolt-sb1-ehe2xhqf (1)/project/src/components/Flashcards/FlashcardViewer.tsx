import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Home, Brain } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Flashcard, FlashcardSet, ChatSession } from '../../lib/supabase';

export default function FlashcardViewer() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (setId) {
      fetchFlashcardData();
    }
  }, [setId]);

  const fetchFlashcardData = async () => {
    try {
      // Fetch flashcard set with chat session info
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          chat_sessions (*)
        `)
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      
      setFlashcardSet(setData);
      setChatSession(setData.chat_sessions);

      // Fetch flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at');

      if (cardsError) throw cardsError;
      setFlashcards(cardsData || []);
    } catch (error) {
      console.error('Error fetching flashcard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No flashcards found</h2>
          <p className="text-gray-600 mb-6">This set doesn't contain any flashcards.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Home className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{flashcardSet?.title}</h1>
                <p className="text-sm text-gray-600">
                  Card {currentIndex + 1} of {flashcards.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl h-80">
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={flipCard}
            >
              {/* Front of card */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 backface-hidden p-8 flex flex-col justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Question</h3>
                  <p className="text-xl font-bold text-gray-900 leading-relaxed">
                    {currentCard.question}
                  </p>
                  <div className="mt-6 text-sm text-gray-500">
                    Click to reveal answer
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl border border-gray-200 backface-hidden rotate-y-180 p-8 flex flex-col justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-blue-100 mb-4">Answer</h3>
                  <p className="text-xl font-bold text-white leading-relaxed">
                    {currentCard.answer}
                  </p>
                  <div className="mt-6 text-sm text-blue-200">
                    Click to see question
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-6">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={flipCard}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Flip card"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Card indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {flashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}