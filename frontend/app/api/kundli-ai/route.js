import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use Node.js runtime for stream compatibility

export async function POST(request) {
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://5.180.172.215:11434';
    let body;

    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { prompt, options, format } = body;
    console.log(`[Proxy] Streaming request to Ollama: ${ollamaBaseUrl}/api/generate`);

    // Create a stream that starts IMMEDIATELY
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            // HEARTBEAT SETUP: Send a keep-alive ping every 5 seconds to hold the connection open
            // This prevents Nginx from killing the request if Ollama takes > 60s to load
            const heartbeatInterval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode("  \n")); // NDJSON friendly whitespace
                    console.log(`[Proxy] Sent heartbeat...`);
                } catch (e) {
                    // Client disconnected, stop trying
                    clearInterval(heartbeatInterval);
                }
            }, 5000);

            try {
                // Now call Ollama (blocking wait for headers)
                const upstreamResponse = await fetch(`${ollamaBaseUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "llama3.2:latest",
                        prompt: prompt,
                        stream: true,
                        format: format !== undefined ? format : "json",
                        options: {
                            ...options,
                            num_predict: 400,
                            temperature: 0.25,
                            top_p: 0.85,
                            repeat_penalty: 1.1
                        }
                    })
                });

                // Ollama responded! Stop the heartbeat.
                clearInterval(heartbeatInterval);

                if (!upstreamResponse.ok) {
                    const errText = await upstreamResponse.text();
                    const errorJson = JSON.stringify({ error: `Ollama Error: ${upstreamResponse.status} ${errText}` });
                    controller.enqueue(encoder.encode(errorJson + "\n"));
                    controller.close();
                    return;
                }

                // Pipe the actual data
                const reader = upstreamResponse.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    controller.enqueue(value);
                }

                controller.close();

            } catch (err) {
                clearInterval(heartbeatInterval); // Ensure we stop on error
                console.error("[Proxy] Stream Error:", err);
                const errorJson = JSON.stringify({ error: `Stream Failed: ${err.message}` });
                try { controller.enqueue(encoder.encode(errorJson + "\n")); } catch (e) { }
                try { controller.close(); } catch (e) { }
            }
        }
    });

    // Return the response IMMEDIATELY (don't await fetch)
    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/json', // NDJSON
            'X-Accel-Buffering': 'no',
            'Cache-Control': 'no-cache, no-transform'
        }
    });
}
