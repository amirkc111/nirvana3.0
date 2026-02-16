import { NextResponse } from 'next/server';
import axios from 'axios';
import { astrologicalKnowledge } from '../../../lib/astrologicalKnowledge.js';
import { trainingPrompts, bilingualTemplates } from '../../../lib/astrologicalTrainingPrompts.js';
import { trainingData } from '../../../lib/astrologicalTrainingData.js';
import { bphsTrainingData } from '../../../lib/bphsTrainingData.js';
import { completeBphsTrainingData } from '../../../lib/completeBphsTrainingData.js';
import { comprehensiveTrainingData } from '../../../lib/comprehensiveTrainingData.js';
import { sanskritGuideTrainingData } from '../../../lib/sanskritGuideTrainingData.js';

export async function POST(request) {
    try {
        const { userQuestion, userData, kundliData, voiceSettings } = await request.json();

        const currentUserId = userData?.user?.id;
        const isAuthenticated = userData?.isAuthenticated || false;

        // Preparation instructions
        const authInstructions = isAuthenticated ? `
CRITICAL RESPONSE RULE: For simple factual questions, give direct answers without explanations. Answer directly based on user's birth data.
` : `
Suggest logging in for personalized readings.
`;

        const systemPrompt = `You are an expert Vedic astrologer with VOICE CAPABILITIES.
${authInstructions}
SYSTEM DATA:
- Knowledge Base: ${JSON.stringify(astrologicalKnowledge).substring(0, 1000)}
- User Status: ${isAuthenticated ? 'Authenticated' : 'Guest'}
- Records: ${userData?.savedKundliData?.length || 0}
`;

        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

        // Use axios for voice chat to handle long load times
        const response = await axios({
            method: 'post',
            url: `${ollamaBaseUrl}/api/generate`,
            data: {
                model: 'qwen2:0.5b',
                prompt: systemPrompt + `\n\nUser Question: ${userQuestion}`,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 400
                }
            },
            timeout: 120000
        });

        const aiResponse = response.data.response;

        return NextResponse.json({
            success: true,
            response: aiResponse,
            voiceOptimized: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('🎤 Voice Chat API Error:', error);
        return NextResponse.json(
            { error: 'Voice chat failed', details: error.message },
            { status: 500 }
        );
    }
}
