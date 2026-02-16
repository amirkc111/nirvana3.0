import { getHoroscope } from 'hamro-patro-scraper';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SIGN_MAP = {
  'मेष': 'mesh',
  'वृष': 'brish',
  'मिथुन': 'mithun',
  'कर्कट': 'karkat',
  'सिंह': 'singha',
  'कन्या': 'kanya',
  'तुला': 'tula',
  'वृश्चिक': 'brischik',
  'धनु': 'dhanu',
  'मकर': 'makar',
  'कुम्भ': 'kumbh',
  'मीन': 'meen',
};

async function fetchHoroscopeData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`Fetching horoscope data for ${today}`);
  
  try {
    console.log('Fetching daily horoscope data from hamro-patro-scraper...');
    
    // Fetch all horoscope data at once using the package
    const horoscopeData = await getHoroscope('daily');
    
    if (!horoscopeData || !Array.isArray(horoscopeData)) {
      throw new Error('No horoscope data received');
    }
    
    console.log(`Received ${horoscopeData.length} horoscope entries`);
    
    // Process each horoscope entry
    for (const entry of horoscopeData) {
      try {
        const nepaliName = entry.name;
        const prediction = entry.text;
        
        if (prediction && nepaliName) {
          const { error } = await supabase
            .from('horoscope_data')
            .upsert({
              sign_name: nepaliName,
              sign_slug: SIGN_MAP[nepaliName] || nepaliName.toLowerCase(),
              prediction_text: prediction,
              date: today,
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error(`Database error for ${nepaliName}:`, error);
          } else {
            console.log(`✅ Successfully saved ${nepaliName}`);
          }
        } else {
          console.log(`❌ No prediction found for ${nepaliName}`);
        }
      } catch (entryError) {
        console.error(`❌ Error processing entry:`, entryError.message);
      }
    }
    
    console.log('Horoscope data fetch completed!');
    
  } catch (error) {
    console.error('❌ Error fetching horoscope data:', error.message);
    console.log('Falling back to manual scraping...');
    
    // Fallback to manual scraping if package fails
    await fallbackManualScraping(supabase, today);
  }
}

async function fallbackManualScraping(supabase, today) {
  console.log('Using fallback manual scraping method...');
  // This would be the old manual scraping code as backup
  console.log('Manual scraping not implemented as fallback');
}

// Run the function
fetchHoroscopeData().catch(console.error);
