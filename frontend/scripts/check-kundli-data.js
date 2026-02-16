#!/usr/bin/env node

/**
 * Check Kundli data in the database
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

async function checkKundliData() {
  try {
    console.log('🔍 Checking Kundli data in database...');
    
    // Check if table exists and get record count
    const { data, error, count } = await supabase
      .from('kundli_data')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error querying kundli_data:', error);
      return;
    }
    
    console.log(`📊 Found ${count} records in kundli_data table`);
    
    if (count > 0) {
      console.log('📋 Recent records:');
      data.slice(0, 5).forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.name} - ${record.birth_year}/${record.birth_month}/${record.birth_day} (${record.date_system})`);
        console.log(`     Place: ${record.birth_place}`);
        console.log(`     Created: ${new Date(record.created_at).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('📝 No Kundli records found in database');
      console.log('💡 This means either:');
      console.log('   1. No one has submitted a Kundli form yet');
      console.log('   2. The form submission is failing');
      console.log('   3. Users are not authenticated');
    }
    
    // Check if there are any users in auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('⚠️  Cannot check auth users (need admin privileges)');
    } else {
      console.log(`👥 Found ${users.users.length} users in auth.users`);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkKundliData();
