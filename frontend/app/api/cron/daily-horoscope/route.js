import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail } from '@/lib/emailService';
import { getDailyGuidance } from '@/lib/dailyMantra';
import { getRashifal } from 'hamro-patro-scraper';

const ZODIAC_MAP = {
    'Aries': { nepali: 'मेष', slug: 'mesh' },
    'Taurus': { nepali: 'वृष', slug: 'brish' },
    'Gemini': { nepali: 'मिथुन', slug: 'mithun' },
    'Cancer': { nepali: 'कर्कट', slug: 'karkat' },
    'Leo': { nepali: 'सिंह', slug: 'singha' },
    'Virgo': { nepali: 'कन्या', slug: 'kanya' },
    'Libra': { nepali: 'तुला', slug: 'tula' },
    'Scorpio': { nepali: 'वृश्चिक', slug: 'brischik' },
    'Sagittarius': { nepali: 'धनु', slug: 'dhanu' },
    'Capricorn': { nepali: 'मकर', slug: 'makar' },
    'Aquarius': { nepali: 'कुम्भ', slug: 'kumbh' },
    'Pisces': { nepali: 'मीन', slug: 'meen' }
};

// Fetch real horoscopes from Hamro Patro
async function fetchRealHoroscopes() {
    try {
        const response = await getRashifal('daily');
        const horoscopeMap = {};

        // Map scraper results to our English keys
        for (const [englishSign, names] of Object.entries(ZODIAC_MAP)) {
            const match = response.find(item =>
                (item.name && item.name.includes(names.nepali)) ||
                (item.url && item.url.includes(names.slug))
            );

            if (match) {
                horoscopeMap[englishSign] = match.text // usually in Nepali
                    .replace('(साभार : हाम्रो पात्रो)', '') // Clean up source text if present
                    .trim();
            }
        }
        return horoscopeMap;
    } catch (error) {
        console.error("Scraper Error:", error);
        return null;
    }
}

export async function GET(request) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.warn("⚠️ Cron Triggered without secret!");
    }

    // 2. Get Daily specific data
    const guidance = getDailyGuidance();

    // 3. Fetch Real Content
    const horoscopes = await fetchRealHoroscopes();

    if (!horoscopes) {
        return NextResponse.json({ success: false, error: "Failed to fetch horoscope data" }, { status: 500 });
    }

    // 4. Fetch Users & Preferences
    let users = [];
    let preferences = [];

    if (supabaseAdmin) {
        // A. Get Users
        const { data: authUsers, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) console.error("Failed to list users:", userError);
        else users = authUsers.users;

        // B. Get Preferences
        const { data: prefs, error: prefError } = await supabaseAdmin
            .from('user_preferences')
            .select('user_id, zodiac_sign_english');

        if (prefError) console.error("Failed to fetch preferences:", prefError);
        else preferences = prefs;
    }

    // Map preferences for O(1) lookup
    const userSignMap = {};
    if (preferences) {
        preferences.forEach(p => {
            if (p.user_id && p.zodiac_sign_english) {
                userSignMap[p.user_id] = p.zodiac_sign_english;
            }
        });
    }

    // Mock for dev if empty & SMTP configured
    if (users.length === 0 && process.env.SMTP_USER) {
        users.push({ email: process.env.SMTP_USER, id: 'admin-test' });
        // Assume default test user might want Scropio or similar for testing
        userSignMap['admin-test'] = 'Scorpio';
    }

    // 5. Send Emails
    let sentCount = 0;
    const deliveryLogs = [];

    for (const user of users) {
        if (!user.email) continue;

        const userSign = userSignMap[user.id];

        if (!userSign || !horoscopes[userSign]) {
            console.log(`Skipping user ${user.email} - No Zodiac preference found.`);
            continue;
        }

        const message = horoscopes[userSign];
        const titleSuffix = `for ${userSign}`;

        // Generate Mantra Section HTML (Iterate over all)
        const mantrasHtml = guidance.mantras.map(m => `
            <div style="margin-bottom: 15px; border-bottom: 1px dashed #fbcfe8; padding-bottom: 10px;">
                <p style="font-size: 16px; font-weight: bold; color: #831843; margin: 5px 0;">"${m.mantra}"</p>
                <p style="font-size: 13px; color: #be185d; margin: 0;"><strong>${m.deity}:</strong> ${m.significance}</p>
            </div>
        `).join('');

        const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6d28d9; text-align: center;">🌅 Good Morning from Nirvana Astro</h2>
        
        <div style="background-color: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4c1d95;">🌅 Morning Wish</h3>
          <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
            Good Morning! Wishing you a blessed ${guidance.day} filled with the grace of ${guidance.deities.join(' & ')}. May your day be as bright and powerful as your spirit.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">

          <h3 style="margin-top: 0; color: #4c1d95;">Daily Horoscope ${titleSuffix}</h3>
          <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>

        <h3 style="color: #db2777; border-bottom: 2px solid #fce7f3; padding-bottom: 5px;">📅 Today's Spiritual Focus: ${guidance.day}</h3>
        <p><strong>Deities:</strong> ${guidance.deities.join(', ')}</p>

        <div style="background-color: #fff1f2; border-left: 4px solid #db2777; padding: 15px; margin-top: 20px;">
          <h4 style="margin-top: 0; color: #9d174d;">✨ Recommended Mantras</h4>
          ${mantrasHtml}
        </div>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
          May your day be blessed with clarity and joy.<br>
          - Team Nirvana
        </p>
      </div>
    `;

        const result = await sendEmail({
            to: user.email,
            subject: `🌅 Daily Horoscope ${titleSuffix} & Mantra`,
            html: emailHtml
        });

        if (result.success) {
            sentCount++;
        } else {
            deliveryLogs.push({ email: user.email, error: result.error });
        }
    }

    return NextResponse.json({
        success: true,
        day: guidance.day,
        emailsSent: sentCount,
        totalUsers: users.length,
        deliveryDetails: deliveryLogs
    });
}
