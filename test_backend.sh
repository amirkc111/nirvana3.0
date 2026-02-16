#!/bin/bash
echo "Testing Python Backend Health..."
curl -s http://localhost:3003/api/health

echo -e "\n\nTesting Panchang Calculation (Defaults)..."
curl -s -X POST -H "Content-Type: application/json" -d '{}' http://localhost:3003/api/panchang | head -c 200
echo -e "\n... (truncated)"
