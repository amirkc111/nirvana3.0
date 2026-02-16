import { NextResponse } from 'next/server';

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
      kundliData
    } = await request.json();

    // Validate required fields
    if (!name || !date || !time || !lat || !lon) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, date, time, lat, lon' 
      }, { status: 400 });
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase not configured - Missing environment variables');
      console.error('Missing:', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey
      });
      
      return NextResponse.json({ 
        error: 'Database not configured',
        details: 'Supabase environment variables are missing. Please check SUPABASE_SETUP.md for setup instructions.',
        setup_required: true
      }, { status: 500 });
    }

    // Import Supabase client only if environment variables are available
    const { supabase } = await import('../../../lib/supabaseClient');

    // Get user authentication from request - check multiple cookie sources
    const authToken = request.cookies.get('auth-token')?.value || 
                     request.cookies.get('sb-access-token')?.value ||
                     request.cookies.get('sb-refresh-token')?.value ||
                     request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Debug: Log available cookies
    const cookies = {};
    for (const [name, value] of request.cookies) {
      cookies[name] = value;
    }
    console.log('Available cookies:', cookies);
    console.log('Auth token found:', !!authToken);
    
    if (!authToken) {
      return NextResponse.json({ 
        error: 'Authentication required',
        details: 'Please log in to save Kundli data. User ID is required for data security.',
        auth_required: true
      }, { status: 401 });
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ 
        error: 'Invalid authentication',
        details: 'Please log in again. Your session may have expired.',
        auth_invalid: true
      }, { status: 401 });
    }
    
    console.log('User authenticated:', user.email);

    // Prepare Kundli record data with user_id
    const kundliRecord = {
      user_id: user.id, // Use authenticated user's ID
      name: name,
      birth_date: date,
      birth_time: time,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      timezone: parseFloat(tznm),
      city: city,
      kundli_data: kundliData || {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log(`Saving Kundli record for: ${name}`);

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

    console.log(`✅ Kundli record saved successfully for: ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Kundli record saved successfully',
      record: data
    });

  } catch (error) {
    console.error('Error in save-kundli-simple:', error);
    return NextResponse.json({ 
      error: 'Failed to save Kundli record',
      details: error.message 
    }, { status: 500 });
  }
}
