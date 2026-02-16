import { NextResponse } from 'next/server';
import axios from 'axios';

// Hybrid AI Chatbot API endpoint (Ollama + Keywords)
export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 });
    }

    // Check if it's a specific astrology question that needs Ollama
    const needsOllama = shouldUseOllama(message);

    let aiResponse;
    if (needsOllama) {
      aiResponse = await generateOllamaResponse(message, conversationHistory);
    } else {
      aiResponse = await generateKeywordResponse(message, conversationHistory);
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      source: needsOllama ? 'ollama' : 'keywords'
    });

  } catch (error) {
    console.error('Hybrid Chat API Error:', error);
    return NextResponse.json({
      error: 'Failed to process message'
    }, { status: 500 });
  }
}

function shouldUseOllama(message) {
  const userMessage = message.toLowerCase().trim();

  // Use Ollama for complex questions
  const complexKeywords = [
    'explain', 'describe', 'tell me about', 'what is', 'how does', 'why',
    'relationship', 'compatibility', 'marriage', 'career', 'health',
    'detailed', 'analysis', 'interpretation', 'meaning', 'significance'
  ];

  // Use keywords for simple greetings and basic questions
  const simpleKeywords = [
    'hello', 'hi', 'thanks', 'thank you', 'good', 'bad', 'yes', 'no',
    'gemstone', 'color', 'lucky', 'pooja', 'mantra'
  ];

  return complexKeywords.some(keyword => userMessage.includes(keyword)) &&
    !simpleKeywords.some(keyword => userMessage.includes(keyword));
}

async function generateOllamaResponse(message, conversationHistory) {
  try {
    const context = buildConversationContext(conversationHistory);

    const prompt = `You are an expert Vedic astrologer for Nirvana Astro. Provide detailed, accurate guidance on astrology and spirituality.

${context}

User: ${message}

Respond as a knowledgeable astrologer with warmth and wisdom.`;

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    const response = await axios({
      method: 'post',
      url: `${ollamaBaseUrl}/api/generate`,
      data: {
        model: 'llama3.1',
        prompt: prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 400 }
      },
      timeout: 600000 // 10 minutes
    });

    const data = response.data;
    return data.response || "I'm here to help with your astrological questions.";

  } catch (error) {
    console.error('Ollama error:', error);
    return generateKeywordResponse(message, conversationHistory);
  }
}

async function generateKeywordResponse(message, conversationHistory) {
  const userMessage = message.toLowerCase().trim();

  const gemstoneKeywords = ['gemstone', 'stone', 'ratna', 'crystal', 'ruby', 'emerald', 'diamond'];
  const astrologyKeywords = ['kundli', 'horoscope', 'astrology', 'birth chart', 'rasi', 'nakshatra'];
  const spiritualKeywords = ['puja', 'worship', 'temple', 'prayer', 'meditation', 'spiritual', 'mantra'];

  if (gemstoneKeywords.some(keyword => userMessage.includes(keyword))) {
    return "I'd be happy to recommend gemstones based on your birth chart! Each gemstone has unique planetary energies. What's your zodiac sign or birth details?";
  } else if (astrologyKeywords.some(keyword => userMessage.includes(keyword))) {
    return "Astrology is a beautiful science! I can help you understand your Kundli, planetary positions, and their effects on your life. What would you like to explore?";
  } else if (spiritualKeywords.some(keyword => userMessage.includes(keyword))) {
    return "Spiritual practices bring peace and harmony! I can suggest poojas, mantras, and remedies based on your astrological profile. What spiritual guidance do you need?";
  } else {
    return "Hello! I'm your AI astrologer at Nirvana Astro. I specialize in Vedic astrology and spiritual guidance. How can I help you today?";
  }
}

function buildConversationContext(conversationHistory) {
  if (conversationHistory.length === 0) return "This is the start of our conversation.";

  const recentMessages = conversationHistory.slice(-4);
  let context = "Recent conversation:\n";

  recentMessages.forEach(msg => {
    context += `User: ${msg.message}\n`;
    if (msg.response) context += `You: ${msg.response}\n`;
  });

  return context;
}
