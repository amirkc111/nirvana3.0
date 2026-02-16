
import { Kundli } from '../lib/vedicjyotish/services/Kundli.ts';
import { DateTime } from 'luxon';
import { KundaliGenerationService } from '../lib/kundaliGenerationService.js';

async function verifyChart() {
    const service = new KundaliGenerationService();
    await service.initialize();

    const birthData = {
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        latitude: 28.7041,
        longitude: 77.1025,
        timezone: 5.5
    };

    console.log("Verifying Chart For:", birthData);

    const dt = DateTime.fromObject({
        year: birthData.year,
        month: birthData.month,
        day: birthData.day,
        hour: birthData.hour,
        minute: birthData.minute
    }, { zone: 'UTC+05:30' }); // Delhi is 5.5, which is 5:30

    console.log("DateTime ISO:", dt.toISO());

    // Call Kundli
    // KundaliGenerationService uses "swisseph" wrapper or fallback?
    // Let's use the wrapper from the service itself to be sure.
    // Actually, I can just use the service method if I mock the "birthData" properly.

    // But direct Kundli call is better to isolate logic.
    // I need to make sure the environment uses the 'swisseph' native module.

    const kResult = Kundli(dt, birthData.longitude, birthData.latitude, 0); // 0 = Ayanamsa (usually 1 for Lahiri?) No, Kundli.ts handles ayanamsa mode internally or defaults.

    const asc = kResult.planets.Ascendant;
    console.log("Calculated Ascendant:", asc.rasi.ind, asc.rasi.name); // ind is 1-based?

    console.log("\nPlanets:");
    Object.entries(kResult.planets).forEach(([key, val]) => {
        // console.log(key, val);
        if (val.rasi) console.log(`${key}: Sign ${val.rasi.rasi_num} (${val.rasi.name.english}) Degree: ${val.degree}`);
    });
}

verifyChart().catch(console.error);
