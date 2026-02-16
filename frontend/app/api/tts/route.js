
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { text } = body;

        const apiKey = process.env.GOOGLE_API_KEY;

        // Robust check for missing API Key
        if (!apiKey) {
            console.error("Missing GOOGLE_API_KEY");
            return NextResponse.json(
                { error: 'Google Cloud API configuration missing' },
                { status: 500 }
            );
        }

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Google Cloud TTS API Endpoint
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

        // Voice Selection Logic
        // ne-NP-Standard-A: Female
        // ne-NP-Standard-B: Male (Best for Chanting)
        // ne-NP-Standard-C: Female
        // ne-NP-Standard-D: Male
        // ne-NP-Neural2-D: Male Neural (Higher Quality)
        const requestedVoice = body.voice || 'ne-NP-Standard-B';

        const requestBody = {
            input: { text: text },
            voice: {
                languageCode: 'ne-NP',
                name: requestedVoice
            },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: -1.0,  // Slightly deep
                speakingRate: 0.82 // Chanting pace
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Cloud TTS API Error:', errorText);
            return NextResponse.json(
                { error: `TTS Generation failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data.audioContent) {
            throw new Error('No audio content received from Google');
        }

        // Decode base64 audio content
        const audioBuffer = Buffer.from(data.audioContent, 'base64');

        // Return the audio stream
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });

    } catch (error) {
        console.error('TTS Route Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
