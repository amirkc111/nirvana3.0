import type { PlanetEn } from "../../constants/Planet";

/**
 * SHADBALA CONSTANTS & TYPES
 */

// 1. Naisargika Bala (Natural Strength) - Fixed values in Shashtiamsas
// Sun > Moon > Venus > Jupiter > Mercury > Mars > Saturn
// Formula: value / 7 * 60 approx, but standard values are 60, 51.43, etc.
export const NAISARGIKA_BALA: Record<PlanetEn, number> = {
    Sun: 60.00,
    Moon: 51.43,
    Venus: 42.86,
    Jupiter: 34.29,
    Mercury: 25.71,
    Mars: 17.14,
    Saturn: 8.57,
    // Others 0
    Ascendant: 0, Rahu: 0, Ketu: 0, Uranus: 0, Neptune: 0, Pluto: 0,
    Dhuma: 0, Vyatipata: 0, Parivesha: 0, Chapa: 0, Upaketu: 0,
    Gulika: 0, Kaala: 0, Mrityu: 0, Yamaghantaka: 0, Ardhaprahara: 0
};

// 2. Exaltation (Uchcha) and Debilitation (Neecha) Degrees
export const EXALTATION_DEGREES: Record<PlanetEn, number> = {
    Sun: 10,       // Aries 10
    Moon: 33,      // Taurus 3
    Mars: 298,     // Capricorn 28
    Mercury: 165,  // Virgo 15
    Jupiter: 95,   // Cancer 5
    Venus: 357,    // Pisces 27
    Saturn: 200,   // Libra 20
    // Nodes are debated, usually ignored for Shadbala
    Rahu: 60,      // Gemini ?
    Ketu: 240,     // Sagittarius ?
    Ascendant: 0, Uranus: 0, Neptune: 0, Pluto: 0,
    Dhuma: 0, Vyatipata: 0, Parivesha: 0, Chapa: 0, Upaketu: 0,
    Gulika: 0, Kaala: 0, Mrityu: 0, Yamaghantaka: 0, Ardhaprahara: 0
};

// 3. Saptavarga Strength Coefficients (Shashtiamsas)
export const VARGA_RELATIONSHIP_POINTS = {
    OwnSign: 45,       // Swakshetra / Moolatrikona usually 45
    BestFriend: 30,    // Adhi Mitra
    Friend: 22.5,      // Mitra
    Neutral: 15,       // Sama
    Enemy: 7.5,        // Shatru
    BitterEnemy: 3.75  // Adhi Shatru
};

// 4. KENDRA BALA Coefficients
export const KENDRA_BALA_POINTS = {
    Kendra: 60,   // 1, 4, 7, 10
    Panaphara: 30,// 2, 5, 8, 11
    Apoklima: 15  // 3, 6, 9, 12
};

export const SHADBALA_PLANETS: PlanetEn[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
