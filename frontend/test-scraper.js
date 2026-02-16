
import { getRashifal } from 'hamro-patro-scraper';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScraper() {
    console.time('getRashifal-daily');
    try {
        const results = await getRashifal('daily');
        console.timeEnd('getRashifal-daily');
        console.log('Results count:', results.length);
    } catch (err) {
        console.error('getRashifal error:', err);
    }

    const signSlug = 'mesh';
    const period = 'daily';
    const url = `https://www.hamropatro.com/rashifal/${period}/${signSlug}`;
    console.time('fetchFullText-mesh');
    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        const text = $('.desc p').first().text().trim();
        console.timeEnd('fetchFullText-mesh');
        console.log('Full text length:', text.length);
    } catch (err) {
        console.error('fetchFullText error:', err.message);
    }
}

testScraper();
