#!/bin/bash

# Test script for horoscope cron job
echo "=== Horoscope Cron Job Test ==="
echo "Date: $(date)"
echo "Working Directory: $(pwd)"
echo "Node Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo ""

echo "Testing horoscope data fetch..."
npm run fetch-horoscope

echo ""
echo "=== Test Complete ==="
