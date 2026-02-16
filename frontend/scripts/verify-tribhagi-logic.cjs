const { DateTime } = require('luxon');

const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const DurationMap = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const SOLAR_YEAR = 365.2422;

function verifyTribhagiLogic(birthUTC, moonLon) {
    console.log(`--- Tribhagi Anchoring & Shift Verification ---`);
    console.log(`Birth (UTC): ${birthUTC.toISO()}`);

    // 1. Nakshatra math
    const NAK_SIZE = 13 + 20 / 60;
    const nakIndex = Math.floor(moonLon / NAK_SIZE);
    const inNak = moonLon - (nakIndex * NAK_SIZE);
    const fracRemaining = 1 - (inNak / NAK_SIZE);

    // 2. Nakshatra Subdivision
    const PART_SIZE = NAK_SIZE / 3;
    const partIndex = Math.floor(inNak / PART_SIZE);

    // 3. Planet Shift
    const baseLord = VIMS_ORDER[nakIndex % 9];
    const startPlanet = VIMS_ORDER[(nakIndex + partIndex) % 9];

    // 4. Tribhagi Duration & Balance
    const vimsYears = DurationMap[startPlanet];
    const tribhagiYears = vimsYears / 3;
    const balance = tribhagiYears * fracRemaining;
    const elapsed = tribhagiYears - balance;

    const mdStart = birthUTC.minus({ days: elapsed * SOLAR_YEAR });
    const mdEnd = mdStart.plus({ days: tribhagiYears * SOLAR_YEAR });

    console.log(`In-Nakshatra Longitude: ${inNak.toFixed(6)}°`);
    console.log(`Part Index: ${partIndex}`);
    console.log(`Base Vimshottari Lord: ${baseLord}`);
    console.log(`Tribhagi Starting Lord: ${startPlanet}`);
    console.log(`Tribhagi Years (vimsYears / 3): ${tribhagiYears.toFixed(6)}`);
    console.log(`Frac Remaining: ${fracRemaining.toFixed(6)}`);
    console.log(`Balance: ${balance.toFixed(6)} years`);
    console.log(`Elapsed: ${elapsed.toFixed(6)} years`);
    console.log(`MD Start: ${mdStart.toISO()}`);
    console.log(`MD End:   ${mdEnd.toISO()}`);

    // Verification flags
    const expectedPartIndex = 2;
    const expectedLord = "Jupiter";
    console.log(`Part Index correct? ${partIndex === expectedPartIndex}`);
    console.log(`Starting Lord correct? ${startPlanet === expectedLord}`);
}

const birthUTC = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
const moonLon = 303.394;
verifyTribhagiLogic(birthUTC, moonLon);
