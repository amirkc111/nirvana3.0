import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching ads:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, title, type, message, media_url, link, link_label, is_active } = body;

        // Logic: active ads can only have ONE at a time.
        // If this ad is being set to active, deactivate all others first.
        if (is_active) {
            await supabaseAdmin
                .from('ads')
                .update({ is_active: false })
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Deactivate all
        }

        const payload = {
            title, type, message, media_url, link, link_label, is_active,
            updated_at: new Date().toISOString()
        };

        let result;
        if (id) {
            result = await supabaseAdmin
                .from('ads')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
        } else {
            result = await supabaseAdmin
                .from('ads')
                .insert(payload)
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error saving ad:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('ads')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting ad:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
