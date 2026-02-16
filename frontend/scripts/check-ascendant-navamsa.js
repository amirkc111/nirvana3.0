
import { Kundli } from '../lib/vedicjyotish/services/Kundli.ts';
import { DateTime } from 'luxon';
import { KundaliGenerationService } from '../lib/kundaliGenerationService.js';

async function checkAscendant() {
    const service = new KundaliGenerationService();
    await service.initialize();

    const dt = DateTime.fromObject({
        year: 1990, month: 1, day: 1, hour: 12, minute: 0
    }, { zone: 'UTC+05:30' });

    const kResult = Kundli(dt, 77.1025, 28.7041, 0);
    const asc = kResult.planets.Ascendant;

    console.log("Ascendant Keys:", Object.keys(asc));
    if (asc.divisional) {
        console.log("Has Divisional Data:", true);
        console.log("Navamsa:", asc.divisional.navamsa);
    } else {
        console.log("Has Divisional Data:", false);
    }
}

checkAscendant().catch(console.error);
