const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestBody {
  chat_session_id: string;
  user_input: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { chat_session_id, user_input }: RequestBody = await req.json();

    // Simulate AI response (in production, you'd call Hugging Face API here)
    const mockAIResponse = generateMockFlashcards(user_input);
    
    // Parse the AI response
    const flashcards = parseAIResponse(mockAIResponse);
    
    // Update chat session with AI response
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({ ai_raw_response: mockAIResponse })
      .eq('id', chat_session_id);

    if (updateError) throw updateError;

    // Create flashcard set
    const { data: flashcardSet, error: setError } = await supabaseAdmin
      .from('flashcard_sets')
      .insert({
        chat_session_id: chat_session_id,
        title: `Flashcards: ${user_input.substring(0, 30)}...`,
      })
      .select()
      .single();

    if (setError) throw setError;

    // Insert flashcards
    const flashcardData = flashcards.map(card => ({
      set_id: flashcardSet.id,
      question: card.question,
      answer: card.answer,
    }));

    const { error: cardsError } = await supabaseAdmin
      .from('flashcards')
      .insert(flashcardData);

    if (cardsError) throw cardsError;

    return new Response(
      JSON.stringify({
        success: true,
        flashcard_set_id: flashcardSet.id,
        flashcards_count: flashcards.length,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error generating flashcards:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate flashcards',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

function generateMockFlashcards(input: string): string {
  // This simulates the Hugging Face API response
  // In production, you'd make an actual API call here
  return `Q1: What is the main topic of these notes? A1: ${input.split(' ').slice(0, 5).join(' ')}
Q2: What are the key concepts mentioned? A2: The main concepts include studying and learning principles.
Q3: How can this information be applied? A3: This can be applied through consistent practice and review.
Q4: What is the most important takeaway? A4: Understanding the fundamentals is crucial for mastery.
Q5: What should be remembered for future reference? A5: Regular review and practice are essential for retention.`;
}

function parseAIResponse(response: string) {
  const flashcards = [];
  const lines = response.split('\n');
  
  let currentQuestion = '';
  let currentAnswer = '';
  
  for (const line of lines) {
    if (line.startsWith('Q') && line.includes(':')) {
      if (currentQuestion && currentAnswer) {
        flashcards.push({ question: currentQuestion, answer: currentAnswer });
      }
      currentQuestion = line.split(':').slice(1).join(':').trim();
      currentAnswer = '';
    } else if (line.startsWith('A') && line.includes(':')) {
      currentAnswer = line.split(':').slice(1).join(':').trim();
    }
  }
  
  if (currentQuestion && currentAnswer) {
    flashcards.push({ question: currentQuestion, answer: currentAnswer });
  }
  
  return flashcards;
}

// Initialize Supabase client for server-side operations
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);