import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'amirkc444@gmail.com';
const ADMIN_PASS = 'apple123';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            // Set cookie
            cookies().set('admin_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE() {
    cookies().delete('admin_token');
    return NextResponse.json({ success: true });
}
