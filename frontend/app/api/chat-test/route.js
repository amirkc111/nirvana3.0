import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { message } = await request.json();

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    // Simple test using axios
    const response = await axios({
      method: 'post',
      url: `${ollamaBaseUrl}/api/generate`,
      data: {
        model: 'vedic-astrologer:latest',
        prompt: `You are a Vedic astrologer. User asked: "${message}". Give a brief, helpful response.`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      },
      timeout: 600000 // 10 minutes
    });

    const data = response.data;

    return NextResponse.json({
      response: data.response,
      success: true
    });

  } catch (error) {
    console.error('❌ Chat test error:', error);
    return NextResponse.json({
      response: "Sorry, I'm having trouble connecting to the AI service.",
      error: error.message
    }, { status: 500 });
  }
}
