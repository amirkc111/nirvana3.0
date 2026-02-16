#!/bin/bash

# Script to update kundli_data table schema
# Make sure you have psql installed and configured

echo "🔧 Updating kundli_data table schema..."

# Option 1: Run the basic schema update
echo "Running basic schema update..."
psql -h your-supabase-host -U postgres -d postgres -f scripts/update-kundli-data-schema.sql

# Option 2: Run the complete schema update (recommended)
echo "Running complete schema update..."
psql -h your-supabase-host -U postgres -d postgres -f scripts/complete-kundli-schema-update.sql

echo "✅ Schema update completed!"
echo "📋 You can now use the KundliForm with all fields including gender and timezone."
