'use client';

import { useState } from 'react';

export default function TestMePage() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [modelId, setModelId] = useState('qwen2:0.5b');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse('');

        try {
            const res = await fetch('/api/hf-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, modelId })
            });

            const data = await res.json();
            if (res.ok) {
                // Ollama returns response in 'response' field
                setResponse(data.response || JSON.stringify(data, null, 2));
            } else {
                setResponse(`Error: ${data.error}\nDetails: ${JSON.stringify(data.details, null, 2)}`);
            }
        } catch (err) {
            setResponse(`Fetch Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-gray-100 flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        Ollama Explorer
                    </h1>
                    <p className="text-gray-400 text-sm font-medium tracking-wide">
                        Test our internal AI models directly
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-orange-400 uppercase tracking-widest px-1">Model ID</label>
                        <select
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors appearance-none"
                        >
                            <option value="qwen2:0.5b">Qwen 0.5B (Fastest)</option>
                            <option value="llama3.2:latest">Llama 3.2 3B (Smart)</option>
                            <option value="llama3.1:latest">Llama 3.1 8B (Heavy)</option>
                            <option value="llava:latest">Llava (Vision)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-orange-400 uppercase tracking-widest px-1">Prompt</label>
                        <textarea
                            rows="4"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                            placeholder="Type your message to Ollama..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all ${loading
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-500/20 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? 'Consulting the Engine...' : 'Run Prediction'}
                    </button>
                </form>

                {response && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-red-400 uppercase tracking-widest">Ollama Output</label>
                            <button
                                onClick={() => setResponse('')}
                                className="text-[10px] text-gray-500 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="w-full bg-white/5 border border-red-500/20 rounded-2xl px-6 py-6 text-sm text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
                            {response}
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-8 text-gray-600 text-[10px] uppercase tracking-[0.3em]">
                Internal AI Diagnostic Tool
            </p>
        </div>
    );
}
