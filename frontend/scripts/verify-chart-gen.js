
import { kundaliGenerationService } from '../lib/kundaliGenerationService.js';

async function testGeneration() {
    console.log("🚀 Starting Server-Side Chart Verification...");

    const testData = {
        name: "AmirTest",
        birthYear: 1997,
        birthMonth: 11,
        birthDay: 2,
        birthHour: 12,
        birthMinute: 7,
        city: "Dolakha, Nepal",
        latitude: 27.6, // Approx format
        longitude: 86.0,
        timezone: "UTC+05:45" // Use the string format I fixed earlier
    };

    try {
        console.log("1. Calling generateCompleteKundali...");
        const result = await kundaliGenerationService.generateCompleteKundali(testData);

        if (result.success) {
            console.log("✅ SUCCESS! Chart generated.");
            console.log("Ascendant Sign ID:", result.data.kundaliData.Ascendant.rasi.rasi_num);
            console.log("Sun Sign ID:", result.data.kundaliData.Sun.rasi.rasi_num);
        } else {
            console.error("❌ FAILED with logic error:", result.error);
        }

    } catch (e) {
        console.error("❌ CRASHED with exception:", e);
    }
}

testGeneration();
