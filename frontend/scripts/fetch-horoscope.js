import { getRashifal } from 'hamro-patro-scraper';
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
  const timePeriods = ['daily', 'weekly', 'monthly', 'yearly'];

  console.log(`Fetching horoscope data for ${today}`);

  for (const timePeriod of timePeriods) {
    try {
      console.log(`\n📅 Fetching ${timePeriod} horoscope data from hamro-patro-scraper...`);

      // Fetch horoscope data for the specific time period using getRashifal
      const horoscopeData = await getRashifal(timePeriod);

      if (!horoscopeData || !Array.isArray(horoscopeData)) {
        console.log(`❌ No ${timePeriod} horoscope data received`);
        continue;
      }

      console.log(`📊 Received ${horoscopeData.length} ${timePeriod} horoscope entries`);

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
                time_period: timePeriod,
                updated_at: new Date().toISOString()
              });

            if (error) {
              console.error(`Database error for ${nepaliName} (${timePeriod}):`, error);
            } else {
              console.log(`✅ Successfully saved ${nepaliName} (${timePeriod})`);
            }
          } else {
            console.log(`❌ No prediction found for ${nepaliName} (${timePeriod})`);
          }
        } catch (entryError) {
          console.error(`❌ Error processing ${timePeriod} entry:`, entryError.message);
        }
      }

      console.log(`✅ ${timePeriod} horoscope data fetch completed!`);

      // Add delay between different time periods
      if (timePeriod !== 'yearly') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`❌ Error fetching ${timePeriod} horoscope data:`, error.message);
    }
  }

  console.log('\n🎉 All horoscope data fetch completed!');
}

async function fallbackManualScraping(supabase, today) {
  console.log('Using fallback manual scraping method...');
  // This would be the old manual scraping code as backup
  console.log('Manual scraping not implemented as fallback');
}

// Run the function
fetchHoroscopeData().catch(console.error);
