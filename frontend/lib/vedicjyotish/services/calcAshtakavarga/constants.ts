import type { PlanetEn } from "../../constants/Planet";

/**
 * Ashtakavarga Constants
 * Defines the auspicious houses (Bindus) for each planet relative to the positions
 * of the 7 planets and the Ascendant.
 * 
 * Data Source: Phaladeepika / Brihat Parashara Hora Shastra
 */

export type BeneficPoints = number[];

export const ASHTAKAVARGA_RULES: Record<PlanetEn, Record<PlanetEn, BeneficPoints>> = {
    Sun: {
        Sun: [1, 2, 4, 7, 8, 9, 10, 11],
        Moon: [3, 6, 10, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [3, 5, 6, 9, 10, 11, 12],
        Jupiter: [5, 6, 9, 11],
        Venus: [6, 7, 12],
        Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
        Ascendant: [3, 4, 6, 10, 11, 12],
        // Others ignored
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    Moon: {
        Sun: [3, 6, 7, 8, 10, 11],
        Moon: [1, 3, 6, 7, 10, 11],
        Mars: [2, 3, 5, 6, 9, 10, 11],
        Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
        Jupiter: [1, 4, 7, 8, 10, 11, 12],
        Venus: [3, 4, 5, 7, 9, 10, 11],
        Saturn: [3, 5, 6, 11],
        Ascendant: [3, 6, 10, 11],
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    Mars: {
        Sun: [3, 5, 6, 10, 11],
        Moon: [3, 6, 11],
        Mars: [1, 2, 4, 7, 8, 10, 11],
        Mercury: [3, 5, 6, 11], // Some texts say 3, 5, 6, 11. BPHS: 3, 5, 6, 11
        Jupiter: [6, 10, 11, 12],
        Venus: [6, 8, 11, 12],
        Saturn: [1, 4, 7, 8, 9, 10, 11],
        Ascendant: [1, 3, 6, 10, 11],
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    Mercury: {
        Sun: [5, 6, 9, 11, 12],
        Moon: [2, 4, 6, 8, 10, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
        Jupiter: [6, 8, 11, 12],
        Venus: [1, 2, 3, 4, 5, 8, 9, 11],
        Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
        Ascendant: [1, 2, 4, 6, 8, 10, 11],
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    Jupiter: {
        Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
        Moon: [2, 5, 7, 9, 11],
        Mars: [1, 2, 4, 7, 8, 10, 11],
        Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
        Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
        Venus: [2, 5, 6, 9, 10, 11],
        Saturn: [3, 5, 6, 12],
        Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    Venus: {
        Sun: [8, 11, 12],
        Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
        Mars: [3, 4, 6, 9, 11, 12],
        Mercury: [3, 5, 6, 9, 11],
        Jupiter: [5, 8, 9, 10, 11],
        Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
        Saturn: [3, 4, 5, 8, 9, 10, 11],
        Ascendant: [1, 2, 3, 4, 5, 8, 9, 11],
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    Saturn: {
        Sun: [1, 2, 4, 7, 8, 10, 11],
        Moon: [3, 6, 11],
        Mars: [3, 5, 6, 10, 11, 12],
        Mercury: [6, 8, 9, 10, 11, 12],
        Jupiter: [5, 6, 11, 12],
        Venus: [6, 11, 12],
        Saturn: [3, 5, 6, 11],
        Ascendant: [1, 3, 4, 6, 10, 11],
        Rahu: [], Ketu: [], Uranus: [], Neptune: [], Pluto: [],
        Dhuma: [], Vyatipata: [], Parivesha: [], Chapa: [], Upaketu: [],
        Gulika: [], Kaala: [], Mrityu: [], Yamaghantaka: [], Ardhaprahara: []
    },
    // Placeholders for non-calculating bodies (required for TS typing)
    Ascendant: null, Rahu: null, Ketu: null, Uranus: null, Neptune: null, Pluto: null,
    Dhuma: null, Vyatipata: null, Parivesha: null, Chapa: null, Upaketu: null,
    Gulika: null, Kaala: null, Mrityu: null, Yamaghantaka: null, Ardhaprahara: null
};

// Keys for the 7 planets used in AV
export const AV_PLANETS: PlanetEn[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
