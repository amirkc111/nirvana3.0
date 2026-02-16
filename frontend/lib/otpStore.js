import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Use temp directory for persistence (mirrors server-dashboard)
const STORE_FILE = path.join(os.tmpdir(), 'nirvana-otp-store.json');

class OTPStore {
    constructor() {
        this.store = new Map();
        this.initialized = false;

        // Background cleanup
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.cleanup(), 5 * 60 * 1000);
        }
    }

    async init() {
        if (this.initialized) return;
        try {
            const data = await fs.readFile(STORE_FILE, 'utf8');
            const parsed = JSON.parse(data);
            this.store = new Map(Object.entries(parsed));
            console.log(`[OTP STORE] Initialized: ${this.store.size} codes loaded.`);
        } catch (error) {
            this.store = new Map();
            console.log(`[OTP STORE] Initialized: Starting fresh.`);
        }
        this.initialized = true;
    }

    async save() {
        try {
            const data = Object.fromEntries(this.store);
            await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error(`[OTP STORE] Save failed:`, error.message);
        }
    }

    async set(email, otp, expiresInMs) {
        await this.init();
        const normalizedEmail = email.toLowerCase().trim();
        const expires = Date.now() + expiresInMs;

        this.store.set(normalizedEmail, {
            otp: otp.toString().trim(),
            expires: expires
        });

        console.log(`[OTP STORE] Stored code for ${normalizedEmail}`);
        await this.save();
    }

    async get(email) {
        await this.init();
        const normalizedEmail = email.toLowerCase().trim();
        return this.store.get(normalizedEmail);
    }

    async delete(email) {
        await this.init();
        const normalizedEmail = email.toLowerCase().trim();
        if (this.store.delete(normalizedEmail)) {
            await this.save();
            return true;
        }
        return false;
    }

    async cleanup() {
        await this.init();
        const now = Date.now();
        let changed = false;

        this.store.forEach((data, email) => {
            if (now > data.expires) {
                this.store.delete(email);
                changed = true;
            }
        });

        if (changed) await this.save();
    }

    async isValid(email, otp) {
        await this.init();
        const data = await this.get(email);
        if (!data) return false;

        if (Date.now() > data.expires) {
            await this.delete(email);
            return false;
        }

        return data.otp === otp.toString().trim();
    }
}

const otpStore = new OTPStore();
export default otpStore;
