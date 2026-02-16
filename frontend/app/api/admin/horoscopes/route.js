import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period')?.toLowerCase();

        let query = supabaseAdmin
            .from('horoscope_cache')
            .select('*')
            .order('created_at', { ascending: false });

        if (period && period !== 'all') {
            query = query.eq('period', period);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ horoscopes: data });

    } catch (error) {
        console.error('Horoscope API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch horoscopes' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // If ID is provided, it's an update, otherwise insert
        // Or we can use upsert if we know the unique constraint (cache_key usually)

        const { id, period, cache_key, data } = body;

        let result;
        if (id) {
            // Update
            result = await supabaseAdmin
                .from('horoscope_cache')
                .update({ period, cache_key, data, created_at: new Date().toISOString() }) // touch created_at to bump it
                .eq('id', id)
                .select()
                .single();
        } else {
            // Insert
            result = await supabaseAdmin
                .from('horoscope_cache')
                .insert({ period, cache_key, data })
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return NextResponse.json({ success: true, horoscope: result.data });

    } catch (error) {
        console.error('Horoscope Save Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('horoscope_cache')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Horoscope Delete Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
