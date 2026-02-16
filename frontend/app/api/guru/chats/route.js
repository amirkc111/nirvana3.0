import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // 1. Get Guru ID from user ID
        const { data: guru, error: gError } = await supabaseAdmin
            .from('gurus')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (gError || !guru) {
            return NextResponse.json({ sessions: [], message: 'No guru profile linked' });
        }

        const guruId = guru.id;

        // 2. Fetch Sessions with User Info
        // Since chat_sessions.user_id points to auth.users, and we can't easily join with auth.users in standard select,
        // we will fetch sessions and then fetch user metadata separately using admin client if needed,
        // or just return the user_ids for the frontend to handle if it has a user map.
        // For efficiency, we'll fetch user_preferences to get names if they exists.

        const { data: sessions, error: sError } = await supabaseAdmin
            .from('chat_sessions')
            .select('*')
            .eq('guru_id', guruId)
            .order('updated_at', { ascending: false });

        if (sError) throw sError;

        // Fetch User Preferences for names
        const userIds = sessions.map(s => s.user_id);
        const { data: profiles } = await supabaseAdmin
            .from('user_preferences')
            .select('user_id, zodiac_sign_english')
            .in('user_id', userIds);

        const profileMap = {};
        (profiles || []).forEach(p => profileMap[p.user_id] = p);

        // Fetch user metadata from Auth (Top 50 to avoid overhead)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const authMap = {};
        users.forEach(u => authMap[u.id] = {
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Client',
            email: u.email
        });

        const enrichedSessions = sessions.map(s => ({
            ...s,
            user_name: authMap[s.user_id]?.name || 'Anonymous User',
            user_email: authMap[s.user_id]?.email || '',
            zodiac: profileMap[s.user_id]?.zodiac_sign_english || 'N/A'
        }));

        return NextResponse.json({ sessions: enrichedSessions });

    } catch (error) {
        console.error('Guru Chats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch guru chats' }, { status: 500 });
    }
}
