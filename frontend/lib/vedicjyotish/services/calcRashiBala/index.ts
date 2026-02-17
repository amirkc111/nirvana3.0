import { type ShadbalaResult } from "../calcShadbala";
import { type RasiNumber } from "../../constants/Rasi";
import { RasiDetails } from "../../constants/Rasi";
import { type PlanetEn } from "../../constants/Planet";

export type RashiBalaResult = Record<number, number>; // 1-12 -> Strength

/**
 * Calculates Rashi Bala (Strength of Zodiac Signs)
 * 
 * Components:
 * 1. Chara Bala (Nature): Dual (30) > Fixed (20) > Movable (10)
 * 2. Adhipati Bala (Lord Strength): Adds the Shadbala of the sign's lord.
 * 
 * @param shadbala The result of the Shadbala calculation
 * @returns Map of Sign Number (1-12) to Strength Value
 */
export const calcRashiBala = (
    shadbala: ShadbalaResult
): RashiBalaResult => {

    // Initialize result map
    const result: RashiBalaResult = {};

    // Iterate through all 12 signs
    for (let i = 1; i <= 12; i++) {
        const signNum = i as RasiNumber;
        let strength = 0;

        // 1. Chara Bala (Nature)
        // Movable: 1, 4, 7, 10
        // Fixed: 2, 5, 8, 11
        // Dual: 3, 6, 9, 12
        const remainder = signNum % 3;
        if (remainder === 1) { // Movable (1, 4, 7, 10 -> 1%3=1, 4%3=1...)
            strength += 10;
        } else if (remainder === 2) { // Fixed (2, 5, 8, 11 -> 2%3=2...)
            strength += 20;
        } else { // Dual (3, 6, 9, 12 -> 0)
            strength += 30;
        }

        // 2. Adhipati Bala (Lord Strength)
        // Sign -> Lord Name -> Shadbala Total
        // Note: RasiDetails keys are English names (Aries, Taurus...)
        // We need lookup by number.
        // Or simple switch since standard lords:
        let lord: PlanetEn | null = null;
        if ([1, 8].includes(signNum)) lord = "Mars";
        else if ([2, 7].includes(signNum)) lord = "Venus";
        else if ([3, 6].includes(signNum)) lord = "Mercury";
        else if (signNum === 4) lord = "Moon";
        else if (signNum === 5) lord = "Sun";
        else if ([9, 12].includes(signNum)) lord = "Jupiter";
        else if ([10, 11].includes(signNum)) lord = "Saturn";

        if (lord && shadbala[lord]) {
            strength += shadbala[lord].total;
        }

        result[signNum] = parseFloat(strength.toFixed(2));
    }

    return result;
};
