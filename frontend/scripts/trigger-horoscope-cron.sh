#!/bin/bash

# Nirvana 3.0 - Daily Horoscope Cron Trigger
# Usage: ./trigger-horoscope-cron.sh [URL] [SECRET]
# Example: ./trigger-horoscope-cron.sh http://localhost:3000 my-secret-key

# Default Configuration (Adjust for your Production environment)
DEFAULT_URL="http://localhost:3000/api/cron/daily-horoscope"
# You can hardcode your secret here for convenience if this file is secure
DEFAULT_SECRET="your_cron_secret_here"

# Use arguments if provided, otherwise defaults
API_URL="${1:-$DEFAULT_URL}"
CRON_SECRET="${2:-$DEFAULT_SECRET}"

echo "[$(date)] Triggering Daily Horoscope Cron at $API_URL..."

# Execute Request
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API_URL" \
  -H "Authorization: Bearer $CRON_SECRET")

# Log Output
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed "s/HTTP_STATUS:.*//")

if [ "$http_status" -eq 200 ]; then
  echo "[$(date)] ✅ Success! Status: $http_status"
  echo "Response: $body"
else
  echo "[$(date)] ❌ Failed. Status: $http_status"
  echo "Error: $body"
fi
