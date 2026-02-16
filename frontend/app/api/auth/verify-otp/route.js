import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import otpStore from '../../../../lib/otpStore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
    try {
        const { email, otp, password, fullName } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // 1. Verify OTP
        const isValid = await otpStore.isValid(email, otp);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // 2. Clear OTP
        await otpStore.delete(email);

        // 3. Register user in Supabase (with Service Role to skip email confirmation)
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Supabase service key not configured' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            user_metadata: { full_name: fullName },
            email_confirm: true
        });

        if (error) {
            // If user already exists, this might fail
            if (error.message.includes('already registered')) {
                return NextResponse.json({ error: 'This email is already registered' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Account verified and created successfully',
            user: data.user
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
