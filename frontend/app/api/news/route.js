
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET() {
    try {
        // Target: Times of India Astrology Section
        const url = 'https://timesofindia.indiatimes.com/astrology';

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const newsItems = [];

        // Select news items
        // Strategy: Look for common article card structures
        $('.col_l_6, .col_l_4, .w_100, figure, .articles, .listing4').each((i, element) => {
            // De-duplicate: check if we already have this link
            const linkTag = $(element).find('a').first();
            let link = linkTag.attr('href');

            if (!link) return;
            if (!link.startsWith('http')) {
                link = `https://timesofindia.indiatimes.com${link}`;
            }

            if (newsItems.some(item => item.url === link)) return;
            if (newsItems.length >= 36) return; // Fetch more items for pagination

            const figure = $(element);
            const imgTag = figure.find('img').first();

            let title = linkTag.attr('title') || imgTag.attr('alt') || $(element).find('.heading').text() || $(element).find('.title').text() || '';
            title = title.trim();

            // Robust image finding
            let image = imgTag.attr('data-src') ||
                imgTag.attr('data-original') ||
                imgTag.attr('src') ||
                $(element).find('source').attr('srcset');

            // Fallback: Try to find image in parent if not in current element
            if (!image) {
                image = $(element).parents('.col_l_6').find('img').attr('data-src');
            }

            // Summary extraction
            let summary = $(element).find('.synopsis').text() ||
                $(element).find('p').first().text() ||
                '';

            if (title && link && title.length > 10) {
                newsItems.push({
                    title,
                    url: link,
                    image: image || 'https://static.toiimg.com/photo/msid-109536838/109536838.jpg', // Better generic fallback
                    source: 'Times of India',
                    summary: summary.trim().substring(0, 150) + (summary.length > 150 ? '...' : ''),
                    date: new Date().toISOString()
                });
            }
        });

        return NextResponse.json({
            success: true,
            news: newsItems
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch news',
            details: error.message
        }, { status: 500 });
    }
}
