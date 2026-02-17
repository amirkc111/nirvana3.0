import { type PlanetEn } from "../../constants/Planet";
import { EXALTATION_DEGREES, SHADBALA_PLANETS } from "./constants";
import { MOD360 } from "../../services/utils";

/**
 * Calculates Uchcha Bala (Exaltation Strength)
 * Component of Sthana Bala.
 * 
 * Formula: (180 - |Longitude - ExaltationDegree|) / 3
 * Note: If diff > 180, take (360 - diff) to get shortest arc.
 */
export const calcUchchaBala = (planetName: PlanetEn, planetDegree: number): number => {
    if (!SHADBALA_PLANETS.includes(planetName)) return 0;

    const exaltPoint = EXALTATION_DEGREES[planetName];

    // Calculate absolute difference
    let diff = Math.abs(planetDegree - exaltPoint);

    // Normalize to shortest arc (0 to 180)
    if (diff > 180) {
        diff = 360 - diff;
    }

    // Maximum strength at 0 diff is 60.
    // Minimum strength at 180 diff is 0.
    const steps = (180 - diff);

    // Each 3 degrees of difference reduces strength by 1 unit.
    // Or: Strength = (180 - diff) / 3
    const strength = steps / 3;

    return parseFloat(strength.toFixed(2));
};
