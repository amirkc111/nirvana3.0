import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('ads')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        // If no active ad, return empty object (handled by frontend)
        return NextResponse.json(data || null);
    } catch (error) {
        console.error('Error fetching active ad:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
