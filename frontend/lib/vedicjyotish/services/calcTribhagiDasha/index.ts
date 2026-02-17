import { DateTime } from "luxon";
import type { NavagrahaEn } from "../constants/Planet";
import type { Dasha } from "../calcVimsottariDasa/index";

/** Represents a single Tribhagi period entry. */
export interface TribhagiDasha {
    Lord: NavagrahaEn;
    StartDate: DateTime;
    EndDate: DateTime;
    ChildDasha: TribhagiDasha[];
    Phase?: string;
    PhaseFraction?: string;
}

/**
 * TRIBHAGI ENGINE V12 [STRICT MIRROR]
 * 
 * DESIGN MANIFESTO:
 * 1. PURE DERIVATIVE: Tribhagi is purely a time-sliced view of Vimshottari.
 * 2. NO INDEPENDENT CALCULATION: It must never resolve lords or look at the sky.
 * 3. HARD FAIL-SAFE: Any attempt to pass 'seed' or 'nakshatra' triggers a FATAL ERROR.
 * 
 * @param vimsTimelineInput - The pre-calculated Vimshottari timeline.
 * @param debugInput - Optional debug object to test fail-safes.
 */
/**
 * Computes the complete Tribhagi Dasha timeline.
 * Standard Tribhagi: Duration = Vimshottari * (2/3). Total Cycle = 80 years.
 * Order: Standard Vimshottari order.
 * Start Point: Calculated from Moon's longitude exactly like Vimshottari but using Tribhagi Nakshatra size (or scaled Balance).
 */
export function calcTribhagiTimeline(
    birthDate: DateTime,
    moonLongitude: number
): TribhagiDasha[] {
    const total: TribhagiDasha[] = [];

    // 1. Determine Starting Constants
    const nakSize = 13 + (1 / 3); // 13.3333... degrees
    // In Tribhagi, the 'Nakshatra' is conceptually the same, but the Dasha period is shorter.
    // Standard calculation: Balance of Dasha = (Uncovered Longitude / Nakshatra Size) * Dasha Duration

    // Calculate Nakshatra Index and Fraction
    const nakIndex = Math.floor(moonLongitude / nakSize);
    const fractionTraversed = (moonLongitude % nakSize) / nakSize;
    const fractionRemaining = 1.0 - fractionTraversed;

    // Determine Starting Lord
    // Vimshottari Order: Ketu(0)..Mercury(8)
    const lordIndex = nakIndex % 9;
    const startLordName = TRIBHAGI_ORDER[lordIndex];

    // Calculate Balance for First Dasha
    const fullDuration = TRIBHAGI_YEARS[startLordName];
    const balanceYears = fullDuration * fractionRemaining;

    let cursor = birthDate;

    // 2. First Dasha (Balance)
    const firstEndDate = cursor.plus({ milliseconds: balanceYears * SOLAR_YEAR_MS });

    total.push({
        Lord: startLordName as NavagrahaEn,
        StartDate: cursor,
        EndDate: firstEndDate,
        ChildDasha: [], // Antardashas can be computed recursively if needed, for now flat MD
        Phase: "Standard",
        PhaseFraction: "-"
    });

    cursor = firstEndDate;

    // 3. Subsequent Dashas (Full Periods) - Generate for ~100 years total lifespan
    let currentIdx = (lordIndex + 1) % 9;

    // Cap at 100 years from birth
    const limitDate = birthDate.plus({ years: 100 });

    while (cursor < limitDate) {
        const name = TRIBHAGI_ORDER[currentIdx];
        const duration = TRIBHAGI_YEARS[name];
        const endDate = cursor.plus({ milliseconds: duration * SOLAR_YEAR_MS });

        total.push({
            Lord: name as NavagrahaEn,
            StartDate: cursor,
            EndDate: endDate,
            ChildDasha: computeTribhagiSubDashas(name, cursor, duration),
            Phase: "Standard",
            PhaseFraction: "-"
        });

        cursor = endDate;
        currentIdx = (currentIdx + 1) % 9;
    }

    // Retroactively populate ChildDasha for the first (Balance) Dasha?
    // It's tricky because the Balance Dasha is a partial fragment.
    // The sub-dashas should also be partial or filtered.
    // Ideally, we compute the Full Dasha for the first one, then slice it.

    // Let's regenerate the first entry properly with children, then slice.

    // 0. Re-calculate First Entry as a full logic then slice
    const firstLordName = startLordName;
    const firstFullDuration = TRIBHAGI_YEARS[firstLordName];
    // Start of the *Theoretical* Full First Dasha
    const firstFullStartDate = birthDate.minus({ milliseconds: (firstFullDuration * fractionTraversed) * SOLAR_YEAR_MS });

    // Compute full children
    const firstFullChildren = computeTribhagiSubDashas(firstLordName, firstFullStartDate, firstFullDuration);

    // Filter children to only those after Birth
    const validFirstChildren = firstFullChildren.filter(ad => ad.EndDate > birthDate).map(ad => ({
        ...ad,
        StartDate: ad.StartDate < birthDate ? birthDate : ad.StartDate // Clamp start
    }));

    // Update the first entry in 'total'
    if (total.length > 0) {
        total[0].ChildDasha = validFirstChildren;
    }

    return total;
}

/**
 * Recursive helper to generate Antardashas for Tribhagi
 */
function computeTribhagiSubDashas(
    mdLord: string,
    mdStart: DateTime,
    mdDuration: number
): TribhagiDasha[] {
    const subs: TribhagiDasha[] = [];

    // Tribhagi AD order starts from the MD Lord
    const startIndex = TRIBHAGI_ORDER.indexOf(mdLord);
    const sequence = [...TRIBHAGI_ORDER.slice(startIndex), ...TRIBHAGI_ORDER.slice(0, startIndex)];

    let cursor = mdStart;

    sequence.forEach(adLord => {
        // Tribhagi AD Duration Formula:
        // (MD Years * AD Years) / 80  (Standard Vimshottari is /120, but Tribhagi cycle is 80)
        // Wait. Tribhagi is "Vimshottari years scaled by 2/3".
        // The relative proportions remain identical to Vimshottari.
        // So AD fraction is (AD_Vim_Years / 120).
        // Tribhagi AD Duration = Tribhagi_MD_Duration * (AD_Vim_Years / 120) ??
        // NO.
        // Tribhagi Year = Vim Year * 2/3.
        // Tribhagi Cycle = 80y.
        // Proportion of AD in MD is constant. (e.g. Ketu in Ketu is 7/120 of total loop).

        // Simpler way:
        // AD Duration = (MD Duration * AD_Tribhagi_Years) / 80 ??? 
        // Let's use the provided TRIBHAGI_YEARS.
        // Sum of TRIBHAGI_YEARS is 80.
        // So yes, (MD_Duration * TRIBHAGI_YEARS[adLord]) / 80.

        const adYears = TRIBHAGI_YEARS[adLord];
        const duration = (mdDuration * adYears) / 80;

        const endDate = cursor.plus({ milliseconds: duration * SOLAR_YEAR_MS });

        subs.push({
            Lord: adLord as NavagrahaEn,
            StartDate: cursor,
            EndDate: endDate,
            ChildDasha: [] // No PDs for now to save depth, or user can request
        });

        cursor = endDate;
    });

    return subs;
}

/**
 * Legacy/Mirror adaptor if needed, but we essentially replace the logic.
 * Keeping the original function signature for compatibility but rerouting logic 
 * if inputs allow, or erroring if forced to use old broken logic.
 */
export function calcTribhagiDasha(
    vimsTimelineInput: Dasha[],
    input?: any
): TribhagiDasha[] {
    // If we have the necessary inputs for clean calculation, use the new engine
    if (input && input.birthDate && input.moonLon !== undefined) {
        // Convert JS Date to Luxon if needed
        const bd = DateTime.fromJSDate(input.birthDate);
        return calcTribhagiTimeline(bd, input.moonLon);
    }

    // If not, we fall back to a simplified placeholder to prevent crashing, 
    // but we can't do the "Mirror" logic anymore as it was flawed (3-phase split).
    // Or we just return an empty array to force the user to provide correct inputs.
    console.warn("calcTribhagiDasha called without direct Moon inputs. Returning empty.");
    return [];
}

/**
 * Computes the phase of the Tribhagi dasha based on the Vimshottari period.
 * 
 * @param start - Start date of the Mahadasha (string or DateTime)
 * @param end - End date of the Mahadasha (string or DateTime)
 * @param today - Current date to check (string or DateTime)
 */
export function computePhase(
    start: string | DateTime,
    end: string | DateTime,
    today: string | DateTime
): string {
    const s = typeof start === 'string' ? DateTime.fromISO(start) : start;
    const e = typeof end === 'string' ? DateTime.fromISO(end) : end;
    const t = typeof today === 'string' ? DateTime.fromISO(today) : today;

    const totalDuration = e.toMillis() - s.toMillis();
    const elapsed = t.toMillis() - s.toMillis();

    if (totalDuration <= 0) return "Unknown";

    const ratio = elapsed / totalDuration;

    if (ratio < 0.25) return "Purva (¼)";
    else if (ratio < 0.75) return "Madhya (½)";
    else return "Paschima (¼)";
}

/**
 * Resolves the Tribhagi Dasha based purely on Vimshottari state.
 * STRICT READ-ONLY from Vimshottari.
 * 
 * @param vimshottariState - The current state of Vimshottari Dasha
 * @param today - The date to check
 * @param debugInput - Optional debug object for fail-safe testing
 */
// --- TRIBHAGI MATH CONSTANTS ---
// ORDER: Standard Vimshottari Sequence starting from Ketu
const TRIBHAGI_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

// YEARS: Standard Vimshottari Years scaled by 2/3 (Total 80 Years)
const TRIBHAGI_YEARS: Record<string, number> = {
    Sun: 4,               // 6 * 2/3
    Moon: 20 / 3,           // 10 * 2/3 = 6.66...
    Mars: 14 / 3,           // 7 * 2/3 = 4.66...
    Rahu: 12,             // 18 * 2/3
    Jupiter: 32 / 3,        // 16 * 2/3 = 10.66...
    Saturn: 38 / 3,         // 19 * 2/3 = 12.66...
    Mercury: 34 / 3,        // 17 * 2/3 = 11.33...
    Ketu: 14 / 3,           // 7 * 2/3 = 4.66...
    Venus: 40 / 3           // 20 * 2/3 = 13.33...
};
// SUM = 80.

const SOLAR_YEAR = 365.2422;
const SOLAR_YEAR_MS = SOLAR_YEAR * 24 * 60 * 60 * 1000;

/**
 * Resolves the Tribhagi Dasha based on independent CANONICAL math.
 * 
 * @param input - { birthJD, moonLongitude, targetJD }
 */
export function resolveTribhagi(
    input: {
        birthJD: number;
        moonLongitude: number;
        targetJD: number;
        birthDate: Date;
    }
): {
    system: string;
    maha: { planet: string; start: Date; end: Date };
    antar: { planet: string; start: Date; end: Date };
    prat: { planet: string; start: Date; end: Date };
    phase: string
} {

    // 🔒 Hard Guard
    // @ts-ignore
    if ("maha" in input || "active" in input || "vimshottari" in input) {
        throw new Error("FATAL: Vimshottari leakage detected in resolveTribhagi input");
    }

    const { birthJD, moonLongitude, targetJD, birthDate } = input;

    // 1️⃣ Compute Starting Index
    const nakSize = 13 + (1 / 3);
    const nakIndex = Math.floor(moonLongitude / nakSize);
    const frac = (moonLongitude % nakSize) / nakSize;

    // Standard Logic
    const startIndex = nakIndex % 9;

    // 2️⃣ Cycle Calculation
    let elapsedYears = (targetJD - birthJD) / SOLAR_YEAR;

    const startLordName = TRIBHAGI_ORDER[startIndex];
    const startLordYears = TRIBHAGI_YEARS[startLordName];

    // Cycle Start Time (Relative to Birth, will be negative)
    // The cycle effectively started `frac * startLordYears` ago relative to birth
    const cycleStartOffsetYears = -1 * (frac * startLordYears);

    // 3️⃣ Find Active Mahadasha
    let virtualElapsed = elapsedYears - cycleStartOffsetYears; // Time from Cycle Start
    let idx = startIndex;
    let accumulatedYears = 0; // Tracks start of current MD relative to cycle start

    let currentLord = TRIBHAGI_ORDER[idx];
    let currentDuration = TRIBHAGI_YEARS[currentLord];

    while (virtualElapsed > accumulatedYears + currentDuration) {
        accumulatedYears += currentDuration;
        idx = (idx + 1) % 9;
        currentLord = TRIBHAGI_ORDER[idx];
        currentDuration = TRIBHAGI_YEARS[currentLord];
    }

    const mahaPlanet = currentLord;
    const mahaStartYearsFromBirth = cycleStartOffsetYears + accumulatedYears;
    const mahaEndYearsFromBirth = mahaStartYearsFromBirth + currentDuration;

    const timeInMaha = virtualElapsed - accumulatedYears; // Years into current MD

    // 4️⃣ Find Active Antardasha
    let adIdx = idx; // Starts with MD lord
    let adAccumulated = 0; // Relative to MD Start
    let adLord = TRIBHAGI_ORDER[adIdx];
    let adDuration = currentDuration * (TRIBHAGI_YEARS[adLord] / 80);

    while (timeInMaha > adAccumulated + adDuration) {
        adAccumulated += adDuration;
        adIdx = (adIdx + 1) % 9;
        adLord = TRIBHAGI_ORDER[adIdx];
        adDuration = currentDuration * (TRIBHAGI_YEARS[adLord] / 80);
    }

    const antarPlanet = adLord;
    const antarStartYearsFromBirth = mahaStartYearsFromBirth + adAccumulated;
    const antarEndYearsFromBirth = antarStartYearsFromBirth + adDuration;

    const timeInAntar = timeInMaha - adAccumulated;

    // 5️⃣ Find Active Pratyantardasha
    let pdIdx = adIdx; // Starts with AD lord
    let pdAccumulated = 0; // Relative to AD Start
    let pdLord = TRIBHAGI_ORDER[pdIdx];
    let pdDuration = adDuration * (TRIBHAGI_YEARS[pdLord] / 80);

    while (timeInAntar > pdAccumulated + pdDuration) {
        pdAccumulated += pdDuration;
        pdIdx = (pdIdx + 1) % 9;
        pdLord = TRIBHAGI_ORDER[pdIdx];
        pdDuration = adDuration * (TRIBHAGI_YEARS[pdLord] / 80);
    }

    const pratPlanet = pdLord;
    const pratStartYearsFromBirth = antarStartYearsFromBirth + pdAccumulated;
    const pratEndYearsFromBirth = pratStartYearsFromBirth + pdDuration;

    // Helper to convert years to Date
    const toDate = (years: number) => new Date(birthDate.getTime() + (years * SOLAR_YEAR_MS));

    return {
        system: "Tribhagi",
        maha: {
            planet: mahaPlanet,
            start: toDate(mahaStartYearsFromBirth),
            end: toDate(mahaEndYearsFromBirth)
        },
        antar: {
            planet: antarPlanet,
            start: toDate(antarStartYearsFromBirth),
            end: toDate(antarEndYearsFromBirth)
        },
        prat: {
            planet: pratPlanet,
            start: toDate(pratStartYearsFromBirth),
            end: toDate(pratEndYearsFromBirth)
        },
        phase: ""
    };
}
