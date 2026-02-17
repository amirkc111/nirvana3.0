import type { DateTime } from "luxon";
import type { Nakshatra } from "../constants/Nakshatra";
import type { NavagrahaEn } from "../constants/Planet";
import { reorderArray } from "../utils";

/** Represents a single Dasha period entry with calculated properties. */
export interface YoginiDasha {
    Name: string;
    Lord: NavagrahaEn;
    StartDate: DateTime;
    EndDate: DateTime;
    DurationYears: number;
    ChildDasha?: YoginiDasha[];
}

/** The duration in years for each Yogini in the 36-year cycle. */
import { computeDashaPoint, SOLAR_YEAR } from "../DashaCore";

/** Represents a single Dasha period entry with calculated properties. */
export interface YoginiDasha {
    Name: string;
    Lord: NavagrahaEn;
    StartDate: DateTime;
    EndDate: DateTime;
    DurationYears: number;
    ChildDasha?: YoginiDasha[];
}

/** The order and duration in years for each Yogini in the 36-year cycle. */
export const YOGINI_ORDER = [
    "Mangala", "Pingala", "Dhanya", "Bhramari",
    "Bhadrika", "Ulka", "Siddha", "Sankata"
];

export const YOGINI_YEARS: Record<string, number> = {
    "Mangala": 1, "Pingala": 2, "Dhanya": 3, "Bhramari": 4,
    "Bhadrika": 5, "Ulka": 6, "Siddha": 7, "Sankata": 8
};

export const YOGINI_LORDS: Record<string, NavagrahaEn> = {
    "Mangala": "Moon", "Pingala": "Sun", "Dhanya": "Jupiter", "Bhramari": "Mars",
    "Bhadrika": "Mercury", "Ulka": "Saturn", "Siddha": "Venus", "Sankata": "Rahu"
};

/**
 * Calculates the complete Yogini Dasha timeline for a 36-year cycle starting from birth.
 */
export function calcYoginiDasha(
    _moon_nakshatra: Nakshatra,
    DOB: DateTime
): YoginiDasha[] {
    // 1. Compute precise Moon position and Nakshatra fraction using Swiss Ephemeris
    const birthUTC = DOB.toUTC();
    const { nakIndex, fracRemaining } = computeDashaPoint(birthUTC);

    // 2. Identify starting Yogini at birth (Canonical offset +3 for 0-index)
    const startYoginiIndex = (nakIndex + 3) % 8;
    const startYoginiName = YOGINI_ORDER[startYoginiIndex];

    // 3. Calculate Balance at birth
    const initialDuration = YOGINI_YEARS[startYoginiName];
    const remainingYearsAtBirth = initialDuration * fracRemaining;

    // 4. Calculate exact start time of the current Yogini period
    const elapsedYears = initialDuration - remainingYearsAtBirth;
    const cycleStartDate = birthUTC.minus({ days: elapsedYears * SOLAR_YEAR });

    // Generate cycles up to 100 years (roughly 3 cycles)
    const totalTimeline: YoginiDasha[] = [];
    let cursor = cycleStartDate;

    // Safety cap: Birth + 100 years
    // Or simpler: just ensure we cover the "Target Date" if provided?
    // User wants to see "The Timeline". A 100 year timeline is standard.
    const limitDate = DOB.plus({ years: 100 });

    // Limit to reasonable number of cycles (e.g. 4) to prevent infinite loops if math fails
    for (let cycle = 0; cycle < 4; cycle++) {
        // If cursor is already past limit, stop
        if (cursor > limitDate) break;

        const cycleDashas = computeDasha(startYoginiName, cursor, 36, 36, 1);

        // Only add dashas that start before the limit
        // (Optional: filter out ones that end way before birth? No, historical is good too)

        // Filter out dashas that end before Birth (pre-birth dashas)
        // OR just keep them? Usually people want to see from Birth.
        // Yoginis are short (1-8 years), so CycleStart might be 20 years before birth.
        // We should filter the list to only show dashas relevant to the lifespan.

        cycleDashas.forEach(d => {
            // If dasha ends after birth AND starts before Limit
            if (d.EndDate > birthUTC && d.StartDate < limitDate) {
                totalTimeline.push(d);
            }
        });

        cursor = cycleDashas[cycleDashas.length - 1].EndDate;
    }

    // Final Polish: Clamp the very first Dasha's StartDate to DOB if it's earlier
    // Ideally, we show the full theoretical period, but users often find pre-birth dates confusing.
    // If the calculator is strictly "Timeline from Birth", we clamp.
    if (totalTimeline.length > 0) {
        if (totalTimeline[0].StartDate < birthUTC) {
            // We clone to avoid mutation side-effects if any
            totalTimeline[0] = {
                ...totalTimeline[0],
                StartDate: birthUTC
            };
        }
    }

    return totalTimeline;
}

/**
 * Recursive function to compute Yogini sub-periods.
 */
function computeDasha(
    startName: string,
    startDate: DateTime,
    parentDuration: number,
    cycleTotal: number = 36,
    level: number = 1
): YoginiDasha[] {
    const startIndex = YOGINI_ORDER.indexOf(startName);
    const sequence = [...YOGINI_ORDER.slice(startIndex), ...YOGINI_ORDER.slice(0, startIndex)];

    let cursor = startDate;

    return sequence.map(name => {
        const years = YOGINI_YEARS[name];
        const lord = YOGINI_LORDS[name];
        // sub duration = (Parent Duration * Sub Duration in cycle) / cycle total
        const durationYears = (parentDuration * years) / cycleTotal;
        const endDate = cursor.plus({ days: durationYears * SOLAR_YEAR });

        const dashaEntry: YoginiDasha = {
            Name: name,
            Lord: lord,
            StartDate: cursor,
            EndDate: endDate,
            DurationYears: durationYears,
            ChildDasha: level < 3 ? computeDasha(name, cursor, durationYears, cycleTotal, level + 1) : []
        };

        cursor = endDate;
        return dashaEntry;
    });
}
