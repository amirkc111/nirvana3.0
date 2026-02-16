import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase Admin client not initialized');
            return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
        }

        const body = await request.json();
        const {
            user_id,
            guru_id,
            client_name,
            email,
            appointment_date,
            duration_minutes,
            status,
            type,
            notes
        } = body;

        // Basic validation
        if (!user_id || !email || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .insert([{
                user_id,
                guru_id,
                client_name,
                email,
                appointment_date,
                duration_minutes,
                status: status || 'pending',
                type: type === 'call_request' ? 'consultation' : 'reading',
                notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Database Error in public/requests:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 5. Generate Admin Notification
        const notificationTitle = type === 'call_request' ? 'New Call Request' : 'Service Interest Recorded';
        const notificationBody = `${client_name} has requested a ${type === 'call_request' ? 'call' : 'special service'}: ${notes}`;

        await supabaseAdmin
            .from('admin_notifications')
            .insert([{
                type: 'info',
                title: notificationTitle,
                body: notificationBody,
                link: type === 'call_request' ? '/admin/schedules' : '/admin/notifications',
                is_read: false,
                created_at: new Date().toISOString()
            }]);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Request Error in public/requests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
