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
            return NextResponse.json({ appointments: [], message: 'No guru profile linked' });
        }

        const guruId = guru.id;

        // 2. Fetch Appointments
        const { data: appointments, error: aError } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('guru_id', guruId)
            .order('appointment_date', { ascending: true });

        if (aError) throw aError;

        return NextResponse.json({ appointments: appointments || [] });

    } catch (error) {
        console.error('Guru Appointments API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch guru appointments' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and Status required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('appointments')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Guru Appointment Update Error:', error);
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }
}
