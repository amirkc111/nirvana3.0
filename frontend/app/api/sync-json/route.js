import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { simpleTransliterate } from '../../../lib/vedicjyotish/services/NepaliLocalization';

const KUNDALI_USERS_DIR = path.resolve(process.cwd(), '../kundali_users');

const getCachePath = (name, email) => {
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return path.join(KUNDALI_USERS_DIR, `${safeName}_${safeEmail}.json`);
};

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            name,
            email,
            date,
            time,
            lat,
            lon,
            city,
            tznm,
            tz,
            fatherName,
            motherName,
            gotra,
            nawranName,
            ...otherData
        } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Missing required fields: name, email' }, { status: 400 });
        }

        const filePath = getCachePath(name, email);
        await fs.mkdir(KUNDALI_USERS_DIR, { recursive: true });

        // Construct the file data structure
        const fileData = {
            basicInfo: {
                name,
                email, // Helpful to keep email in basicInfo too
                birthDate: date,
                birthTime: time,
                place: city,
                coordinates: { latitude: lat, longitude: lon },
                timezone: tz,
                timezoneName: tznm,
                // Advanced Details
                fatherName,
                motherName,
                gotra,
                nawranName,
                // Nepali Transliterations
                fatherNameNp: simpleTransliterate(fatherName),
                motherNameNp: simpleTransliterate(motherName),
                gotraNp: simpleTransliterate(gotra),
                nawranNameNp: simpleTransliterate(nawranName)
            },
            ...otherData, // Include any other passed data (kundliData etc)
            lastSavedAt: new Date().toISOString()
        };

        // Try to read existing to merge if needed, but for "update form" usually overwrite is preferred for basicInfo
        // However, we might want to preserve "aiPredictions" if they exist.
        try {
            const existingContent = await fs.readFile(filePath, 'utf-8');
            const existingJson = JSON.parse(existingContent);

            // Merge strategy: Overwrite basicInfo, keep existing predictions/analysis if not provided
            fileData.aiPredictions = existingJson.aiPredictions || fileData.aiPredictions;
            fileData.analysis = existingJson.analysis || fileData.analysis;
            fileData.kundliData = existingJson.kundliData || fileData.kundliData; // Keep existing kundliData if not passed
        } catch (e) {
            // New file
        }

        await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
        console.log(`[Sync-JSON] Data saved to ${filePath}`);

        return NextResponse.json({ success: true, filePath });

    } catch (error) {
        console.error("Error syncing JSON:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
