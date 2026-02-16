import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const KUNDALI_USERS_DIR = path.join(process.cwd(), 'kundali_users');

// Helper to get consistent filename
const getCachePath = (name, email) => {
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return path.join(KUNDALI_USERS_DIR, `${safeName}_${safeEmail}.json`);
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const email = searchParams.get('email');

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
        }

        // DB LOOKUP FIRST
        try {
            if (supabaseAdmin) {
                // 1. Find user by email
                const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
                const user = users?.find(u => u.email === email);

                if (user) {
                    const { data: records } = await supabaseAdmin
                        .from('kundli_data')
                        .select('ai_predictions, analysis, astrological_profile, planetary_analysis, kundli_data')
                        .eq('user_id', user.id)
                        .eq('name', name)
                        .order('updated_at', { ascending: false }) // Prefer latest updated
                        .limit(1);

                    if (records && records.length > 0) {
                        const record = records[0];
                        const dbPredictions = record.ai_predictions || record.analysis?.predictions;

                        // Merge the raw JSON stored in kundli_data column
                        const rawData = record.kundli_data || {};

                        console.log(`[Storage] DB Cache hit for ${name}`);
                        return NextResponse.json({
                            ...rawData,
                            aiPredictions: dbPredictions,
                            // Ensure we don't overwrite if rawData has them, but provide fallback from columns
                            analysis: record.analysis || rawData.analysis,
                            astrological_profile: record.astrological_profile || rawData.astrological_profile
                        });
                    }
                }
            }
        } catch (dbErr) {
            console.error("[Storage] DB Read Error:", dbErr);
            // Fallthrough to FS
        }

        const filePath = getCachePath(name, email);
        console.log(`[Storage] Checking FS cache at: ${filePath}`);

        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const jsonData = JSON.parse(data);

            // Re-read to ensure we're getting fresh content from disk
            if (jsonData) {
                console.log(`[Storage] FS Cache hit for ${name}`);
                return NextResponse.json(jsonData);
            }

            console.log(`[Storage] File found but no AI predictions in ${filePath}`);
            return NextResponse.json({ predictions: null });
        } catch (e) {
            console.log(`[Storage] Cache miss for ${name}`);
            return NextResponse.json({ predictions: null });
        }
    } catch (error) {
        console.error("[Storage] GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, predictions, aiPredictions } = body;

        console.log('[Kundli Storage] POST received keys:', Object.keys(body));
        if (body.kundliData) {
            console.log('[Kundli Storage] kundliData keys:', Object.keys(body.kundliData).join(', '));
        } else {
            console.log('[Kundli Storage] kundliData is MISSING or empty');
        }

        // Support both field names

        // Support both field names
        const finalPredictions = aiPredictions || predictions;

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields: name, email' }, { status: 400 });
        }

        const filePath = getCachePath(name, email);

        // Ensure directory exists
        try {
            await fs.mkdir(KUNDALI_USERS_DIR, { recursive: true });

            let existingData = {};
            try {
                const data = await fs.readFile(filePath, 'utf-8');
                existingData = JSON.parse(data);
            } catch (e) {
                // File might not exist yet, which is fine
            }

            // Update with new predictions and metadata
            // Remove 'predictions' from body to avoid duplication, enforcing 'aiPredictions' as canonical
            const { predictions: _, ...cleanBody } = body;

            // Update with new predictions and metadata
            const updatedDataFS = {
                ...existingData,
                ...cleanBody, // Merge top-level fields (without 'predictions')
                lastSavedAt: new Date().toISOString()
            };

            // Only update aiPredictions if provided
            if (finalPredictions) {
                updatedDataFS.aiPredictions = finalPredictions;
            }

            // Deep merge basicInfo specifically if it exists in both
            if (body.basicInfo && existingData.basicInfo) {
                updatedDataFS.basicInfo = {
                    ...existingData.basicInfo,
                    ...body.basicInfo
                };
            }

            await fs.writeFile(filePath, JSON.stringify(updatedDataFS, null, 2), 'utf-8');
            console.log(`[Storage] Predictions cached successfully in ${filePath}`);
        } catch (fsError) {
            console.error(`[Storage] File System Write Error (Non-fatal): ${fsError.message}`);
            // Proceed to DB Sync despite FS error
        }

        // Prepare data for DB (reuse body/updatedData logic if needed, or reconstruct)
        // Since we are decoupling, let's ensure we have the data object ready for DB
        const { predictions: _ignore, ...cleanBodyForDB } = body;
        const updatedData = {
            ...cleanBodyForDB,
            aiPredictions: finalPredictions,
            lastSavedAt: new Date().toISOString()
        };

        // DB SYNC: Update Supabase "kundli_data" table
        // We try to match by name and email, OR preferably by userId if provided.
        if (supabaseAdmin) {
            try {
                let user = null;

                // 1. Try to use explicit userId from body
                if (body.userId) {
                    console.log(`[Storage] Using explicit userId: ${body.userId}`);
                    user = { id: body.userId, email: email }; // Mock user object with ID
                } else {
                    // 2. Fallback to finding user by email (subject to pagination limits)
                    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
                    user = users?.find(u => u.email === email);
                }

                if (user) {
                    // 2. Update the latest kundli record for this user with this name
                    // We assume the one with matching name is the one providing these details.
                    // IMPORTANT: We need to store predictions inside 'analysis' column usually, or 'kundli_data' json column.
                    // The Admin Route reads `kundli` object which is the row.

                    // Fetch existing record to get current analysis
                    const { data: records } = await supabaseAdmin
                        .from('kundli_data')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('name', name)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (records && records.length > 0) {
                        const record = records[0];
                        // Merge predictions into analysis object
                        const currentAnalysis = record.analysis || {};
                        const updatedAnalysis = {
                            ...currentAnalysis,
                            predictions: finalPredictions
                        };

                        // Merge kundli data (facts, planets, etc.)
                        const currentProfile = record.astrological_profile || {};
                        const updatedProfile = {
                            ...currentProfile,
                            ...(body.kundliData || {}),
                            facts: body.facts || body.basicInfo || currentProfile.facts || {} // Prioritize body.facts (contains avakahada)
                        };

                        console.log('[Storage Debug] Saving to DB for user:', user.email);
                        console.log('[Storage Debug] updatedData keys:', Object.keys(updatedData));
                        if (updatedData.kundliData) console.log('[Storage Debug] updatedData.kundliData keys:', Object.keys(updatedData.kundliData));
                        console.log('[Storage Debug] updatedData.aiPredictions present:', !!updatedData.aiPredictions);

                        await supabaseAdmin
                            .from('kundli_data')
                            .update({
                                analysis: updatedAnalysis,
                                ai_predictions: finalPredictions,
                                astrological_profile: updatedProfile,
                                planetary_analysis: body.planetaryAnalysis || {},
                                kundli_data: updatedData // Save exact file replica to existing column
                            })
                            .eq('id', record.id);

                        console.log(`[Storage] Synced predictions to Supabase for user ${user.id}`);
                    } else {
                        console.warn(`[Storage] No matching DB record found for sync: ${user.id} / ${name}. CREATING NEW RECORD.`);

                        // Construct new record payload
                        const basicInfo = body.basicInfo || {};

                        const newRecord = {
                            user_id: user.id,
                            name: name,
                            // Use basicInfo for columns if available (mapping standard fields)
                            gender: basicInfo.gender || 'male',
                            date_of_birth: basicInfo.date, // Assumes format compatible with DB or string
                            time_of_birth: basicInfo.time,
                            place_of_birth: basicInfo.place,
                            lat: basicInfo.lat,
                            lon: basicInfo.lon,
                            timezone: basicInfo.timezone,

                            // JSON Columns
                            // New record analysis starts with body.analysis + predictions
                            analysis: {
                                ...(body.analysis || {}),
                                predictions: finalPredictions
                            },
                            // New record profile
                            astrological_profile: {
                                ...(body.kundliData || {}),
                                facts: body.facts || body.basicInfo || {}
                            },
                            ai_predictions: finalPredictions,
                            planetary_analysis: body.planetaryAnalysis || {},
                            kundli_data: updatedData // Save full file content
                        };

                        const { error: insertError } = await supabaseAdmin
                            .from('kundli_data')
                            .insert([newRecord]);

                        if (insertError) {
                            console.error('[Storage] Insert Failed:', insertError);
                        } else {
                            console.log(`[Storage] Created NEW DB record for user ${user.id}`);
                        }
                    }
                }
            } catch (dbError) {
                console.error("[Storage] DB Sync Failed:", dbError);
                // Don't fail the request, just log it
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Storage] POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
