const { DateTime } = require('luxon');

const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const DurationMap = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const SOLAR_YEAR = 365.2422;

function verifyVimsottariLogic(birthUTC, moonLon) {
    console.log(`--- Vimshottari Anchoring & Pratyantar Verification ---`);
    console.log(`Birth (UTC): ${birthUTC.toISO()}`);

    // 1. Math for MD
    const NAK_SIZE = 13 + 20 / 60;
    const nakIndex = Math.floor(moonLon / NAK_SIZE);
    const inNak = moonLon - (nakIndex * NAK_SIZE);
    const fracRemaining = 1 - (inNak / NAK_SIZE);
    const mdLord = VIMS_ORDER[nakIndex % 9];

    const mdTotal = DurationMap[mdLord];
    const balance = mdTotal * fracRemaining;
    const elapsed = mdTotal - balance;
    const mdStart = birthUTC.minus({ days: elapsed * SOLAR_YEAR });
    const mdEnd = mdStart.plus({ days: mdTotal * SOLAR_YEAR });

    console.log(`MD Lord: ${mdLord}`);
    console.log(`MD Total: ${mdTotal} years`);
    console.log(`Frac Remaining: ${fracRemaining.toFixed(6)}`);
    console.log(`Balance: ${balance.toFixed(6)} years`);
    console.log(`Elapsed: ${elapsed.toFixed(6)} years`);
    console.log(`MD Start: ${mdStart.toISO()}`);
    console.log(`MD End:   ${mdEnd.toISO()}`);

    // Check MD containment
    const birthMillis = birthUTC.toMillis();
    const mdStartMillis = mdStart.toMillis();
    const mdEndMillis = mdEnd.toMillis();
    console.log(`Birth inside MD? ${birthMillis >= mdStartMillis && birthMillis < mdEndMillis}`);

    // 2. Antar Check
    console.log(`\n--- Antardasha Anchoring Check ---`);
    let cursorAD = mdStart;
    const adSequence = [...VIMS_ORDER.slice(VIMS_ORDER.indexOf(mdLord)), ...VIMS_ORDER.slice(0, VIMS_ORDER.indexOf(mdLord))];

    let activeADCount = 0;
    let antarSumYears = 0;

    adSequence.forEach(lord => {
        const adYears = (DurationMap[lord] * mdTotal) / 120;
        const adStart = cursorAD;
        const adEnd = cursorAD.plus({ days: adYears * SOLAR_YEAR });

        if (birthMillis >= adStart.toMillis() && birthMillis < adEnd.toMillis()) {
            activeADCount++;
            console.log(`>> Birth found in AD: ${lord} (${adStart.toISO()} to ${adEnd.toISO()})`);
        }

        antarSumYears += adYears;
        cursorAD = adEnd;
    });

    console.log(`Number of Antars containing birth: ${activeADCount}`);
    console.log(`Internal AD Sum = ${antarSumYears.toFixed(6)} years (matches mdTotal? ${Math.abs(antarSumYears - mdTotal) < 1e-10})`);

    // 3. Pratyantar Check (Sample Mars/Mars)
    console.log(`\n--- Pratyantar Formula & Sum Check (Mars/Mars) ---`);
    const adMarsYears = (DurationMap["Mars"] * 7) / 120; // 0.408333...
    let cursorPD = mdStart; // Mars AD starts at MD Start
    let totalPDSum = 0;

    VIMS_ORDER.forEach(lord => {
        // PD = (MD * AD * PD) / (120 * 120)
        // Here parentDuration is adMarsYears = (MD * AD) / 120
        // PD_years = (PD * parentDuration) / 120
        const pdYears = (DurationMap[lord] * adMarsYears) / 120;
        totalPDSum += pdYears;
        // Verify Sample Mars/Mars/Mars
        if (lord === "Mars") {
            const expectedM3 = (7 * 7 * 7) / (120 * 120);
            console.log(`Mars/Mars/Mars: ${pdYears.toFixed(6)} years (Expected: ${expectedM3.toFixed(6)})`);
        }
    });

    console.log(`Sum of all Pratyantars inside Mars AD: ${totalPDSum.toFixed(6)} years`);
    console.log(`AD Mars Duration: ${adMarsYears.toFixed(6)} years`);
    console.log(`Invariant Check: ${Math.abs(totalPDSum - adMarsYears) < 1e-10 ? "PASSED" : "FAILED"}`);
}

const birthUTC = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
const moonLon = 303.394;
verifyVimsottariLogic(birthUTC, moonLon);
