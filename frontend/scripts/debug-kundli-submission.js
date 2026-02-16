#!/usr/bin/env node

/**
 * Debug Kundli form submission with real user session
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

async function debugKundliSubmission() {
  try {
    console.log('🔍 Debugging Kundli form submission...');
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 Please log in through the web interface first');
      return;
    }
    
    console.log(`✅ User authenticated: ${user.email} (${user.id})`);
    
    // Test the exact data structure from the form
    const formData = {
      name: "Test User",
      birthYear: "2000",
      birthMonth: "1", 
      birthDay: "1",
      dateSystem: "AD",
      birthHour: "12",
      birthMinute: "0",
      birthSecond: "0",
      timeSystem: "PM",
      relation: "Self",
      birthPlace: "Kathmandu, Nepal",
      outsideNepal: false,
      latitude: "27.7172",
      longitude: "85.3240",
      ayanamsa: "1",
      timezone: "Asia/Kathmandu",
      timezoneOffset: "5.75"
    };
    
    // Parse birth place to extract city and country (same as form logic)
    const [city, country] = formData.birthPlace.includes(',') 
      ? formData.birthPlace.split(',').map(s => s.trim())
      : [formData.birthPlace, ''];
    
    console.log('📝 Form data parsed:');
    console.log(`  Name: ${formData.name}`);
    console.log(`  Birth: ${formData.birthYear}/${formData.birthMonth}/${formData.birthDay} (${formData.dateSystem})`);
    console.log(`  Time: ${formData.birthHour}:${formData.birthMinute}:${formData.birthSecond} ${formData.timeSystem}`);
    console.log(`  Place: ${formData.birthPlace} -> City: ${city}, Country: ${country}`);
    console.log(`  Coordinates: ${formData.latitude}, ${formData.longitude}`);
    console.log(`  Ayanamsa: ${formData.ayanamsa}, Timezone: ${formData.timezone}`);
    
    // Test database insertion with exact same logic as form
    console.log('\n💾 Attempting database insertion...');
    
    const { data, error } = await supabase
      .from('kundli_data')
      .insert({
        user_id: user.id,
        name: formData.name,
        birth_year: parseInt(formData.birthYear),
        birth_month: parseInt(formData.birthMonth),
        birth_day: parseInt(formData.birthDay),
        date_system: formData.dateSystem,
        birth_hour: parseInt(formData.birthHour),
        birth_minute: parseInt(formData.birthMinute),
        birth_second: parseInt(formData.birthSecond),
        time_system: formData.timeSystem,
        relation: formData.relation,
        birth_place: formData.birthPlace,
        birth_city: city,
        birth_country: country,
        birth_latitude: parseFloat(formData.latitude) || null,
        birth_longitude: parseFloat(formData.longitude) || null,
        outside_nepal: formData.outsideNepal,
        ayanamsa: parseInt(formData.ayanamsa) || 1,
        timezone: formData.timezone || 'Asia/Kathmandu',
        timezone_offset: parseFloat(formData.timezoneOffset) || 5.75
      });
    
    if (error) {
      console.error('❌ Database insertion failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Check specific error types
      if (error.code === 'PGRST205' || error.code === 'PGRST116') {
        console.log('\n💡 Table does not exist - need to create kundli_data table');
      } else if (error.code === '23503') {
        console.log('\n💡 Foreign key constraint violation - user_id not found in auth.users');
      } else if (error.code === '42501') {
        console.log('\n💡 Permission denied - RLS policy blocking insertion');
      } else if (error.code === '23514') {
        console.log('\n💡 Check constraint violation - invalid data format');
      }
    } else {
      console.log('✅ Database insertion successful!');
      console.log('📊 Inserted data:', data);
      
      // Verify the insertion
      const { data: verifyData, error: verifyError } = await supabase
        .from('kundli_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (verifyError) {
        console.error('❌ Error verifying insertion:', verifyError);
      } else {
        console.log('✅ Verification successful:');
        console.log(`  Found ${verifyData.length} record(s) for user ${user.id}`);
        if (verifyData.length > 0) {
          console.log('  Latest record:', verifyData[0]);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugKundliSubmission();
