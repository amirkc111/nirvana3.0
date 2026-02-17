import type { Planet } from "../../constants/Planet";
import { type PlanetEn } from "../../constants/Planet";
import { SHADBALA_PLANETS, NAISARGIKA_BALA } from "./constants";
import { calcSthanaBala } from "./SthanaBala";
import { calcDigBala } from "./DigBala";

export interface ShadbalaBreakdown {
    sthana: number;      // Positional
    dig: number;         // Directional
    kala: number;        // Temporal (Time)
    chesta: number;      // Motional
    naisargika: number;  // Natural
    drik: number;        // Aspectual
    total: number;       // In Shashtiamsas
    rupas: number;       // In Rupas (Total / 60)
}

export type ShadbalaResult = Record<PlanetEn, ShadbalaBreakdown>;

/**
 * Calculates Shadbala (6-fold Strength) for all planets.
 * 
 * @param planets Map of planet objects
 * @param isDayTime Boolean indicating if birth was during the day
 * @returns Breakdown of strength for each planet
 */
export const calcShadbala = (
    planets: Record<PlanetEn, Planet>,
    isDayTime: boolean
): ShadbalaResult => {

    const result: any = {};
    const ascDegree = planets.Ascendant?.degree || 0;

    for (const planetName of SHADBALA_PLANETS) {
        const p = planets[planetName];
        if (!p) continue;

        // 1. Sthana Bala (Positional)
        // Includes: Uchcha, Saptavarga (simplified), Ojayugma, Kendra, Drekkana (partially implemented)
        const sthana = calcSthanaBala(planetName, p);

        // 2. Dig Bala (Directional)
        const dig = calcDigBala(planetName, p.degree, ascDegree);

        // 3. Kala Bala (Temporal - Time)
        // Simplified Logic based on Day/Night
        // Moon, Mars, Saturn -> Strong at Night
        // Sun, Jupiter, Venus -> Strong at Day
        // Mercury -> Always Strong
        let kala = 30; // Base average
        if (planetName === "Mercury") {
            kala = 60;
        } else if (["Moon", "Mars", "Saturn"].includes(planetName)) {
            kala = !isDayTime ? 60 : 15;
        } else if (["Sun", "Jupiter", "Venus"].includes(planetName)) {
            kala = isDayTime ? 60 : 15;
        }

        // 4. Chesta Bala (Motional)
        // Simplified: Retrograde = 60, Direct = 30 (Average of various speeds)
        // Sun/Moon don't retrogade.
        let chesta = 30;
        if (["Sun", "Moon"].includes(planetName)) {
            // Sun/Moon Chesta is based on declination/Ayana usually. 
            // Using Naisargika proxy or average for now.
            chesta = 50;
        } else {
            // Use 'motion' property check if available, else derive from speed
            // Planet.ts has 'motion': "Vakri" | "Margi"
            chesta = (p.motion === "Vakri") ? 60 : 30;
        }

        // 5. Naisargika Bala (Natural) - Fixed
        const naisargika = NAISARGIKA_BALA[planetName] || 0;

        // 6. Drik Bala (Aspectual) - TODO
        // Requires calculating aspects from all benefic/malefic planets.
        // Placeholder 0 or simplified "Aspect count" could be done.
        // Leaving as 15 neutral for now to avoid 0 dragging averages down too much.
        const drik = 15;

        const total = sthana + dig + kala + chesta + naisargika + drik;

        result[planetName] = {
            sthana,
            dig,
            kala,
            chesta,
            naisargika,
            drik,
            total: parseFloat(total.toFixed(2)),
            rupas: parseFloat((total / 60).toFixed(2))
        };
    }

    return result as ShadbalaResult;
};
