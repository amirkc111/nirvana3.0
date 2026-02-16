import { getRashifal } from 'hamro-patro-scraper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic'; // Ensure Next.js doesn't statically cache the route handler itself

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sign = searchParams.get('sign');
  const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly, yearly

  // hamro-patro-scraper expects these exact English slugs
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

  if (!sign) {
    return Response.json({ error: 'Missing sign parameter' }, { status: 400 });
  }

  const signSlug = SIGN_MAP[sign] || sign.toLowerCase();

  // Create reverse map for English -> Nepali lookup
  const ENGLISH_TO_NEPALI = Object.entries(SIGN_MAP).reduce((acc, [nepali, english]) => {
    acc[english] = nepali;
    return acc;
  }, {});

  const nepaliSign = ENGLISH_TO_NEPALI[sign.toLowerCase()] || sign;

  try {
    // 1. Generate Cache Key
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const cacheKey = `${period}-${dateKey}`;

    // 2. Check Cache
    if (supabaseAdmin) {
      const { data: cachedEntry, error: cacheError } = await supabaseAdmin
        .from('horoscope_cache')
        .select('data')
        .eq('period', period)
        .eq('cache_key', cacheKey)
        .single();

      if (cachedEntry && !cacheError) {
        console.log(`[Cache Hit] Serving ${period} horoscope from DB.`);
        const data = cachedEntry.data;
        if (sign === 'all' || !sign) {
          return Response.json({ rashifal: data, time_period: period, cached: true });
        }
        return await serveResponse(data, sign, nepaliSign, signSlug, period, true);
      }
    }

    // 3. Cache Miss - Fetch from Source
    console.log(`[Cache Miss] Fetching ${period} horoscope from Scraper...`);
    const response = await getRashifal(period);

    // 4. Return Response
    let result;
    if (sign === 'all' || !sign) {
      result = Response.json({ rashifal: response, time_period: period, cached: false });
    } else {
      result = await serveResponse(response, sign, nepaliSign, signSlug, period, false);
    }

    // 5. Save to Cache (after serveResponse might have updated one item with full text)
    if (supabaseAdmin && response && response.length > 0) {
      await supabaseAdmin
        .from('horoscope_cache')
        .upsert({
          period,
          cache_key: cacheKey,
          data: response
        }, { onConflict: 'period, cache_key' });
    }

    return result;

  } catch (error) {
    console.error('Scraper error:', error);
    return Response.json({ rashifal: 'राशिफल लोड गर्न सकिएन।' }, { status: 500 });
  }
}

async function fetchFullText(period, signSlug) {
  try {
    const url = `https://www.hamropatro.com/rashifal/${period}/${signSlug}`;
    console.log(`[Backfill] Fetching full text from: ${url}`);
    const { data } = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    const $ = cheerio.load(data);
    const text = $('.desc p').first().text().trim();
    return text.replace(/\s*More\.\.\.\s*$/i, ''); // Remove trailing More... if any
  } catch (error) {
    console.error(`[Backfill Error] Failed for ${signSlug}:`, error.message);
    return null;
  }
}

// Helper to filter and return the specific sign's data
async function serveResponse(data, sign, nepaliSign, signSlug, period, isCached) {
  const predictionData = data.find(item =>
    (item.name && (item.name === nepaliSign || (item.name.includes && item.name.includes(nepaliSign)))) ||
    (item.url && item.url.includes && item.url.includes(signSlug))
  );

  if (!predictionData) {
    return Response.json({
      rashifal: 'राशिफल डाटा फेला परेन।',
      debug_sign: sign,
      debug_period: period
    }, { status: 404 });
  }

  // If text is truncated (ends with More...) and it's not daily, fetch the full version
  if ((period !== 'daily' || predictionData.text.includes('More...')) && predictionData.text.length < 500) {
    const fullText = await fetchFullText(period, signSlug);
    if (fullText) {
      predictionData.text = fullText;
      // We update the object in the original 'data' array so the caller (GET) caches the full version
    }
  }

  return Response.json({
    rashifal: predictionData.text,
    time_period: period,
    cached: isCached
  });
}
