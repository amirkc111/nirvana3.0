#!/bin/bash

# detailed_deploy_ai.sh
# This script ensures Ollama is running and installs the required models.

echo "🚀 Starting AI Model Deployment..."

# 1. Start specific Ollama container (if not running)
echo "🐳 Ensuring Ollama container is up..."
docker-compose up -d ollama

# 2. Wait for Ollama API to be ready
echo "⏳ Waiting for Ollama to initialize..."
until curl -s -f "http://localhost:11434/api/tags" > /dev/null; do
    echo "   ...waiting for Ollama API (localhost:11434)..."
    sleep 5
done
echo "✅ Ollama is Online!"

# 3. Pull Models (Idempotent - won't download if already exists)
echo "⬇️  Pulling Llama 3.1 (Chat Model)..."
docker exec -it nirvana-ai ollama pull llama3.1:latest

echo "⬇️  Pulling Llava (Vision Model)..."
docker exec -it nirvana-ai ollama pull llava:latest

echo "🎉 AI Deployment Complete! Models are ready."
