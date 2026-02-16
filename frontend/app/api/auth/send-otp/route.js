import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import otpStore from '../../../../lib/otpStore';

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailWithSMTP(email, otp) {
    const emailUser = process.env.EMAIL_SERVER_USER || 'noreply@nirvanaastro.fi';
    const emailPassword = process.env.EMAIL_SERVER_PASSWORD;

    if (!emailPassword) return { success: false, error: 'Password missing' };

    // Try multiple hosts (Hostinger often uses Titan)
    const hostsToTry = [
        process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
        'smtp.titan.email'
    ];

    // Try multiple ports
    const portsToTry = [465, 587];

    for (const host of hostsToTry) {
        for (const port of portsToTry) {
            try {
                console.log(`[SMTP] Trying ${host}:${port}...`);
                const transporter = nodemailer.createTransport({
                    host: host,
                    port: port,
                    secure: port === 465,
                    auth: { user: emailUser, pass: emailPassword },
                    tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
                    connectionTimeout: 10000,
                    greetingTimeout: 10000,
                    socketTimeout: 10000
                });

                await transporter.verify();
                await transporter.sendMail({
                    from: `"Nirvana Astro" <${emailUser}>`,
                    to: email,
                    subject: 'Nirvana Astro - Verification Code',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #8b5cf6;">Verification Code</h2>
                            <p>Your verification code is:</p>
                            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">
                                <h1 style="font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                            </div>
                            <p>This code expires in 10 minutes.</p>
                        </div>
                    `
                });

                console.log(`[SMTP] ✅ Success via ${host}:${port}`);
                return { success: true };
            } catch (err) {
                console.error(`[SMTP] ❌ ${host}:${port} failed: ${err.message}`);
            }
        }
    }
    return { success: false, error: 'All SMTP attempts failed. Authentication rejected by server.' };
}

export async function POST(request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const otp = generateOTP();
        await otpStore.set(email, otp, 10 * 60 * 1000);

        // Try REAL SMTP
        const result = await sendEmailWithSMTP(email, otp);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            // PROPER SYSTEM: Fail if mail can't be sent, but provide OTP for internal logs
            console.error(`[AUTH] Failed to send email to ${email}. Code: ${otp}`);
            return NextResponse.json({
                error: result.error,
                // Still return OTP but as a fallback property so UI can decide
                otp: process.env.NODE_ENV === 'development' ? otp : undefined
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
