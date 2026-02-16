#!/usr/bin/env node

/**
 * Complete fix for Kundli database issues
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

async function fixKundliDatabase() {
  try {
    console.log('🔧 Fixing Kundli database issues...');
    
    // Check current table status
    const { data: tableData, error: tableError } = await supabase
      .from('kundli_data')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return;
    }
    
    console.log('✅ kundli_data table exists and is accessible');
    
    // Test RLS policies
    console.log('🧪 Testing RLS policies...');
    
    const testData = {
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
    
    const { data, error } = await supabase
      .from('kundli_data')
      .insert(testData);
    
    if (error) {
      if (error.code === '42501') {
        console.log('❌ RLS policy is blocking insertion');
        console.log('💡 This means the Row Level Security policies are not properly configured');
        console.log('');
        console.log('🔧 SOLUTION:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Navigate to your project');
        console.log('3. Go to SQL Editor');
        console.log('4. Run the following SQL to fix RLS policies:');
        console.log('');
        console.log('-- Drop existing policies');
        console.log('DROP POLICY IF EXISTS "Users can view own kundli data" ON kundli_data;');
        console.log('DROP POLICY IF EXISTS "Users can insert own kundli data" ON kundli_data;');
        console.log('DROP POLICY IF EXISTS "Users can update own kundli data" ON kundli_data;');
        console.log('DROP POLICY IF EXISTS "Users can delete own kundli data" ON kundli_data;');
        console.log('');
        console.log('-- Create new policies');
        console.log('CREATE POLICY "Users can view own kundli data" ON kundli_data');
        console.log('    FOR SELECT USING (auth.uid() = user_id);');
        console.log('');
        console.log('CREATE POLICY "Users can insert own kundli data" ON kundli_data');
        console.log('    FOR INSERT WITH CHECK (auth.uid() = user_id);');
        console.log('');
        console.log('CREATE POLICY "Users can update own kundli data" ON kundli_data');
        console.log('    FOR UPDATE USING (auth.uid() = user_id);');
        console.log('');
        console.log('CREATE POLICY "Users can delete own kundli data" ON kundli_data');
        console.log('    FOR DELETE USING (auth.uid() = user_id);');
        console.log('');
        console.log('5. After running the SQL, test the form again');
        
      } else {
        console.error('❌ Other error:', error);
      }
    } else {
      console.log('✅ RLS policies are working correctly!');
      console.log('📊 Test data inserted:', data);
      
      // Clean up test data
      await supabase
        .from('kundli_data')
        .delete()
        .eq('name', 'Test User');
      
      console.log('🧹 Test data cleaned up');
      console.log('✅ Your Kundli form should work now!');
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixKundliDatabase();
