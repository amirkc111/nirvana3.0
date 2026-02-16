import { NextResponse } from 'next/server';
import axios from 'axios';

// Ollama AI Chatbot API endpoint
export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 });
    }

    // Generate AI response using Ollama
    const aiResponse = await generateOllamaResponse(message, conversationHistory);

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ollama Chat API Error:', error);
    return NextResponse.json({
      error: 'Failed to process message'
    }, { status: 500 });
  }
}

async function generateOllamaResponse(message, conversationHistory) {
  try {
    // Build conversation context
    const context = buildConversationContext(conversationHistory);

    // Create the enhanced prompt for astrology-focused responses
    const prompt = `You are a Nirvana Astro astrology expert. Provide authentic guidance based on traditional Jyotish principles.

**EXPERTISE:**
- Brihat Parashara Hora Shastra, Brihat Jataka, Saravali
- Navagrahas, Nakshatras, Dasha periods, Yogas
- Gemstone remedies, Mantra chanting, Pooja suggestions
- Traditional Vedic texts and scriptures
- Mahabharata and Ramayana stories

**RULES:**
- Give complete, detailed responses when asked for explanations
- Use authentic Vedic terminology
- Never mention technical terms
- Be warm and thorough

${context}

User: ${message}

Provide a complete, helpful response based on Vedic astrology principles.`;

    // Use environment variable for Docker/Server support
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    // Call Ollama API using axios for better timeout handling
    const response = await axios({
      method: 'post',
      url: `${ollamaBaseUrl}/api/generate`,
      data: {
        model: 'qwen2:0.5b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 400
        }
      },
      timeout: 120000
    });

    const data = response.data;
    return data.response || "I'm here to help with your astrological and spiritual questions. What would you like to know?";

  } catch (error) {
    console.error('Ollama generation error:', error);

    // Fallback to keyword-based responses if Ollama is unavailable
    return generateFallbackResponse(message);
  }
}

function buildConversationContext(conversationHistory) {
  if (conversationHistory.length === 0) {
    return "This is the start of our conversation.";
  }

  const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context
  let context = "Recent conversation:\n";

  recentMessages.forEach((msg, index) => {
    context += `User: ${msg.message}\n`;
    if (msg.response) {
      context += `You: ${msg.response}\n`;
    }
  });

  return context;
}

// Fallback function using your existing keyword system
function generateFallbackResponse(message) {
  const userMessage = message.toLowerCase().trim();

  const astrologyKeywords = ['kundli', 'horoscope', 'astrology', 'birth chart', 'rasi', 'nakshatra', 'panchang', 'muhurat', 'dasha', 'yoga', 'planet', 'zodiac', 'star', 'moon', 'sun', 'mars', 'venus', 'jupiter', 'saturn', 'mercury', 'rahu', 'ketu', 'ascendant', 'lagna', 'house', 'bhava'];
  const spiritualKeywords = ['puja', 'worship', 'temple', 'god', 'goddess', 'prayer', 'meditation', 'spiritual', 'dharma', 'karma', 'moksha', 'vedic', 'hindu', 'festival', 'ritual', 'mantra', 'chakra', 'pooja', 'havan', 'jaap', 'blessing', 'deity', 'divine', 'color', 'lucky', 'feng shui', 'energy', 'prosperity', 'healing', 'confidence', 'chanting', 'navagraha', 'planetary', 'surya', 'chandra', 'mangal', 'budha', 'brihaspati', 'shukra', 'shani', 'rahu', 'ketu', 'mala', 'beads', 'dosh', 'dosha', 'dosh', 'remedy', 'remedies', 'affliction', 'malefic', 'graha', 'beej', 'stotra', 'hridayam', 'chalisa', 'sahasranamam', 'shanti', 'yantra', 'navadhanya', 'homa', 'fire ceremony', 'ganapati', 'ganesha'];

  if (astrologyKeywords.some(keyword => userMessage.includes(keyword))) {
    return "I'd love to help you with your astrological questions! For detailed Kundli analysis and personalized guidance, I recommend creating your birth chart on our platform. What specific aspect of astrology interests you?";
  } else if (spiritualKeywords.some(keyword => userMessage.includes(keyword))) {
    return "Spiritual practices are wonderful for personal growth! I can guide you on pooja suggestions, mantra chanting, and spiritual remedies. What spiritual guidance are you seeking?";
  } else {
    return "Hello! I'm your AI astrologer at Nirvana Astro. I specialize in Vedic astrology, spiritual guidance, and helping you understand your cosmic journey. How can I assist you today?";
  }
}
