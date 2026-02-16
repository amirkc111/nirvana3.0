#!/usr/bin/env node

/**
 * Setup script for Kundli database tables
 * This script creates the necessary tables and functions in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupKundliDatabase() {
  try {
    console.log('🚀 Setting up Kundli database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'kundli-data-setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error setting up database:', error);
      process.exit(1);
    }
    
    console.log('✅ Kundli database setup completed successfully!');
    console.log('📊 Created tables:');
    console.log('   - kundli_data (for storing user birth information)');
    console.log('   - Functions: save_kundli_data, get_user_kundli_data');
    console.log('   - RLS policies for data security');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupKundliDatabase();
