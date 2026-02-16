#!/usr/bin/env node

/**
 * Check authentication users vs database tables
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

async function checkAuthUsers() {
  try {
    console.log('🔍 Checking authentication vs database tables...');
    
    // Check if we can access auth.users (this requires service role key)
    console.log('⚠️  Note: Checking auth.users requires service role key');
    console.log('💡 Using anon key, so we can only check public tables');
    
    // Check public tables
    console.log('\n📊 Checking public tables:');
    
    // Check user_profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ user_profiles error:', profilesError);
    } else {
      console.log(`✅ user_profiles: ${profilesData.length} records`);
      if (profilesData.length > 0) {
        console.log('   Sample:', profilesData[0]);
      }
    }
    
    // Check user_details table
    const { data: detailsData, error: detailsError } = await supabase
      .from('user_details')
      .select('*')
      .limit(5);
    
    if (detailsError) {
      console.error('❌ user_details error:', detailsError);
    } else {
      console.log(`✅ user_details: ${detailsData.length} records`);
      if (detailsData.length > 0) {
        console.log('   Sample:', detailsData[0]);
      }
    }
    
    // Check kundli_data table
    const { data: kundliData, error: kundliError } = await supabase
      .from('kundli_data')
      .select('*')
      .limit(5);
    
    if (kundliError) {
      console.error('❌ kundli_data error:', kundliError);
    } else {
      console.log(`✅ kundli_data: ${kundliData.length} records`);
      if (kundliData.length > 0) {
        console.log('   Sample:', kundliData[0]);
      }
    }
    
    console.log('\n💡 DIAGNOSIS:');
    console.log('If all tables are empty but you get "email already registered":');
    console.log('1. The user exists in auth.users (Supabase auth system)');
    console.log('2. But the user data is not being synced to your public tables');
    console.log('3. This suggests missing triggers or functions to populate user_profiles/user_details');
    
    console.log('\n🔧 SOLUTION:');
    console.log('You need to set up triggers to automatically create user_profiles/user_details');
    console.log('when a user signs up through Supabase Auth.');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkAuthUsers();
