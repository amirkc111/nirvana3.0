#!/usr/bin/env node

/**
 * Check authentication session and cookies
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

async function checkAuthSession() {
  try {
    console.log('🔍 Checking authentication session...');
    
    // Check if we can get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      console.log('💡 This means the user is not authenticated in this context');
      console.log('💡 The browser session might be separate from the Node.js session');
      return;
    }
    
    console.log('✅ Active session found:');
    console.log(`  User ID: ${session.user.id}`);
    console.log(`  Email: ${session.user.email}`);
    console.log(`  Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    
    // Test database access with this session
    console.log('\n💾 Testing database access...');
    
    const { data, error } = await supabase
      .from('kundli_data')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database access failed:', error);
    } else {
      console.log('✅ Database access successful');
      console.log(`📊 Found ${data.length} records`);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkAuthSession();
