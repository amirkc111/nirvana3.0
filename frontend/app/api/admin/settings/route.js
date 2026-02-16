import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('*');

        if (error) throw error;

        // Transform array to object for easier frontend consumption
        // [ {key: 'general', value: {...}}, ... ] => { general: {...}, ... }
        const settings = data.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { key, value } = body;

        if (!key || !value) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error saving setting:', error);
        return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
    }
}
