import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request) {
  try {
    const { 
      name, 
      date, 
      time, 
      lat, 
      lon, 
      tznm, 
      city,
      kundliData,
      basicBirthDetails,
      planetaryInformation,
      birthCharts,
      yogaPhala,
      vimsottariDasha,
      analysis
    } = await request.json();

    // Validate required fields
    if (!name || !date || !time || !lat || !lon) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, date, time, lat, lon' 
      }, { status: 400 });
    }

    // For testing, use a fixed user ID (you can change this to your actual user ID)
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Test UUID

    // Prepare comprehensive Kundli record data
    const kundliRecord = {
      user_id: testUserId,
      name: name,
      birth_date: date,
      birth_time: time,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      timezone: parseFloat(tznm),
      city: city,
      
      // Store comprehensive Kundli analysis data
      kundli_data: {
        basicBirthDetails: basicBirthDetails || {},
        planetaryInformation: planetaryInformation || {},
        birthCharts: birthCharts || {},
        yogaPhala: yogaPhala || {},
        vimsottariDasha: vimsottariDasha || {},
        analysis: analysis || {},
        extractionMetadata: {
          extractedAt: new Date().toISOString(),
          hasYogaPhala: !!(yogaPhala && yogaPhala.extracted),
          hasVimsottariDasha: !!(vimsottariDasha && vimsottariDasha.extracted),
          hasPlanetaryInfo: !!(planetaryInformation && planetaryInformation.extracted),
          contentLength: analysis?.contentLength || 0
        }
      },
      
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log(`Testing Kundli record save for: ${name}`);

    // Save to database
    const { data, error } = await supabase
      .from('kundli_records')
      .insert([kundliRecord])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to save Kundli record',
        details: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Test Kundli record saved successfully for: ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Test Kundli record saved successfully',
      record: data
    });

  } catch (error) {
    console.error('Error in save-kundli-test:', error);
    return NextResponse.json({ 
      error: 'Failed to save Kundli record',
      details: error.message 
    }, { status: 500 });
  }
}
