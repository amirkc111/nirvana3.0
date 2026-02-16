import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import fs from 'fs/promises';
import path from 'path';
import { simpleTransliterate } from '../../../lib/vedicjyotish/services/NepaliLocalization';

const KUNDALI_USERS_DIR = path.resolve(process.cwd(), '../kundali_users');

// Helper to get consistent filename
const getCachePath = (name, email) => {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return path.join(KUNDALI_USERS_DIR, `${safeName}_${safeEmail}.json`);
};

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
      planetaryPositions,
      yogaPhala,
      vimsottariDasha,
      birthChart,
      analysis,
      divisionalCharts,
      chartCalculations,
      chartImages,
      fatherName,
      motherName,
      gotra,
      nawranName
    } = await request.json();

    // Validate required fields
    if (!name || !date || !time || !lat || !lon) {
      return NextResponse.json({
        error: 'Missing required fields: name, date, time, lat, lon'
      }, { status: 400 });
    }

    // Get user ID from authentication
    const authToken = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    if (authError || !user) {
      return NextResponse.json({
        error: 'Invalid authentication'
      }, { status: 401 });
    }

    // Prepare Kundli record data with all divisional charts
    const kundliRecord = {
      user_id: user.id,
      name: name,
      birth_date: date,
      birth_time: time,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      timezone: parseFloat(tznm),
      city: city,
      // Advanced Details
      father_name: fatherName,
      mother_name: motherName,
      gotra: gotra,
      nawran_name: nawranName,

      kundli_data: kundliData || {},
      planetary_positions: planetaryPositions || {},
      yoga_phala: yogaPhala || {},
      vimsottari_dasha: vimsottariDasha || {},
      birth_chart: birthChart || {},
      analysis: analysis || {},

      // Divisional Charts (D-charts)
      rashi_chart: divisionalCharts?.rashi || {},
      navamsa_chart: divisionalCharts?.navamsa || {},
      dasamsa_chart: divisionalCharts?.dasamsa || {},
      dwadasamsa_chart: divisionalCharts?.dwadasamsa || {},
      shodasamsa_chart: divisionalCharts?.shodasamsa || {},
      vimsamsa_chart: divisionalCharts?.vimsamsa || {},
      chaturvimsamsa_chart: divisionalCharts?.chaturvimsamsa || {},
      bhamsa_chart: divisionalCharts?.bhamsa || {},
      trimsamsa_chart: divisionalCharts?.trimsamsa || {},
      khavedamsa_chart: divisionalCharts?.khavedamsa || {},
      akshavedamsa_chart: divisionalCharts?.akshavedamsa || {},
      shashtyamsa_chart: divisionalCharts?.shashtyamsa || {},

      // Additional chart data
      all_divisional_charts: divisionalCharts || {},
      chart_calculations: chartCalculations || {},
      chart_images: chartImages || {},

      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to local file system
    try {
      await fs.mkdir(KUNDALI_USERS_DIR, { recursive: true });
      const filePath = getCachePath(name, user.email);

      // Prepare data for file - match the structure of aayan_amirkc444_gmail_com.json roughly
      // The user wants "those all info".
      // Let's structure it to capture everything in kundliRecord but maybe cleaner?
      // Actually, let's just dump the whole object we prepared, plus maybe some convenient top-level keys if needed.
      // The reference file has `basicInfo`, `kundaliData` etc.
      // Our `kundliRecord` has `kundli_data`.
      // Let's try to map it to be useful.

      const fileData = {
        basicInfo: {
          name,
          birthDate: date,
          birthTime: time,
          place: city,
          coordinates: { latitude: lat, longitude: lon },
          // Advanced Details
          fatherName,
          motherName,
          gotra,
          nawranName,
          // DB naming compatibility
          father_name: fatherName,
          mother_name: motherName,
          gotra: gotra,
          nawran_name: nawranName,
          // Nepali Transliterations
          fatherNameNp: simpleTransliterate(fatherName),
          motherNameNp: simpleTransliterate(motherName),
          gotraNp: simpleTransliterate(gotra),
          nawranNameNp: simpleTransliterate(nawranName),
          // approximations for age/panchanga if not in payload
        },
        kundaliData: kundliData || {}, // This seems to match the reference structure key
        ...kundliRecord, // Include everything else just in case
        lastSavedAt: new Date().toISOString()
      };

      await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
      console.log(`[Storage] Kundali file saved locally: ${filePath}`);
    } catch (fsError) {
      console.error("Failed to save local file:", fsError);
      // We don't block the Supabase save if fs fails, but we log it.
    }

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

    console.log(`Kundli record saved successfully for user: ${user.id}, name: ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Kundli record saved successfully',
      record: data
    });

  } catch (error) {
    console.error('Error in save-kundli:', error);
    return NextResponse.json({
      error: 'Failed to save Kundli record',
      details: error.message
    }, { status: 500 });
  }
}
