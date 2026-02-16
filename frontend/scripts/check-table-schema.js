#!/usr/bin/env node

/**
 * Check the actual schema of kundli_data table
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

async function checkTableSchema() {
  try {
    console.log('🔍 Checking kundli_data table schema...');
    
    // Try to insert with minimal required fields only
    const minimalData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      name: 'Test User',
      birth_year: 2000,
      birth_month: 1,
      birth_day: 1,
      date_system: 'AD',
      birth_hour: 12,
      birth_minute: 0,
      birth_second: 0,
      time_system: 'PM',
      relation: 'Self',
      birth_place: 'Test City'
    };
    
    console.log('🧪 Testing with minimal data:', minimalData);
    
    const { data, error } = await supabase
      .from('kundli_data')
      .insert(minimalData);
    
    if (error) {
      console.error('❌ Minimal insertion failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.message.includes('column')) {
        console.log('💡 The table schema is missing some columns');
        console.log('🔧 You need to update the table schema');
      }
    } else {
      console.log('✅ Minimal insertion successful!');
      console.log('📊 Data:', data);
      
      // Clean up
      await supabase
        .from('kundli_data')
        .delete()
        .eq('name', 'Test User');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkTableSchema();
