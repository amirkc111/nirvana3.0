
const { DateTime } = require("luxon");

// --- TRIBHAGI MATH CONSTANTS ---
// ORDER: Matches Standard Vimshottari Sequence starting from Ketu (Index 0)
const TRIBHAGI_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const TRIBHAGI_YEARS = {
    Ketu: 2, Venus: 8, Sun: 4, Moon: 3, Mars: 5,
    Rahu: 10, Jupiter: 7, Saturn: 9, Mercury: 6
};

const SOLAR_YEAR = 365.2422;

function resolveTribhagi(input) {
    const { birthJD, moonLongitude, targetJD } = input;

    // 1️⃣ Compute Starting Index
    const nakSize = 13 + (1 / 3); // 13.3333... degrees per Nakshatra
    const nakIndex = Math.floor(moonLongitude / nakSize);

    // Fraction traversed in current nakshatra (0..1)
    const frac = (moonLongitude % nakSize) / nakSize;

    // 🛑 Rule V2: (NakIndex * 3) % 9
    const startIndex = (nakIndex * 3) % 9;
    const startLordName = TRIBHAGI_ORDER[startIndex];

    console.log("[DEBUG] Anchoring Logic", {
        moonLongitude,
        nakIndex,
        frac,
        startIndex,
        startLordName
    });

    // 2️⃣ Walk Tribhagi Cycle
    const elapsedYears = (targetJD - birthJD) / SOLAR_YEAR;
    const startLordYears = TRIBHAGI_YEARS[startLordName];

    // Virtual Elapsed: Current Time + Time "Spent" before birth?
    // wait, logic in code: virtualElapsed = elapsedYears + (frac * startLordYears);
    // This assumes we start at `frac` into the cycle, so we add it to see where we are relative to start=0.
    const virtualElapsed = elapsedYears + (frac * startLordYears);

    console.log("[DEBUG] Time Walk", {
        elapsedYears,
        startLordYears,
        virtualElapsed
    });

    // 3️⃣ Find Active Mahadasha
    let idx = startIndex;
    let currentLord = TRIBHAGI_ORDER[idx];
    let currentDuration = TRIBHAGI_YEARS[currentLord];
    let tempElapsed = virtualElapsed;

    while (tempElapsed > currentDuration) {
        // console.log(`passed ${currentLord} (${currentDuration})`);
        tempElapsed -= currentDuration;
        idx = (idx + 1) % 9;

        currentLord = TRIBHAGI_ORDER[idx];
        currentDuration = TRIBHAGI_YEARS[currentLord];
    }

    const maha = currentLord;
    const timeInMaha = tempElapsed;

    // 4️⃣ Find Antardasha
    const antarLen = currentDuration / 9;
    const antarIdxOffset = Math.floor(timeInMaha / antarLen);
    const antar = TRIBHAGI_ORDER[(idx + antarIdxOffset) % 9];

    // 5️⃣ Find Pratyantar
    const timeInAntar = timeInMaha % antarLen;
    const pratLen = antarLen / 9;
    const pratIdxOffset = Math.floor(timeInAntar / pratLen);
    const prat = TRIBHAGI_ORDER[(idx + antarIdxOffset + pratIdxOffset) % 9];

    return { maha, antar, prat, timeInMaha };
}

// --- CALCULATION ---

// User Data
const birthJD = 2450754.5000037192; // 1997-11-02 12:07 UT?? 
// Wait, 1997-11-02 12:07 UT is 2450755.00486?
// The file says tjd_ut: 2450754.5.
// 2450754.5 is Nov 02, 00:00 UT.
// JSON basicInfo: "birthTime": "12:07" (Local? Nepal is +5.75).
// 12:07 - 5:45 = 06:22 UT.
// TJD 2450754.5 is near midnight.
// I will use `tjd_ut` from JSON as the absolute truth for birth moment.

const moonLon = 217.18568868222738;
// Target Date: 2026-01-03
// J2000 epoch: 2451545.0.
// We can use a rough calc or Luxon.
// I'll use Luxon if I installed it, but I'll assume simple math for script.
// UTC: 2026-01-03 00:00.
// Diff from 1997-11-02:
// Years: 2025 - 1997 = 28 years + ~50 days.
// Let's rely on days.
// 2026-01-03 vs 1997-11-02.
// 2026 is (2026-1997) = 29th year start.
// Days approx: 28 * 365.25 + 60 = 10227 + 60 = 10287.
// 10287 / 365.2422 = 28.16 years.
const daysDiff = (new Date("2026-01-03").getTime() - new Date("1997-11-02").getTime()) / (1000 * 3600 * 24);
const targetJD = birthJD + daysDiff;

console.log("Calculated TargetJD", targetJD);
console.log("Diff Years", (targetJD - birthJD) / SOLAR_YEAR);

const res = resolveTribhagi({
    birthJD,
    moonLongitude: moonLon,
    targetJD
});

console.log("\nRESULT:", res);
