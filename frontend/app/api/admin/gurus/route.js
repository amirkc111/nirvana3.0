import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { email, password, name, title, languages, rating, is_free, image_url } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, Password, and Name are required' }, { status: 400 });
        }

        // 1. Create the Auth User
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name, role: 'guru' }
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 2. Create the Guru Profile and link it to the new User ID
        const { data: guru, error: guruError } = await supabaseAdmin
            .from('gurus')
            .insert([{
                name,
                email, // Persistence for display
                title,
                languages,
                rating: parseFloat(rating) || 5.0,
                is_free: !!is_free,
                image_url: image_url || '/guru.jpg',
                user_id: authUser.user.id
            }])
            .select()
            .single();

        if (guruError) {
            // Rollback auth user if profile creation fails? 
            // Better to at least log it and let admin fix linkage later if needed
            console.error('Guru profile creation error:', guruError);
            return NextResponse.json({
                error: 'Auth user created but profile failed: ' + guruError.message,
                userId: authUser.user.id
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, guru });

    } catch (error) {
        console.error('Admin Guru POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { id, email, password, ...profileUpdates } = body;

        if (!id) {
            console.error('Guru PATCH error: Missing ID in body');
            return NextResponse.json({ error: 'Guru ID is required' }, { status: 400 });
        }

        // 1. Fetch current guru to get user_id and existing data
        const { data: currentGuru, error: fetchError } = await supabaseAdmin
            .from('gurus')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Guru PATCH database error:', fetchError);
            if (fetchError.code === '42703') {
                return NextResponse.json({ error: 'Database mismatch: missing user_id column. Please run the migration script.' }, { status: 500 });
            }
            return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
        }

        if (!currentGuru) {
            return NextResponse.json({ error: 'Guru not found' }, { status: 404 });
        }

        let userId = currentGuru.user_id;

        // 2. Handle Auth Credentials (Update or Create Linkage)
        if (email || password) {
            if (userId) {
                // Update existing Auth record
                const authUpdates = {};
                if (email) authUpdates.email = email;
                if (password) authUpdates.password = password;

                const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                    userId,
                    authUpdates
                );

                if (authUpdateError) {
                    console.error('Auth update error:', authUpdateError);
                    return NextResponse.json({ error: 'Failed to update credentials: ' + authUpdateError.message }, { status: 400 });
                }
            } else {
                // MISSION CRITICAL: Create NEW auth user if missing (fix for "invalid credentials")
                // We need both email (from payload or DB) and password (from payload)
                const targetEmail = email || currentGuru.email;
                if (!targetEmail || !password) {
                    return NextResponse.json({
                        error: 'This consultant is missing an authentication link. Please provide both Email and Password to establish their account.'
                    }, { status: 400 });
                }

                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: targetEmail,
                    password,
                    email_confirm: true,
                    user_metadata: { full_name: profileUpdates.name || currentGuru.name, role: 'guru' }
                });

                if (authError) {
                    console.error('Auth creation error during PATCH:', authError);
                    return NextResponse.json({ error: 'Failed to create authentication link: ' + authError.message }, { status: 400 });
                }

                userId = authUser.user.id;
            }
        }

        // 3. Update Guru Profile (including email persistence and user_id linkage)
        const updatePayload = {
            ...profileUpdates,
            user_id: userId // Ensure linkage is saved
        };
        if (email) updatePayload.email = email;
        if (profileUpdates.rating !== undefined) {
            updatePayload.rating = parseFloat(profileUpdates.rating);
        }

        const { data: updatedGuru, error: guruUpdateError } = await supabaseAdmin
            .from('gurus')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (guruUpdateError) {
            console.error('Guru profile update error:', guruUpdateError);
            return NextResponse.json({ error: guruUpdateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, guru: updatedGuru });

    } catch (error) {
        console.error('Admin Guru PATCH Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
