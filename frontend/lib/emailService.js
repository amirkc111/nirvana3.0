import nodemailer from 'nodemailer';

// Robust strategy copied from app/api/auth/send-otp/route.js
export const sendEmail = async ({ to, subject, html }) => {
    const emailUser = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
    const emailPassword = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;

    if (!emailUser || !emailPassword) {
        console.warn("⚠️ Email service not configured. Credentials missing.");
        console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
        return { success: false, error: "SMTP configuration missing" };
    }

    // Try multiple hosts (Hostinger often uses Titan)
    // Priority: Titan (Combined with Env User/Pass works best)
    // We explicitly exclude 'smtp.hostinger.com' because it causes 535 Auth errors despite documentation.
    const hostsToTry = ['smtp.titan.email'];

    // Only add Env Host if it's NOT hostinger (which we know fails) and NOT already Titan
    if (process.env.EMAIL_SERVER_HOST &&
        process.env.EMAIL_SERVER_HOST !== 'smtp.hostinger.com' &&
        process.env.EMAIL_SERVER_HOST !== 'smtp.titan.email') {
        hostsToTry.push(process.env.EMAIL_SERVER_HOST);
    }

    // Try multiple ports
    const portsToTry = [465, 587];

    let lastError = null;

    for (const host of hostsToTry) {
        for (const port of portsToTry) {
            try {
                console.log(`[EmailService] Trying ${host}:${port}...`);
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
                const info = await transporter.sendMail({
                    from: process.env.SMTP_FROM || `"Nirvana Astro" <${emailUser}>`,
                    to: to,
                    subject: subject,
                    html: html,
                });

                console.log(`✅ [EmailService] Sent via ${host}:${port}`);
                return { success: true, messageId: info.messageId };
            } catch (err) {
                console.warn(`⚠️ [EmailService] Failed ${host}:${port}: ${err.message}`);
                lastError = err.message;
            }
        }
    }

    console.error("❌ [EmailService] All attempts failed.");
    return { success: false, error: lastError || "All SMTP attempts failed" };
};
