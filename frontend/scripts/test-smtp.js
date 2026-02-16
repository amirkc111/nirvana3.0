import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConfig(name, config) {
    console.log(`\n--- Testing: ${name} ---`);
    const transporter = nodemailer.createTransport({
        ...config,
        debug: true,
        logger: true,
    });

    try {
        await transporter.verify();
        console.log(`✅ ${name}: SUCCESS!`);
        return true;
    } catch (err) {
        console.error(`❌ ${name}: FAILED - ${err.message}`);
        return false;
    }
}

async function runAll() {
    const host = process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com';
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    console.log('User:', user);
    console.log('Pass Length:', pass?.length);
    console.log('Char index 4 ($?):', pass?.charAt(4));
    console.log('Char index 5 ("?):', pass?.charAt(5));

    // Test 1: Port 465 (SSL)
    await testConfig('Port 465 (SSL)', {
        host,
        port: 465,
        secure: true,
        auth: { user, pass }
    });

    // Test 2: Port 587 (STARTTLS)
    await testConfig('Port 587 (STARTTLS)', {
        host,
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { minVersion: 'TLSv1.2' }
    });

    // Test 3: Port 465 with LOGIN auth
    await testConfig('Port 465 (LOGIN)', {
        host,
        port: 465,
        secure: true,
        auth: { user, pass },
        authMethod: 'LOGIN'
    });
}

runAll();
