import type { DateTime } from "luxon";
import { AntarDashaPhal } from "./AntarDashaPhal";
import { MahaDashaPhal } from "./MahaDashaPhal";
import { tropicalYearExtended } from "./MeanTropicalYear";
import type { Nakshatra } from "../constants/Nakshatra";
import type { NavagrahaEn } from "../constants/Planet";
import type { SourceBookEn, Translation } from "../types";
import { reorderArray } from "../utils";

/** TYPE DEFINITIONS */

/** Represents the astrological phala (results) from a source text. */
export type DashaPhal = Partial<
    Record<SourceBookEn, Translation<string, string>>
>;

/** Enumerates the different levels of Vimsottari Dasha periods. */
export type DashaName =
    | "MahaDasha"
    | "AntarDasha"
    | "PratyantarDasha"
    | "SookshmaDasha"
    | "PraanaDasha"
    | "DehaDasha";

/** Represents a single Dasha period entry with all its calculated properties. */
export interface Dasha {
    Name: DashaName;
    Lord: NavagrahaEn;
    StartDate: DateTime;
    EndDate: DateTime;
    Phal: DashaPhal;
    ChildDasha: Dasha[];
}

import { computeDashaPoint, SOLAR_YEAR } from "../DashaCore";

/** STATIC DATA */

/** The duration in years for each planetary lord in the Vimsottari Dasha system. */
export const DurationOfVimsottariDasa: Record<NavagrahaEn, number> = {
    Ketu: 7,
    Venus: 20,
    Sun: 6,
    Moon: 10,
    Mars: 7,
    Rahu: 18,
    Jupiter: 16,
    Saturn: 19,
    Mercury: 17,
};

const VIMS_ORDER: NavagrahaEn[] = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const childDasha: Record<DashaName, DashaName | undefined> = {
    MahaDasha: "AntarDasha",
    AntarDasha: "PratyantarDasha",
    PratyantarDasha: "SookshmaDasha",
    SookshmaDasha: "PraanaDasha",
    PraanaDasha: "DehaDasha",
    DehaDasha: undefined,
};

/**
 * Calculates the complete Vimsottari Dasha tree from the date of birth.
 *
 * @param JD - The Julian Day number (kept for signature compatibility).
 * @param _moon_nakshatra - The Nakshatra (ignored in favor of higher precision DashaCore computation).
 * @param DOB - The date and time of birth as a Luxon DateTime object.
 * @returns An array of MahaDasha objects, each containing its sub-dashas.
 */
export function calcVimsottariDasa(
    JD: number,
    _moon_nakshatra: Nakshatra,
    DOB: DateTime
): Dasha[] {
    // 1. Compute precise Moon position and Nakshatra fraction using Swiss Ephemeris
    const birthUTC = DOB.toUTC();
    const { moonLongitude, nakIndex, fracRemaining } = computeDashaPoint(birthUTC);

    // 2. Identify Mahadasha lord at birth
    const mdLord = VIMS_ORDER[nakIndex % 9];

    // 3. Calculate Balance at birth
    const mdTotal = DurationOfVimsottariDasa[mdLord];
    const mdBalanceYears = mdTotal * fracRemaining;

    // 4. Calculate exact Mahadasha start time (when the first planet's MD started before birth)
    const elapsedYears = mdTotal - mdBalanceYears;
    const StartDate = birthUTC.minus({ days: elapsedYears * SOLAR_YEAR });

    // 5. Automated Assertion: Birth must lie inside the starting Mahadasha
    const mdEndDate = StartDate.plus({ days: mdTotal * SOLAR_YEAR });
    if (!(StartDate.toMillis() <= birthUTC.toMillis() && birthUTC.toMillis() < mdEndDate.toMillis())) {
        console.error("Dasha Hardening Error: Birth time outside Mahadasha bounds", {
            birth: birthUTC.toISO(),
            start: StartDate.toISO(),
            end: mdEndDate.toISO()
        });
        throw new Error("Dasha calculation internal inconsistency: birth time not bounded by Mahadasha.");
    }

    // 6. Deterministic Hardened Log (Once per chart)


    // 7. Compute the full Dasha tree starting from the MahaDasha level.
    return computeDasha(
        "MahaDasha",
        mdLord,
        StartDate,
        SOLAR_YEAR,
        120 // The total duration of all Maha Dashas is 120 years.
    );
}

/**
 * A recursive function to compute Dasha periods at different levels (Maha,
 * Antar, etc.).
 *
 * @param dashaName - The name of the current Dasha level being calculated.
 * @param parentLord - The planetary lord of the parent Dasha.
 * @param startDate - The start date of the current Dasha sequence.
 * @param solarYear - The length of the tropical year in days.
 * @param parentDuration - The total duration of the parent Dasha sequence in
 *   years.
 * @returns An array of Dasha objects for the current level.
 */
function computeDasha(
    dashaName: DashaName,
    parentLord: NavagrahaEn,
    startDate: DateTime,
    solarYear: number,
    parentDuration: number
): Dasha[] {
    // Get the sequence of lords for the current Dasha level, starting with the parent lord.
    const sequence = reorderArray(
        VIMS_ORDER,
        parentLord
    ) as NavagrahaEn[];

    let cursor = startDate;

    return sequence.map(currentLord => {
        // Calculate the duration of the current Dasha period.
        // The duration of a sub-dasha is proportional to its lord's period
        // relative to the total 120-year cycle.
        const durationYears =
            (DurationOfVimsottariDasa[currentLord] * parentDuration) / 120;

        const endDate = cursor.plus({ days: durationYears * solarYear });

        const childDashaName = childDasha[dashaName];

        const dashaEntry: Dasha = {
            Name: dashaName,
            Lord: currentLord,
            StartDate: cursor,
            EndDate: endDate,
            // Assign the correct Phal (results) based on the Dasha level.
            Phal:
                dashaName === "MahaDasha"
                    ? MahaDashaPhal[currentLord]
                    : dashaName === "AntarDasha"
                        ? AntarDashaPhal[parentLord]?.[currentLord]
                        : {},
            // Recursively compute the next level of child dashas if they exist.
            ChildDasha:
                childDashaName === "AntarDasha" ||
                    childDashaName === "PratyantarDasha"
                    ? computeDasha(
                        childDashaName,
                        currentLord,
                        cursor,
                        solarYear,
                        durationYears
                    )
                    : [],
        };

        // Advance the cursor to the end date for the next iteration.
        cursor = endDate;
        return dashaEntry;
    });
}
