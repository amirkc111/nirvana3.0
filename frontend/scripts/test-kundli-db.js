#!/usr/bin/env node

/**
 * Test script to check if Kundli database tables exist
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

async function testKundliDatabase() {
  try {
    console.log('🔍 Testing Kundli database connection...');
    
    // Test if kundli_data table exists
    const { data, error } = await supabase
      .from('kundli_data')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ kundli_data table does not exist');
        console.log('📋 To create the table, run the SQL from scripts/kundli-data-setup.sql in your Supabase dashboard');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
      } else {
        console.error('❌ Database error:', error);
      }
    } else {
      console.log('✅ kundli_data table exists');
      console.log(`📊 Found ${data.length} records`);
    }
    
    // Test if save_kundli_data function exists
    const { data: funcData, error: funcError } = await supabase
      .rpc('save_kundli_data', {
        user_uuid: '00000000-0000-0000-0000-000000000000',
        name_param: 'test',
        birth_year_param: 2000,
        birth_month_param: 1,
        birth_day_param: 1,
        date_system_param: 'AD',
        birth_hour_param: 12,
        birth_minute_param: 0,
        birth_second_param: 0,
        time_system_param: 'PM',
        relation_param: 'Self',
        birth_place_param: 'Test City',
        birth_city_param: 'Test City',
        birth_country_param: 'Test Country',
        birth_latitude_param: 0,
        birth_longitude_param: 0,
        outside_nepal_param: false
      });
    
    if (funcError) {
      if (funcError.code === '42883') {
        console.log('❌ save_kundli_data function does not exist');
        console.log('📋 To create the function, run the SQL from scripts/kundli-data-setup.sql in your Supabase dashboard');
      } else {
        console.error('❌ Function error:', funcError);
      }
    } else {
      console.log('✅ save_kundli_data function exists');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testKundliDatabase();
