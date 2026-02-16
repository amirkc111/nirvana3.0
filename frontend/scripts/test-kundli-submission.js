#!/usr/bin/env node

/**
 * Test Kundli form submission
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

async function testKundliSubmission() {
  try {
    console.log('🧪 Testing Kundli form submission...');
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 User needs to be logged in to submit Kundli data');
      return;
    }
    
    console.log(`✅ User authenticated: ${user.email} (${user.id})`);
    
    // Test data insertion
    const testData = {
      user_id: user.id,
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
    
    console.log('📝 Attempting to insert test data...');
    
    const { data, error } = await supabase
      .from('kundli_data')
      .insert(testData);
    
    if (error) {
      console.error('❌ Error inserting data:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Test data inserted successfully!');
      console.log('📊 Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testKundliSubmission();
