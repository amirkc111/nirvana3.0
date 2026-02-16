import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase() || '';

        // 1. Fetch Users from Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Fetch User Preferences to get Zodiac signs and Membership
        const { data: preferences, error: prefError } = await supabaseAdmin
            .from('user_preferences')
            .select('user_id, zodiac_sign_english, membership, membership_price');

        const prefMap = {};
        if (preferences) {
            preferences.forEach(p => {
                prefMap[p.user_id] = p;
            });
        }

        // 3. Fetch Latest Kundli Data for each user
        const { data: allKundalis, error: kundliError } = await supabaseAdmin
            .from('kundli_data')
            .select('*') // Select all fields to show full JSON
            .order('created_at', { ascending: false });

        const kundliMap = {};
        const kundlisMap = {}; // New map to hold ALL kundlis
        const kundliCountMap = {};
        if (allKundalis) {
            allKundalis.forEach(k => {
                // Count kundlis per user
                kundliCountMap[k.user_id] = (kundliCountMap[k.user_id] || 0) + 1;

                // Collect ALL kundlis
                if (!kundlisMap[k.user_id]) {
                    kundlisMap[k.user_id] = [];
                }
                kundlisMap[k.user_id].push(k);

                // Since we ordered by created_at desc, the first time we see a user_id, it is the latest one.
                if (!kundliMap[k.user_id]) {
                    kundliMap[k.user_id] = k;
                }
            });
        }

        // 3. Merge and Filter, with File System Fallback
        const mergedUsers = await Promise.all(users.map(async user => {
            const pref = prefMap[user.id] || {};
            let kundli = kundliMap[user.id] || null;

            // FALLBACK: Try to read from local filesystem if DB is missing analysis/predictions
            try {
                const nameInFile = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown';
                const safeName = nameInFile.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9]/g, '_');

                const candidates = [
                    `${safeName}_${safeEmail}.json`,
                ];

                const KUNDALI_USERS_DIR = path.resolve(process.cwd(), '../kundali_users');

                for (const filename of candidates) {
                    const filePath = path.join(KUNDALI_USERS_DIR, filename);
                    try {
                        const fileContent = await fs.readFile(filePath, 'utf-8');
                        const jsonData = JSON.parse(fileContent);

                        if (!kundli) {
                            kundli = {};
                        }

                        // SMART MERGE: The DB might have empty default JSONB '{}', so we check for emptiness
                        const isEmpty = (obj) => !obj || (typeof obj === 'object' && Object.keys(obj).length === 0);

                        // 1. Analysis
                        if (isEmpty(kundli.analysis) && !isEmpty(jsonData.analysis)) {
                            kundli.analysis = jsonData.analysis;
                        }

                        // 2. Kundli Data (basic details)
                        if (isEmpty(kundli.kundli_data) && !isEmpty(jsonData.kundliData)) {
                            kundli.kundli_data = jsonData.kundliData;
                        }

                        // 3. Planetary Positions
                        if (isEmpty(kundli.planetary_positions)) {
                            kundli.planetary_positions = jsonData.planetaryPositions || jsonData.analysis?.planets || {};
                        }

                        // 4. AI Predictions
                        // Explicitly look for AI predictions in likely places including ROOT level (jsonData.predictions)
                        if (!kundli.aiPredictions && isEmpty(kundli.analysis?.predictions)) {
                            kundli.aiPredictions = jsonData.predictions || jsonData.aiPredictions || jsonData.analysis?.predictions || null;
                            if (kundli.aiPredictions) {
                                if (!kundli.analysis || isEmpty(kundli.analysis)) kundli.analysis = jsonData.analysis || {};
                                kundli.analysis.predictions = kundli.aiPredictions;
                            }
                        }

                        // 5. Basic Info / Facts
                        // Map `basicInfo` to `kundli_data` if needed
                        if ((isEmpty(kundli.kundli_data) || !kundli.kundli_data.facts) && jsonData.basicInfo) {
                            kundli.kundli_data = kundli.kundli_data || {};
                            kundli.kundli_data.facts = kundli.kundli_data.facts || {};
                            // Use spread to avoid overwriting existing
                            kundli.kundli_data.facts = {
                                ...kundli.kundli_data.facts,
                                panchanga: jsonData.basicInfo.panchanga || jsonData.panchanga,
                                avakahada: jsonData.basicInfo.avakahada || jsonData.avakahada,
                                ghatarchakra: jsonData.basicInfo.ghatarchakra || jsonData.ghatarchakra
                            };
                        }

                        // Parse basic info if missing
                        if (!kundli.name) kundli.name = jsonData.name;
                        if (!kundli.birth_place) kundli.birth_place = jsonData.city || jsonData.birth_place;
                        if (!kundli.birth_date) kundli.birth_date = jsonData.date;
                        if (!kundli.birth_time) kundli.birth_time = jsonData.time;

                        break;
                    } catch (e) {
                        // File not found
                    }
                }
            } catch (err) {
                console.error("Error in FS fallback:", err);
            }

            return {
                id: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
                email: user.email,
                zodiac: pref.zodiac_sign_english || 'N/A',
                status: pref.membership === 'monthly' || pref.membership === 'yearly' ? 'Premium' : 'Free',
                joinDate: new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                spent: `€${(Number(pref.membership_price) || 0).toFixed(2)}`,
                membership_type: pref.membership || 'free',
                kundli: kundli,
                kundlis: kundlisMap[user.id] || (kundli ? [kundli] : []), // Return full history
                kundli_count: kundliCountMap[user.id] || (kundli ? 1 : 0)
            };
        }));

        const filteredUsers = mergedUsers.filter(u =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.zodiac.toLowerCase().includes(search)
        );

        return NextResponse.json({ users: filteredUsers });
    } catch (error) {
        console.error('Admin Users API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { userId, membership, membership_price } = body;

        if (!userId || !membership) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`Admin update: Setting user ${userId} to ${membership}`);

        // Update user_preferences
        const { data, error } = await supabaseAdmin
            .from('user_preferences')
            .update({
                membership,
                membership_price: membership_price || 0,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            const { data: insertData, error: insertError } = await supabaseAdmin
                .from('user_preferences')
                .insert({
                    user_id: userId,
                    membership,
                    membership_price: membership_price || 0,
                    zodiac_sign: 0,
                    theme_preference: 'dark_cosmic',
                    language_preference: 'en'
                })
                .select();

            if (insertError) throw insertError;
            return NextResponse.json({ success: true, user: insertData[0] });
        }

        return NextResponse.json({ success: true, user: data[0] });

    } catch (error) {
        console.error('Admin Update API Error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
