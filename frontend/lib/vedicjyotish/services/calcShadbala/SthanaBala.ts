import type { Planet } from "../../constants/Planet";
import { type PlanetEn } from "../../constants/Planet";
import { SHADBALA_PLANETS, KENDRA_BALA_POINTS } from "./constants";
import { calcUchchaBala } from "./UchchaBala";

/**
 * Calculates Sthana Bala (Positional Strength)
 * Currently implements:
 * 1. Uchcha Bala (Exaltation)
 * 2. Kendra Bala (Angle)
 * 3. Ojayugma Bala (Odd/Even Sign)
 * 
 * TODO: Add Saptavarga Bala and Drekkana Bala
 */
export const calcSthanaBala = (
    planetName: PlanetEn,
    planet: Planet
): number => {
    if (!SHADBALA_PLANETS.includes(planetName)) return 0;

    // 1. Uchcha Bala
    const uchcha = calcUchchaBala(planetName, planet.degree);

    // 2. Kendra Bala (Based on House Position)
    // House is 1-based index (1-12)
    const houseNum = planet.house.num;
    let kendra = KENDRA_BALA_POINTS.Apoklima; // Default 15

    if ([1, 4, 7, 10].includes(houseNum)) {
        kendra = KENDRA_BALA_POINTS.Kendra; // 60
    } else if ([2, 5, 8, 11].includes(houseNum)) {
        kendra = KENDRA_BALA_POINTS.Panaphara; // 30
    }

    // 3. Ojayugma Bala (Odd/Even Sign)
    // Female planets (Moon, Venus) gain strength in Even signs
    // Male planets (Sun, Mars, Jup, Merc, Sat) gain strength in Odd signs
    // Note: Mercury/Saturn are typically neutral but in this context grouped with males for Odd preference usually, 
    // OR distinct.
    // Standard text: Moon/Venus in Even Rasis. Others in Odd Rasis.
    let ojayugma = 0;
    const isEvenSign = (planet.rasi.rasi_num % 2 === 0);

    if (planetName === "Moon" || planetName === "Venus") {
        if (isEvenSign) ojayugma = 15;
    } else {
        if (!isEvenSign) ojayugma = 15;
    }

    // Total Sthana (Partial)
    return parseFloat((uchcha + kendra + ojayugma).toFixed(2));
};
