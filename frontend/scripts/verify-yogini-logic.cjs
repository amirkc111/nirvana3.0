const { DateTime } = require('luxon');

const YOGINI_ORDER = [
    "Mangala", "Pingala", "Dhanya", "Bhramari",
    "Bhadrika", "Ulka", "Siddha", "Sankata"
];

const YOGINI_YEARS = {
    "Mangala": 1, "Pingala": 2, "Dhanya": 3, "Bhramari": 4,
    "Bhadrika": 5, "Ulka": 6, "Siddha": 7, "Sankata": 8
};

const SOLAR_YEAR = 365.2422;

function verifyYoginiLogic(birthUTC, moonLon) {
    console.log(`--- Yogini Anchoring Verification ---`);
    console.log(`Birth (UTC): ${birthUTC.toISO()}`);

    // 1. Nakshatra math
    const NAK_SIZE = 13 + 20 / 60;
    const nakIndex = Math.floor(moonLon / NAK_SIZE);
    const inNak = moonLon - (nakIndex * NAK_SIZE);
    const fracRemaining = 1 - (inNak / NAK_SIZE);

    // 2. Starting Yogini
    const startYoginiIndex = nakIndex % 8;
    const startYoginiName = YOGINI_ORDER[startYoginiIndex];

    // 3. Balance & Elapsed
    const initialYears = YOGINI_YEARS[startYoginiName];
    const balance = initialYears * fracRemaining;
    const elapsed = initialYears - balance;

    const mdStart = birthUTC.minus({ days: elapsed * SOLAR_YEAR });
    const mdEnd = mdStart.plus({ days: initialYears * SOLAR_YEAR });

    console.log(`Nakshatra Index: ${nakIndex}`);
    console.log(`Yogini Index (nakIndex % 8): ${startYoginiIndex}`);
    console.log(`Starting Yogini: ${startYoginiName}`);
    console.log(`Initial Years: ${initialYears}`);
    console.log(`Frac Remaining: ${fracRemaining.toFixed(6)}`);
    console.log(`Balance: ${balance.toFixed(6)} years`);
    console.log(`Elapsed: ${elapsed.toFixed(6)} years`);
    console.log(`MD Start: ${mdStart.toISO()}`);
    console.log(`MD End:   ${mdEnd.toISO()}`);

    // Check consistency with MD Start found in Vimshottari check
    const VIMS_MD_START = "1984-09-19T21:17:29.984Z";
    console.log(`Yogini MD Start matches Vimshottari MD Start? ${mdStart.toISO().startsWith("1984-09-19")}`);
}

const birthUTC = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
const moonLon = 303.394;
verifyYoginiLogic(birthUTC, moonLon);
