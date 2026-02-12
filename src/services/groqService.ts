import axios from 'axios';

// GROQ API Configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithGroq(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    // Filter and prepare messages for GROQ API (exclude initial greeting and only keep actual conversation)
    const filteredHistory = conversationHistory
      .slice(1) // Skip the first assistant greeting message
      .slice(-8) // Keep last 8 messages for context
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const messages = [
      {
        role: 'system' as const,
        content: 'You are THE SUBH AI, an intelligent and helpful AI assistant. You are friendly, knowledgeable, and provide clear and concise answers. Always be respectful and professional.',
      },
      ...filteredHistory,
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    console.log('Sending to GROQ:', { model: 'llama-3.3-70b-versatile', messageCount: messages.length });

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Using Llama model from GROQ
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    return aiResponse;
  } catch (error) {
    console.error('GROQ API Error:', error);
    
    // Log detailed error information
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        return 'API authentication failed. Please check your GROQ API key.';
      } else if (error.response?.status === 429) {
        return 'Rate limit exceeded. Please try again in a moment.';
      } else if (error.response?.status === 400) {
        return 'Invalid request format. Please try a different question.';
      }
    }
    
    return "I'm having trouble connecting to my AI service right now. Please try again later.";
  }
}