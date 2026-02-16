import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample Panchang data generator (in real implementation, this would fetch from an API)
function generatePanchangData(date) {
  const today = new Date(date);
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Rotate through different Panchang elements based on day of year
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
    { name: 'भरणी', english: 'Bharani', lord: 'Venus', symbol: 'भरणी' },
    { name: 'कृत्तिका', english: 'Krittika', lord: 'Sun', symbol: 'कृत्तिका' },
    { name: 'रोहिणी', english: 'Rohini', lord: 'Moon', symbol: 'रोहिणी' },
    { name: 'मृगशिरा', english: 'Mrigashira', lord: 'Mars', symbol: 'मृगशिरा' },
    { name: 'आर्द्रा', english: 'Ardra', lord: 'Rahu', symbol: 'आर्द्रा' },
    { name: 'पुनर्वसु', english: 'Punarvasu', lord: 'Jupiter', symbol: 'पुनर्वसु' },
    { name: 'पुष्य', english: 'Pushya', lord: 'Saturn', symbol: 'पुष्य' },
    { name: 'अश्लेषा', english: 'Ashlesha', lord: 'Mercury', symbol: 'अश्लेषा' },
    { name: 'मघा', english: 'Magha', lord: 'Ketu', symbol: 'मघा' },
    { name: 'पू.फाल्गुनी', english: 'PurvaPhalguni', lord: 'Venus', symbol: 'पू.फाल्गुनी' },
    { name: 'उ.फाल्गुनी', english: 'UttaraPhalguni', lord: 'Sun', symbol: 'उ.फाल्गुनी' },
    { name: 'हस्त', english: 'Hasta', lord: 'Moon', symbol: 'हस्त' },
    { name: 'चित्रा', english: 'Chitra', lord: 'Mars', symbol: 'चित्रा' },
    { name: 'स्वाती', english: 'Swati', lord: 'Rahu', symbol: 'स्वाती' },
    { name: 'विशाखा', english: 'Vishakha', lord: 'Jupiter', symbol: 'विशाखा' },
    { name: 'अनुराधा', english: 'Anuradha', lord: 'Saturn', symbol: 'अनुराधा' },
    { name: 'ज्येष्ठा', english: 'Jyeshtha', lord: 'Mercury', symbol: 'ज्येष्ठा' },
    { name: 'मूल', english: 'Mula', lord: 'Ketu', symbol: 'मूल' }
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
    { name: 'व्यतिपात', english: 'Vyatipata' },
    { name: 'वरीयान', english: 'Variyan' },
    { name: 'परिघ', english: 'Parigha' },
    { name: 'शिव', english: 'Shiva' },
    { name: 'सिद्ध', english: 'Siddha' },
    { name: 'साध्य', english: 'Sadhya' },
    { name: 'शुभ', english: 'Shubha' },
    { name: 'शुक्ल', english: 'Shukla' },
    { name: 'ब्रह्म', english: 'Brahma' },
    { name: 'इन्द्र', english: 'Indra' },
    { name: 'वैधृति', english: 'Vaidhriti' },
    { name: 'विष्कुम्भ', english: 'Vishkumbha' },
    { name: 'प्रीति', english: 'Preeti' },
    { name: 'आयुष्मान', english: 'Ayushman' },
    { name: 'सौभाग्य', english: 'Saubhagya' },
    { name: 'शोभन', english: 'Shobhana' }
  ];

  const karanas = [
    { name: 'विष्टि', english: 'Vishti', type: 'Chara' },
    { name: 'बव', english: 'Bava', type: 'Chara' },
    { name: 'बालव', english: 'Balava', type: 'Chara' },
    { name: 'कौलव', english: 'Kaulava', type: 'Chara' },
    { name: 'तैतिल', english: 'Taitila', type: 'Chara' },
    { name: 'गर', english: 'Gara', type: 'Chara' },
    { name: 'वणिज', english: 'Vanija', type: 'Chara' },
    { name: 'किंस्तुघ्न', english: 'Kinstughna', type: 'Chara' },
    { name: 'शकुनि', english: 'Shakuni', type: 'Sthira' },
    { name: 'चतुष्पाद', english: 'Chatushpada', type: 'Sthira' },
    { name: 'नाग', english: 'Naga', type: 'Sthira' },
    { name: 'किंस्तुघ्न', english: 'Kinstughna', type: 'Sthira' }
  ];

  const hinduMonths = [
    'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
    'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
    'Margashirsha', 'Pausha', 'Magha', 'Phalguna'
  ];

  const seasons = [
    'Vasanta (Spring)', 'Grishma (Summer)', 'Varsha (Monsoon)',
    'Sharad (Autumn)', 'Hemanta (Pre-winter)', 'Shishira (Winter)'
  ];

  const tithi = tithis[dayOfYear % tithis.length];
  const nakshatra = nakshatras[dayOfYear % nakshatras.length];
  const yoga = yogas[dayOfYear % yogas.length];
  const karana = karanas[dayOfYear % karanas.length];
  const hinduMonth = hinduMonths[dayOfYear % hinduMonths.length];
  const season = seasons[Math.floor(dayOfYear / 60) % seasons.length];

  // Generate times
  const sunrise = new Date(today);
  sunrise.setHours(6, 15 + (dayOfYear % 30), 0, 0);
  
  const sunset = new Date(today);
  sunset.setHours(18, 30 + (dayOfYear % 30), 0, 0);
  
  const moonrise = new Date(today);
  moonrise.setHours(20, 45 + (dayOfYear % 60), 0, 0);
  
  const moonset = new Date(today);
  moonset.setHours(9, 30 + (dayOfYear % 60), 0, 0);

  const tithiStart = new Date(today);
  tithiStart.setHours(6, 6 + (dayOfYear % 60), 0, 0);
  
  const tithiEnd = new Date(today);
  tithiEnd.setDate(tithiEnd.getDate() + 1);
  tithiEnd.setHours(7, 1 + (dayOfYear % 60), 0, 0);

  const nakshatraStart = new Date(today);
  nakshatraStart.setHours(8, 1 + (dayOfYear % 60), 0, 0);
  
  const nakshatraEnd = new Date(today);
  nakshatraEnd.setDate(nakshatraEnd.getDate() + 1);
  nakshatraEnd.setHours(9, 47 + (dayOfYear % 60), 0, 0);

  const yogaEnd = new Date(today);
  yogaEnd.setDate(yogaEnd.getDate() + 2);
  yogaEnd.setHours(3, 38 + (dayOfYear % 60), 0, 0);

  return {
    date: today.toISOString().split('T')[0],
    tithi_name: tithi.name,
    tithi_english: tithi.english,
    tithi_paksha: tithi.paksha,
    tithi_start: tithiStart.toISOString(),
    tithi_end: tithiEnd.toISOString(),
    tithi_lunar_phase: `${101 + (dayOfYear % 30)}°`,
    nakshatra_name: nakshatra.name,
    nakshatra_english: nakshatra.english,
    nakshatra_lord: nakshatra.lord,
    nakshatra_symbol: nakshatra.symbol,
    nakshatra_start: nakshatraStart.toISOString(),
    nakshatra_end: nakshatraEnd.toISOString(),
    yoga_name: yoga.name,
    yoga_english: yoga.english,
    yoga_end: yogaEnd.toISOString(),
    karana_name: karana.name,
    karana_english: karana.english,
    karana_type: karana.type,
    hindu_month: hinduMonth,
    paksha: tithi.paksha,
    season: season,
    vikrama_samvat: 2069 + Math.floor(dayOfYear / 365),
    shaka_samvat: 1934 + Math.floor(dayOfYear / 365),
    kali_yuga: 5113 + Math.floor(dayOfYear / 365),
    sunrise_time: sunrise.toTimeString().split(' ')[0],
    sunset_time: sunset.toTimeString().split(' ')[0],
    moonrise_time: moonrise.toTimeString().split(' ')[0],
    moonset_time: moonset.toTimeString().split(' ')[0],
    moon_phase: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'][dayOfYear % 8]
  };
}

async function fetchPanchangData() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Fetching Panchang data for ${today}`);

  try {
    console.log('Generating Panchang data...');
    
    // Generate Panchang data for today
    const panchangData = generatePanchangData(today);
    
    console.log(`Generated Panchang data for ${today}`);
    console.log(`Tithi: ${panchangData.tithi_name} (${panchangData.tithi_english})`);
    console.log(`Nakshatra: ${panchangData.nakshatra_name} (${panchangData.nakshatra_english})`);
    console.log(`Yoga: ${panchangData.yoga_name} (${panchangData.yoga_english})`);
    console.log(`Karana: ${panchangData.karana_name} (${panchangData.karana_english})`);

    // Insert/update data in database
    const { error } = await supabase
      .from('panchang_data')
      .upsert(panchangData);
    
    if (error) {
      console.error('Database error:', error);
    } else {
      console.log(`✅ Successfully saved Panchang data for ${today}`);
    }
    
  } catch (error) {
    console.error(`❌ Error generating Panchang data:`, error.message);
  }
  
  console.log('Panchang data fetch completed!');
}

// Run the function
fetchPanchangData().catch(console.error);
