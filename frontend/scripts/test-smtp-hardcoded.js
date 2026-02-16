import nodemailer from 'nodemailer';

async function test() {
    const user = 'noreply@nirvanaastro.fi';
    const pass = 'Sc.;$"O1c&O@!6j'; // Exactly what the user provided

    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        debug: true,
        logger: true,
    });

    try {
        console.log('Connecting with hardcoded credentials...');
        await transporter.verify();
        console.log('✅ Success!');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

test();
