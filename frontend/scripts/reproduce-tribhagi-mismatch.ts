
import { DateTime } from "luxon";
import { calcVimsottariDasa } from "./lib/vedicjyotish/services/calcVimsottariDasa/index";
import { calcTribhagiDasha } from "./lib/vedicjyotish/services/calcTribhagiDasha/index";
import { kundaliGenerationService } from "./lib/vedicjyotish/services/kundaliGenerationService";

async function checkMismatch() {
    await kundaliGenerationService.initialize();

    // Mock birth data (e.g. 1990)
    const birth = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
    const now = DateTime.now();

    const vims = calcVimsottariDasa(0, {} as any, birth);
    const trib = calcTribhagiDasha({} as any, birth);

    const findActive = (tree: any[], target: DateTime) => {
        const ms = target.toMillis();
        return tree.find(p =\u003e ms >= p.StartDate.toMillis() && ms < p.EndDate.toMillis());
    };

    const activeVimMD = findActive(vims, now);
    const activeTriMD = findActive(trib, now);

    console.log(`Target Date: ${now.toISO()}`);
    console.log(`Vimshottari MD: ${activeVimMD?.Lord}`);
    console.log(`Tribhagi MD:    ${activeTriMD?.Lord}`);

    if (activeVimMD?.Lord !== activeTriMD?.Lord) {
        console.error("!!! MISMATCH DETECTED !!!");
    } else {
        console.log("Systems agree on the Mahadasha Lord.");
    }
}

checkMismatch().catch(console.error);
