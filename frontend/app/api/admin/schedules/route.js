import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.toLowerCase() || '';

        // Fetch appointments
        const { data: appointments, error } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .order('appointment_date', { ascending: true });

        if (error) {
            throw error;
        }

        const filtered = appointments.filter(apt =>
            (apt.client_name || '').toLowerCase().includes(search) ||
            (apt.email && apt.email.toLowerCase().includes(search))
        );

        return NextResponse.json({ appointments: filtered });

    } catch (error) {
        console.error('Schedules API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { data, error } = await supabaseAdmin
            .from('appointments')
            .insert(body)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, appointment: data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, appointment: data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
