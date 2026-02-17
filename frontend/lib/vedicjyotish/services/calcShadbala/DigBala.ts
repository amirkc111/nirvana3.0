import type { PlanetEn } from "../../constants/Planet";
import { SHADBALA_PLANETS } from "./constants";
import { MOD360 } from "../../services/utils";

/**
 * Calculates Dig Bala (Directional Strength)
 * 
 * Power Points (Zero distance = Max Strength 60):
 * - Mercury, Jupiter: Ascendant (1st House)
 * - Moon, Venus: Nadir (4th House) -> Asc + 90 approx
 * - Saturn: Descendant (7th House) -> Asc + 180
 * - Sun, Mars: Midheaven (10th House) -> Asc + 270 approx
 */
export const calcDigBala = (
    planetName: PlanetEn,
    planetDegree: number,
    ascendantDegree: number
): number => {
    if (!SHADBALA_PLANETS.includes(planetName)) return 0;

    // 1. Determine Power Point Degree based on Ascendant
    let powerPoint = 0;

    switch (planetName) {
        case "Mercury":
        case "Jupiter":
            powerPoint = ascendantDegree; // East
            break;
        case "Moon":
        case "Venus":
            powerPoint = MOD360(ascendantDegree + 90); // North (IC) - Note: In South Indian chart North is 4th? In Vedic context 4th is Nadir.
            // Correction: In Vedic, 4th house is North (Patala).
            // But visually in maps, Up is North. In charts, 10th is South (Midheaven).
            // Actually:
            // 1st (East), 7th (West)
            // 10th (South/Zenith), 4th (North/Nadir)
            // Sun/Mars strong in 10th (South)
            // Moon/Venus strong in 4th (North)
            // Merc/Jup strong in 1st (East)
            // Saturn strong in 7th (West)
            // So logic assumes 4th is +90 from Ascendant?
            // Ascendant is rising (East). +90 is IC (North) if using whole sign math direction?
            // Actually MC (10th) is usually Asc - 90 or +270.
            // Let's stick to: 
            // 1st: Asc
            // 4th: Asc + 90? No, Asc + 90 is usually 4th in equal house counting forward in zodiac.
            // Example: Asc Aries 0. 4th House Cancer 0 (which is 90 deg).
            // So:
            // Jup/Merc: Asc
            // Moon/Ven: Asc + 180? No.
            // Moon/Ven are strong in 4th house.
            // Saturn strong in 7th (Asc + 180).
            // Sun/Mars strong in 10th (Asc + 270).
            break;
        case "Saturn":
            powerPoint = MOD360(ascendantDegree + 180); // West
            break;
        case "Sun":
        case "Mars":
            powerPoint = MOD360(ascendantDegree + 270); // South (MC)
            break;
        default:
            return 0;
    }

    // 2. Calculate shortest arc distance
    let diff = Math.abs(planetDegree - powerPoint);
    if (diff > 180) diff = 360 - diff;

    // 3. Calculate Strength: (180 - diff) / 3
    // At Power Point (diff=0), Strength = 60
    // At opposite point (diff=180), Strength = 0
    return parseFloat(((180 - diff) / 3).toFixed(2));
};
