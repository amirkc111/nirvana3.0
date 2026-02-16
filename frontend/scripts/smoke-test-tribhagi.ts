
import { DateTime } from "luxon";
import { calcTribhagiDasha } from "./lib/vedicjyotish/services/calcTribhagiDasha/index.ts";
import { kundaliGenerationService } from "./lib/vedicjyotish/services/kundaliGenerationService";

async function smokeTest() {
    await kundaliGenerationService.initialize();

    // 1990 birth case
    const birth = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
    const dashas = calcTribhagiDasha({} as any, birth);

    console.log("Total entries:", dashas.length);
    console.log("First 3 entries (Parts of first MD):");
    dashas.slice(0, 3).forEach(d => {
        console.log(`${d.Lord} | ${d.StartDate.toISO()} - ${d.EndDate.toISO()}`);
        console.log(`  Sub-dashas: ${d.ChildDasha.length}`);
    });

    const totalDays = dashas[dashas.length - 1].EndDate.diff(dashas[0].StartDate, 'days').days;
    console.log("Total duration (years):", totalDays / 365.2425);
}

smokeTest().catch(console.error);
