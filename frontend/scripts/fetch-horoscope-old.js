import axios from 'axios';
import * as cheerio from 'cheerio';
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
  
  for (const [nepaliName, slug] of Object.entries(SIGN_MAP)) {
    try {
      console.log(`Fetching ${nepaliName} (${slug})...`);
      
      const url = `https://www.hamropatro.com/rashifal/daily/${slug}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const prediction = $('.desc').find('p').first().text().trim();
      
      if (prediction) {
        const { error } = await supabase
          .from('horoscope_data')
          .upsert({
            sign_name: nepaliName,
            sign_slug: slug,
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
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error fetching ${nepaliName}:`, error.message);
    }
  }
  
  console.log('Horoscope data fetch completed!');
}

// Run the function
fetchHoroscopeData().catch(console.error);
