import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    try {
        const { prompt, modelId = "qwen2:0.5b" } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`[Ollama Test] Connecting to: ${ollamaBaseUrl}/api/generate`);

        const response = await axios({
            method: 'post',
            url: `${ollamaBaseUrl}/api/generate`,
            data: {
                model: modelId,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 500
                }
            },
            timeout: 180000 // 3 minute timeout
        });

        // Ollama returns: { "model": "...", "response": "...", "done": true }
        return NextResponse.json(response.data);

    } catch (error) {
        console.error("[Ollama Test API Error]:", error.message);
        return NextResponse.json({
            error: error.message,
            details: error.response?.data || "No additional details"
        }, { status: error.response?.status || 500 });
    }
}
