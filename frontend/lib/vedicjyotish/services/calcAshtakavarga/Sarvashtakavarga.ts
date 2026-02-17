import type { Planet } from "../../constants/Planet";
import { type PlanetEn } from "../../constants/Planet";
import { AV_PLANETS } from "./constants";
import { calcBhinnashtakavarga } from "./Bhinnashtakavarga";

export interface AshtakavargaResult {
    // Individual points for each planet (key) across 12 signs
    bhinnashtakavarga: Record<PlanetEn, number[]>;
    // Total points for each sign (0=Aries ... 11=Pisces)
    sarvashtakavarga: number[];
}

/**
 * Calculates the complete Ashtakavarga for a chart.
 * 
 * @param planets The full map of planetary objects (including Ascendant)
 * @returns Object containing both Bhinnashtakavarga and Sarvashtakavarga
 */
export const calcSarvashtakavarga = (
    planets: Record<PlanetEn, Planet>
): AshtakavargaResult => {

    const result: AshtakavargaResult = {
        bhinnashtakavarga: {} as Record<PlanetEn, number[]>,
        sarvashtakavarga: new Array(12).fill(0)
    };

    // 1. Calculate Individual (Bhinna) AV for all 7 planets
    for (const planetName of AV_PLANETS) {
        const points = calcBhinnashtakavarga(planetName, planets);
        result.bhinnashtakavarga[planetName] = points;

        // 2. Add to Total (Sarva) AV
        for (let i = 0; i < 12; i++) {
            result.sarvashtakavarga[i] += points[i];
        }
    }

    return result;
};
