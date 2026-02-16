export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    // 1. First, check if data exists in Supabase
    const { data: cachedData, error: cacheError } = await supabase
      .from('panchang_data')
      .select('*')
      .eq('date', date)
      .single();

    if (cachedData && !cacheError) {
      console.log(`✅ Using cached panchang data for ${date}`);
      return Response.json({ panchang: formatPanchangResponse(cachedData) });
    }

    // 2. data not in cache, try fetching from the astronomical Python API
    try {
      console.log(`🚀 Fetching real astronomical data from Python API for ${date}`);
      const [year, month, day] = date.split('-').map(Number);

      // Use Docker service name if running in container, otherwise localhost
      // port 5002 is for the Precise/Working Panchang API which has more data
      const apiHost = process.env.PANCHANG_API_URL || 'http://localhost:5002';
      const pyRes = await fetch(`${apiHost}/api/panchang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day })
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        console.log(`✅ Received real data from Python API for ${date}`);

        // Return directly - the Python API already returns the structure we need
        return Response.json({ panchang: pyData });
      }
      console.warn('⚠️ Python API returned error, falling back to mock...');
    } catch (apiErr) {
      console.error('❌ Failed to connect to Python Panchang API:', apiErr.message);
    }

    // 3. Fallback to simplified generation if both cache and Python API fail
    console.log(`Calculating approximate panchang data for date: ${date}`);
    const panchangData = generatePanchangDataForDate(date);

    return Response.json({ panchang: formatPanchangResponse(panchangData) });
  } catch (error) {
    console.error('Final API error:', error);
    return Response.json({ error: 'Failed to fetch Panchang data' }, { status: 500 });
  }
}

// Extraction helper to ensure response format is consistent
function formatPanchangResponse(data) {
  if (data.tithi && typeof data.tithi === 'object') return data; // Already formatted

  // Convert flat DB structure or mock structure to nested frontend structure
  return {
    tithi: {
      name: data.tithi_name,
      english: data.tithi_english,
      paksha: data.tithi_paksha,
      start: data.tithi_start,
      end: data.tithi_end,
      end_time: data.tithi_end ? new Date(data.tithi_end).toLocaleTimeString('en-US', { hour12: false }) : '',
      next: data.next_tithi_name,
      lunarPhase: data.tithi_lunar_phase
    },
    nakshatra: {
      name: data.nakshatra_name,
      english: data.nakshatra_english,
      lord: data.nakshatra_lord,
      symbol: data.nakshatra_symbol,
      start: data.nakshatra_start,
      end: data.nakshatra_end,
      end_time: data.nakshatra_end ? new Date(data.nakshatra_end).toLocaleTimeString('en-US', { hour12: false }) : '',
      next: data.next_nakshatra_name
    },
    yoga: {
      name: data.yoga_name,
      english: data.yoga_english,
      end: data.yoga_end,
      end_time: data.yoga_end ? new Date(data.yoga_end).toLocaleTimeString('en-US', { hour12: false }) : '',
      next: data.next_yoga_name
    },
    karana: {
      name: data.karana_name,
      english: data.karana_english,
      type: data.karana_type,
      end: data.karana_end,
      end_time: data.karana_end ? new Date(data.karana_end).toLocaleTimeString('en-US', { hour12: false }) : '',
    },
    calendar: {
      date: data.date,
      hinduMonth: data.hindu_month,
      paksha: data.paksha,
      season: data.season,
      ayana: data.ayana, // Added Ayana
      dayDuration: data.day_duration // Added Dinaman
    },
    era: {
      vikrama: data.vikrama_samvat?.toString(),
      shaka: data.shaka_samvat?.toString(),
      kali: data.kali_yuga?.toString(),
      nepal: data.nepal_sambat?.toString(), // Added Nepal Sambat
      nepal_month: data.nepal_month,
      traditional_nepali_date: data.era?.traditional_nepali_date || `${data.vikrama_samvat} विक्रम सम्वत्`
    },
    planetary: data.planetary || {
      moonSign: {
        name: data.moon_sign_name,
        english: data.moon_sign_english,
        end: data.moon_sign_end,
        next: data.next_moon_sign_name
      }
    },
    timings: {
      sunrise: data.sunrise_time,
      sunset: data.sunset_time,
      moonrise: data.moonrise_time,
      moonset: data.moonset_time,
      moonPhase: data.moon_phase
    },
    additionalTimings: data.additionalTimings || {
      rahuKalam: 'Calculating...',
      yamaganda: 'Calculating...',
      gulikaKalam: 'Calculating...'
    }
  };
}

// Helper function to generate panchang data for any date (Fallback)
function generatePanchangDataForDate(dateStr) {
  const today = new Date(dateStr);
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

  const tithis = [
    { name: 'नवमीं', english: 'Navami', paksha: 'Shukla' },
    { name: 'दशमीं', english: 'Dashami', paksha: 'Shukla' },
    { name: 'एकादशी', english: 'Ekadashi', paksha: 'Shukla' },
    { name: 'द्वादशी', english: 'Dwadashi', paksha: 'Shukla' },
    { name: 'त्रयोदशी', english: 'Trayodashi', paksha: 'Shukla' },
    { name: 'चतुर्दशी', english: 'Chaturdashi', paksha: 'Shukla' },
    { name: 'पूर्णिमा', english: 'Purnima', paksha: 'Shukla' },
    { name: 'प्रतिपदा', english: 'Pratipada', paksha: 'Krishna' },
    { name: 'द्वितीया', english: 'Dwitiya', paksha: 'Krishna' },
    { name: 'तृतीया', english: 'Tritiya', paksha: 'Krishna' },
    { name: 'चतुर्थी', english: 'Chaturthi', paksha: 'Krishna' },
    { name: 'पंचमी', english: 'Panchami', paksha: 'Krishna' },
    { name: 'षष्ठी', english: 'Shashthi', paksha: 'Krishna' },
    { name: 'सप्तमी', english: 'Saptami', paksha: 'Krishna' },
    { name: 'अष्टमी', english: 'Ashtami', paksha: 'Krishna' }
  ];

  const nakshatras = [
    { name: 'पू.षाढ़ा', english: 'PurvaShadha', lord: 'Venus', symbol: 'पू.षाढ़ा' },
    { name: 'उ.षाढ़ा', english: 'UttaraShadha', lord: 'Sun', symbol: 'उ.षाढ़ा' },
    { name: 'श्रवण', english: 'Shravana', lord: 'Moon', symbol: 'श्रवण' },
    { name: 'धनिष्ठा', english: 'Dhanishtha', lord: 'Mars', symbol: 'धनिष्ठा' },
    { name: 'शतभिषा', english: 'Shatabhisha', lord: 'Rahu', symbol: 'शतभिषा' },
    { name: 'पू.भाद्रपद', english: 'PurvaBhadrapada', lord: 'Jupiter', symbol: 'पू.भाद्रपद' },
    { name: 'उ.भाद्रपद', english: 'UttaraBhadrapada', lord: 'Saturn', symbol: 'उ.भाद्रपद' },
    { name: 'रेवती', english: 'Revati', lord: 'Mercury', symbol: 'रेवती' },
    { name: 'अश्विनी', english: 'Ashwini', lord: 'Ketu', symbol: 'अश्विनी' },
    { name: 'भरणी', english: 'Bharani', lord: 'Venus', symbol: 'भरणी' }
  ];

  const yogas = [
    { name: 'अतिगण्ड', english: 'Atiganda' },
    { name: 'सुकर्मा', english: 'Sukarma' },
    { name: 'धृति', english: 'Dhriti' },
    { name: 'शूल', english: 'Shoola' },
    { name: 'गण्ड', english: 'Ganda' },
    { name: 'वृद्धि', english: 'Vriddhi' },
    { name: 'ध्रुव', english: 'Dhruva' },
    { name: 'व्याघात', english: 'Vyaghata' },
    { name: 'हर्षण', english: 'Harshana' },
    { name: 'वज्र', english: 'Vajra' },
    { name: 'सिद्धि', english: 'Siddhi' },
    { name: 'व्यतिपात', english: 'Vyatipata' }
  ];

  const karanas = [
    { name: 'विष्टि', english: 'Vishti', type: 'Chara' },
    { name: 'बव', english: 'Bava', type: 'Chara' },
    { name: 'बालव', english: 'Balava', type: 'Chara' },
    { name: 'कौलव', english: 'Kaulava', type: 'Chara' },
    { name: 'तैतिल', english: 'Taitila', type: 'Chara' }
  ];

  const moonSigns = [
    { name: 'कुम्भ', english: 'Aquarius', symbol: '♒' },
    { name: 'मीन', english: 'Pisces', symbol: '♓' },
    { name: 'मेष', english: 'Aries', symbol: '♈' },
    { name: 'वृष', english: 'Taurus', symbol: '♉' }
  ];

  const hinduMonths = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
  const seasons = ['Vasanta (Spring)', 'Grishma (Summer)', 'Varsha (Monsoon)', 'Sharad (Autumn)', 'Hemanta (Pre-winter)', 'Shishira (Winter)'];

  const tithiIdx = dayOfYear % tithis.length;
  const tithi = tithis[tithiIdx];
  const nextTithi = tithis[(tithiIdx + 1) % tithis.length];

  const nakshatraIdx = dayOfYear % nakshatras.length;
  const nakshatra = nakshatras[nakshatraIdx];
  const nextNakshatra = nakshatras[(nakshatraIdx + 1) % nakshatras.length];

  const yogaIdx = dayOfYear % yogas.length;
  const yoga = yogas[yogaIdx];
  const nextYoga = yogas[(yogaIdx + 1) % yogas.length];

  const karanaIdx = dayOfYear % karanas.length;
  const karana = karanas[karanaIdx];

  const moonSignIdx = dayOfYear % moonSigns.length;
  const moonSign = moonSigns[moonSignIdx];
  const nextMoonSign = moonSigns[(moonSignIdx + 1) % moonSigns.length];

  const hinduMonth = hinduMonths[dayOfYear % hinduMonths.length];
  const season = seasons[Math.floor(dayOfYear / 60) % seasons.length];

  // Generate times
  const sunrise = new Date(today);
  sunrise.setHours(6, 53, 0, 0);
  const sunset = new Date(today);
  sunset.setHours(17, 16, 0, 0);

  const moonrise = new Date(today);
  moonrise.setHours(11, 3, 0, 0);
  const moonset = new Date(today);
  moonset.setHours(23, 12, 0, 0);

  // Set randomized end times for "upto" logic
  const tithiEnd = new Date(today);
  tithiEnd.setHours(13, 56, 9, 0);

  const nakshatraEnd = new Date(today);
  nakshatraEnd.setHours(9, 14, 36, 0);

  const yogaEnd = new Date(today);
  yogaEnd.setHours(14, 13, 27, 0);

  const karanaEnd = new Date(today);
  karanaEnd.setHours(13, 56, 9, 0);

  const moonSignEnd = new Date(today);
  moonSignEnd.setHours(27, 25, 21, 0); // Next day early morning

  return {
    date: dateStr,
    tithi_name: tithi.name,
    tithi_english: tithi.english,
    tithi_paksha: tithi.paksha,
    tithi_start: sunrise.toISOString(),
    tithi_end: tithiEnd.toISOString(),
    next_tithi_name: nextTithi.name,
    tithi_lunar_phase: `${101 + (dayOfYear % 30)}°`,

    nakshatra_name: nakshatra.name,
    nakshatra_english: nakshatra.english,
    nakshatra_lord: nakshatra.lord,
    nakshatra_symbol: nakshatra.symbol,
    nakshatra_start: sunrise.toISOString(),
    nakshatra_end: nakshatraEnd.toISOString(),
    next_nakshatra_name: nextNakshatra.name,

    yoga_name: yoga.name,
    yoga_english: yoga.english,
    yoga_end: yogaEnd.toISOString(),
    next_yoga_name: nextYoga.name,

    karana_name: karana.name,
    karana_english: karana.english,
    karana_type: karana.type,
    karana_end: karanaEnd.toISOString(),

    moon_sign_name: `${moonSign.name} ${moonSign.symbol}`,
    moon_sign_english: moonSign.english,
    next_moon_sign_name: `${nextMoonSign.name} ${nextMoonSign.symbol}`,
    moon_sign_end: moonSignEnd.toISOString(),

    planetary: {
      sun: { sign: 'Libra', longitude: '08:22°' },
      moon: { sign: moonSign.english, longitude: '12:45°' },
      mars: { sign: 'Gemini', longitude: '15:10°' },
      mercury: { sign: 'Virgo', longitude: '22:30°' },
      jupiter: { sign: 'Taurus', longitude: '05:15°' },
      venus: { sign: 'Leo', longitude: '18:50°' },
      saturn: { sign: 'Aquarius', longitude: '11:20°' },
      rahu: { sign: 'Pisces', longitude: '25:40°' },
      ketu: { sign: 'Virgo', longitude: '25:40°' },
      aspects: {
        sunMoon: 'Conjunction',
        marsJupiter: 'Trine',
        venusMercury: 'Sextile'
      }
    },

    hindu_month: hinduMonth,
    paksha: `${hinduMonth} ${tithi.paksha} Paksha`,
    season: 'हेमन्त - Pre-winter', // Static for now as per request example
    ayana: 'दक्षिणायन',
    day_duration: '25 घडी 57 पला - 10hr 23min',

    vikrama_samvat: 2082,
    shaka_samvat: 1947,
    kali_yuga: 5126,
    nepal_sambat: 1146,
    nepal_month: 'पोहेलाथ्व',

    sunrise_time: '6:53',
    sunset_time: '17:16',
    moonrise_time: '11:03 AM',
    moonset_time: '11:12 PM',
    moon_phase: 'Waxing Crescent'
  };
}
