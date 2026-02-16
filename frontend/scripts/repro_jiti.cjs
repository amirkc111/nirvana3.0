
const { createRequire } = require('module');
const jiti = require('jiti')(__filename);
const { DateTime } = require('luxon');

// Import the actual TS files
const { calcVimsottariDasa } = jiti('../lib/vedicjyotish/services/calcVimsottariDasa/index.ts');
const { calcTribhagiDasha } = jiti('../lib/vedicjyotish/services/calcTribhagiDasha/index.ts');
const { kundaliGenerationService } = jiti('../lib/kundaliGenerationService');

async function repro() {
    await kundaliGenerationService.initialize();

    // User's Case (Approx Dec 1970)
    const birth = DateTime.fromObject({ year: 1970, month: 12, day: 25, hour: 12, minute: 0, second: 0 }, { zone: 'utc' });
    const now = DateTime.fromObject({ year: 2026, month: 1, day: 3 }, { zone: 'utc' });

    console.log(`Birth: ${birth.toISO()}`);
    console.log(`Now: ${now.toISO()}`);

    const vims = calcVimsottariDasa(0, {}, birth);
    const trib = calcTribhagiDasha({}, birth);

    const activeVim = vims.find(d => now >= d.StartDate && now < d.EndDate);
    const activeTri = trib.find(d => now >= d.StartDate && now < d.EndDate);

    console.log(`Vims MD: ${activeVim?.Lord}`);
    console.log(`Tri MD:  ${activeTri?.Lord}`);

    if (activeVim?.Lord !== activeTri?.Lord) {
        console.log("!!! MISMATCH !!!");
    } else {
        console.log("MATCH");
    }
}

repro().catch(console.error);
