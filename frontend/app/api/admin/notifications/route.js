import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ notifications: data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { type, title, body: messageBody, link } = body;

        const { data, error } = await supabaseAdmin
            .from('admin_notifications')
            .insert([{ type, title, body: messageBody, link }])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id } = body;

        const { error } = await supabaseAdmin
            .from('admin_notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
