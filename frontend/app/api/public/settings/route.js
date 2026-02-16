import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch specific public keys only
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('*')
            .in('key', ['announcements', 'features']);

        if (error) throw error;

        const settings = data.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching public settings:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
