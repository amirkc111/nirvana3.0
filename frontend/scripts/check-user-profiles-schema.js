#!/usr/bin/env node

/**
 * Check the actual schema of user_profiles table
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

async function checkUserProfilesSchema() {
  try {
    console.log('🔍 Checking user_profiles table schema...');
    
    // Try to select from user_profiles to see what columns exist
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing user_profiles:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'PGRST116') {
        console.log('💡 Table does not exist - need to create it');
      } else if (error.message.includes('column')) {
        console.log('💡 Table exists but has different column structure');
      }
    } else {
      console.log('✅ user_profiles table accessible');
      console.log('📊 Sample data:', data);
      
      if (data.length > 0) {
        console.log('📋 Available columns:', Object.keys(data[0]));
      } else {
        console.log('📋 Table is empty, but accessible');
      }
    }
    
    // Also check user_details
    console.log('\n🔍 Checking user_details table schema...');
    const { data: detailsData, error: detailsError } = await supabase
      .from('user_details')
      .select('*')
      .limit(1);
    
    if (detailsError) {
      console.error('❌ Error accessing user_details:', detailsError);
    } else {
      console.log('✅ user_details table accessible');
      if (detailsData.length > 0) {
        console.log('📋 Available columns:', Object.keys(detailsData[0]));
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkUserProfilesSchema();
