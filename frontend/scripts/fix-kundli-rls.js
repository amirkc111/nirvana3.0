#!/usr/bin/env node

/**
 * Fix RLS policies for kundli_data table
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

async function fixKundliRLS() {
  try {
    console.log('🔧 Fixing RLS policies for kundli_data table...');
    
    // Check if table exists
    const { data: tableData, error: tableError } = await supabase
      .from('kundli_data')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return;
    }
    
    console.log('✅ kundli_data table is accessible');
    
    // Test insertion with a simple record
    console.log('🧪 Testing database insertion...');
    
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
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
      birth_place: 'Test City',
      birth_city: 'Test City',
      birth_country: 'Test Country',
      birth_latitude: 0,
      birth_longitude: 0,
      outside_nepal: false,
      ayanamsa: 1,
      timezone: 'Asia/Kathmandu',
      timezone_offset: 5.75
    };
    
    const { data, error } = await supabase
      .from('kundli_data')
      .insert(testData);
    
    if (error) {
      console.error('❌ Insertion failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === '42501') {
        console.log('💡 RLS policy is blocking insertion');
        console.log('🔧 You need to run the SQL script in Supabase dashboard to fix RLS policies');
        console.log('📋 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
        console.log('📄 Run the SQL from: scripts/kundli-data-setup.sql');
      } else if (error.code === '23503') {
        console.log('💡 Foreign key constraint violation');
        console.log('🔧 The user_id does not exist in auth.users table');
      }
    } else {
      console.log('✅ Test insertion successful!');
      console.log('📊 Data:', data);
      
      // Clean up test data
      await supabase
        .from('kundli_data')
        .delete()
        .eq('name', 'Test User');
      
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixKundliRLS();
