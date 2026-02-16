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
            return NextResponse.json({ stats: null, message: 'No guru profile linked' });
        }

        const guruId = guru.id;

        // 2. Fetch Stats
        // a. Pending Appointments
        const { count: pendingCount } = await supabaseAdmin
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('guru_id', guruId)
            .eq('status', 'pending');

        // b. Active Chat Sessions
        const { count: chatCount } = await supabaseAdmin
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('guru_id', guruId);

        // c. Recent Requests (Top 3)
        const { data: recentRequests } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('guru_id', guruId)
            .order('created_at', { ascending: false })
            .limit(3);

        return NextResponse.json({
            stats: [
                { name: 'Pending Calls', value: (pendingCount || 0).toString(), icon: 'FiClock', color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'Total Chats', value: (chatCount || 0).toString(), icon: 'FiMessageSquare', color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'Active Leads', value: (recentRequests?.length || 0).toString(), icon: 'FiTarget', color: 'text-amber-600', bg: 'bg-amber-50' },
                { name: 'Growth', value: '100%', icon: 'FiTrendingUp', color: 'text-green-600', bg: 'bg-green-50' },
            ],
            recentRequests: recentRequests || []
        });

    } catch (error) {
        console.error('Guru Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch guru stats' }, { status: 500 });
    }
}
