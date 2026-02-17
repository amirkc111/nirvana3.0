import type { Planet } from "../../constants/Planet";
import { type PlanetEn } from "../../constants/Planet";
import { ASHTAKAVARGA_RULES, AV_PLANETS } from "./constants";
import { NORMALIZE12 } from "../../services/utils";

/**
 * Calculates the Bhinnashtakavarga (Individual Ashtakavarga) for a specific planet.
 * 
 * @param planetName The name of the planet for which AV is being calculated (e.g., 'Sun')
 * @param planets The full map of planetary objects (including Ascendant)
 * @returns Array of 12 numbers representing points for each Rasi (0=Aries, 11=Pisces)
 */
export const calcBhinnashtakavarga = (
    planetName: PlanetEn,
    planets: Record<PlanetEn, Planet>
): number[] => {
    // Initialize 12 signs with 0 points
    // Index 0 = Aries, 11 = Pisces
    const points = new Array(12).fill(0);

    const rules = ASHTAKAVARGA_RULES[planetName];
    if (!rules) {
        // Return zeros if no rules exist (e.g. Rahu)
        return points;
    }

    // Iterate through all source bodies (Sun...Saturn + Ascendant)
    const sources: PlanetEn[] = [...AV_PLANETS, "Ascendant"];

    for (const sourceName of sources) {
        const sourceOffsets = rules[sourceName];
        const sourcePlanet = planets[sourceName];

        if (sourceOffsets && sourcePlanet) {
            // Get source planet's sign (1-based, Aries=1)
            const sourceSignNum = sourcePlanet.rasi.rasi_num;

            // Apply each offset
            for (const offset of sourceOffsets) {
                // Calculate target sign index (0-based)
                // Formula: (SourceSign - 1 + Offset - 1) % 12
                // Example: Sun in Aries (1). Offset 1. (1-1 + 1-1) = 0 (Aries)
                // Example: Sun in Aries (1). Offset 2. (1-1 + 2-1) = 1 (Taurus)
                const targetSignIndex = (sourceSignNum - 1 + offset - 1) % 12;

                points[targetSignIndex]++;
            }
        }
    }

    return points;
};
