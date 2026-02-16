import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data: guru, error } = await supabaseAdmin
            .from('gurus')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({ guru: guru || null });
    } catch (error) {
        console.error('Guru Profile Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch guru profile' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { userId, ...updates } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Verify the guru profile exists for this user
        const { data: guru, error: gError } = await supabaseAdmin
            .from('gurus')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (gError || !guru) {
            return NextResponse.json({ error: 'No guru profile linked to this account' }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from('gurus')
            .update(updates)
            .eq('id', guru.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Guru Profile Update Error:', error);
        return NextResponse.json({ error: 'Failed to update guru profile' }, { status: 500 });
    }
}
