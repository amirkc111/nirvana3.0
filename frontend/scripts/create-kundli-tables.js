#!/usr/bin/env node

/**
 * Create Kundli database tables using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createKundliTables() {
  try {
    console.log('🚀 Creating Kundli database tables...');
    
    // Create the kundli_data table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS kundli_data (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        birth_year INTEGER NOT NULL,
        birth_month INTEGER NOT NULL,
        birth_day INTEGER NOT NULL,
        date_system TEXT NOT NULL CHECK (date_system IN ('BS', 'AD')),
        birth_hour INTEGER NOT NULL,
        birth_minute INTEGER NOT NULL,
        birth_second INTEGER NOT NULL,
        time_system TEXT NOT NULL CHECK (time_system IN ('AM', 'PM')),
        relation TEXT NOT NULL,
        birth_place TEXT NOT NULL,
        birth_city TEXT,
        birth_country TEXT,
        birth_latitude DECIMAL(10, 8),
        birth_longitude DECIMAL(11, 8),
        outside_nepal BOOLEAN DEFAULT FALSE,
        ayanamsa INTEGER DEFAULT 1,
        timezone TEXT DEFAULT 'Asia/Kathmandu',
        timezone_offset DECIMAL(4, 2) DEFAULT 5.75,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { data: tableData, error: tableError } = await supabase
      .rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.error('❌ Error creating table:', tableError);
      return;
    }
    
    console.log('✅ kundli_data table created successfully');
    
    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_kundli_data_user_id ON kundli_data(user_id);
      CREATE INDEX IF NOT EXISTS idx_kundli_data_name ON kundli_data(name);
      CREATE INDEX IF NOT EXISTS idx_kundli_data_birth_place ON kundli_data(birth_place);
    `;
    
    const { error: indexError } = await supabase
      .rpc('exec_sql', { sql: createIndexesSQL });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }
    
    // Enable RLS
    const enableRLSSQL = `
      ALTER TABLE kundli_data ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: rlsError } = await supabase
      .rpc('exec_sql', { sql: enableRLSSQL });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }
    
    // Create RLS policies
    const createPoliciesSQL = `
      CREATE POLICY "Users can view own kundli data" ON kundli_data
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own kundli data" ON kundli_data
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own kundli data" ON kundli_data
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete own kundli data" ON kundli_data
        FOR DELETE USING (auth.uid() = user_id);
    `;
    
    const { error: policyError } = await supabase
      .rpc('exec_sql', { sql: createPoliciesSQL });
    
    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
    } else {
      console.log('✅ RLS policies created successfully');
    }
    
    console.log('🎉 Kundli database setup completed!');
    console.log('📊 You can now save Kundli data to the database');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
createKundliTables();
