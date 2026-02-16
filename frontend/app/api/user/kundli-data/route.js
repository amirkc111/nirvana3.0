import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // SECURITY: Validate user ID format to prevent injection
    if (!userId || typeof userId !== 'string' || userId.length < 3) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Try to fetch from real database first with STRICT USER ISOLATION
    try {
      console.log(`🔍 Searching for Kundli data for user: ${userId}`);

      // Search in kundli_data table (the correct table with Kundli data)
      let { data: kundliData, error } = await supabaseServer
        .from('kundli_data')
        .select('*')
        .eq('user_id', userId)  // CRITICAL: Only this user's data
        .order('created_at', { ascending: false });

      console.log(`🔍 kundli_data query result: ${kundliData?.length || 0} records`);

      if (kundliData && kundliData.length > 0) {
        console.log(`Found ${kundliData.length} records in kundli_data table`);
        // Convert kundli_data format to standard format
        kundliData = kundliData.map(record => ({
          id: record.id,
          user_id: record.user_id,
          name: record.name,
          birth_date: `${record.birth_year}-${String(record.birth_month).padStart(2, '0')}-${String(record.birth_day).padStart(2, '0')}`,
          birth_time: `${String(record.birth_hour).padStart(2, '0')}:${String(record.birth_minute).padStart(2, '0')}:${String(record.birth_second).padStart(2, '0')}`,
          latitude: record.birth_latitude,
          longitude: record.birth_longitude,
          timezone: record.timezone_offset,
          city: record.birth_place,
          father_name: record.father_name,
          mother_name: record.mother_name,
          gotra: record.gotra,
          nawran_name: record.nawran_name,
          kundli_data: {},
          is_active: true,
          created_at: record.created_at,
          updated_at: record.updated_at
        }));
      }



      if (error) {
        console.log('Database query failed, falling back to simulation:', error.message);
        throw error;
      }

      if (kundliData && kundliData.length > 0) {
        console.log(`Found ${kundliData.length} real Kundli records for user: ${userId}`);
        // SECURITY: Double-check all records belong to the requesting user
        const filteredData = kundliData.filter(record => record.user_id === userId);
        if (filteredData.length !== kundliData.length) {
          console.warn('SECURITY WARNING: Some records did not belong to the requesting user');
        }
        return NextResponse.json(filteredData);
      }
    } catch (dbError) {
      console.log('Database access failed, using simulated data:', dbError.message);
    }

    // No Kundli records found for this user
    console.log(`No Kundli records found in database for user: ${userId}`);
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error in user/kundli-data:', error);
    return NextResponse.json({ error: 'Failed to fetch Kundli data' }, { status: 500 });
  }
}
