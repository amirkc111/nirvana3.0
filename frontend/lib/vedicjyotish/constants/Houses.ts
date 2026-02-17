import type { NavagrahaEn } from "./Planet";
import type { RasiNumber } from "./Rasi";
import type { Translation } from "../services/types";
import { NORMALIZE12 } from "../services/utils";

/** Type Definitions */

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type HouseCategoriesEn =
    | "Kendra"
    | "Trikona"
    | "Dusthana"
    | "Upachaya"
    | "Maraka"
    | "Panaphara"
    | "Apoklima";

export type PurusharthaEn = "Dharma" | "Artha" | "Kama" | "Moksha";

/** Static details of a House (Bhava). */
export interface HouseDetail {
    num: HouseNumber;
    name: Translation<string, string>;
    aka: string;
    akaNp: string;
    categories: HouseCategoriesEn[];
    purushartha: PurusharthaEn;
    karak: NavagrahaEn[];
    naturalRuler: string;
    naturalSign: string;
    description: string;
    descriptionNp: string;
    gemstone: string;
    exaltationDetail: string;
    exaltationDetailNp: string;
}

/** Data: Source of Truth for House Details */
export const HouseDetails: Record<HouseNumber, HouseDetail> = {
    1: {
        num: 1,
        name: { english: "1st House", hindi: "प्रथम भाव" },
        aka: "House of Self",
        akaNp: "व्यक्तित्व र शरीरको भाव",
        categories: ["Kendra", "Trikona"],
        purushartha: "Dharma",
        karak: ["Sun"],
        naturalRuler: "Mars",
        naturalSign: "Aries",
        description: "Signifies self-identity, personality, body, and vocation. It signifies leadership, self-confidence, individuality, and self-consciousness.",
        descriptionNp: "यसले आत्म-पहिचान, व्यक्तित्व, शरीर र पेशालाई संकेत गर्दछ। यसले नेतृत्व, आत्म-विश्वास र व्यक्तित्वको प्रतिनिधित्व गर्दछ।",
        gemstone: "Red Coral",
        exaltationDetail: "The Sun is at its best position in Aries in the first house while Saturn is weak in this house.",
        exaltationDetailNp: "पहिलो भावमा मेष राशिमा सूर्य सबैभन्दा बलियो हुन्छ भने शनि कमजोर हुन्छ।"
    },
    2: {
        num: 2,
        name: { english: "2nd House", hindi: "द्वितीय भाव" },
        aka: "House of Wealth & Speech",
        akaNp: "धन र वाणीको भाव",
        categories: ["Maraka", "Panaphara"],
        purushartha: "Artha",
        karak: ["Jupiter"],
        naturalRuler: "Venus",
        naturalSign: "Taurus",
        description: "Affects financial security, possessions, speaking, and home ethos. It signifies accumulating materialism, conversation skills, and high values.",
        descriptionNp: "यसले आर्थिक सुरक्षा, सम्पत्ति, बोली र पारिवारिक वातावरणलाई असर गर्छ। यसले भौतिकवाद र कुराकानी कौशललाई जनाउँछ।",
        gemstone: "Diamond",
        exaltationDetail: "Taurus makes the Moon powerful but weakens Ketu in this house.",
        exaltationDetailNp: "वृष राशिमा चन्द्रमा शक्तिशाली हुन्छ तर केतु कमजोर हुन्छ।"
    },
    3: {
        num: 3,
        name: { english: "3rd House", hindi: "तृतीय भाव" },
        aka: "House of Communications & Valour",
        akaNp: "सञ्चार र पराक्रमको भाव",
        categories: ["Upachaya", "Apoklima"],
        purushartha: "Kama",
        karak: ["Mars"],
        naturalRuler: "Mercury",
        naturalSign: "Gemini",
        description: "Affects communication skills, bravery, short travels, and relationships between siblings. It represents a fast mind, flexibility, and bravery.",
        descriptionNp: "यसले सञ्चार कौशल, बहादुरी, छोटो यात्रा र दाजुभाइ दिदीबहिनी बीचको सम्बन्धलाई असर गर्छ।",
        gemstone: "Emerald",
        exaltationDetail: "Rahu is at its most powerful point, but Ketu is weak in this house especially if it is in his own sign.",
        exaltationDetailNp: "यस भावमा राहु सबैभन्दा शक्तिशाली हुन्छ भने केतु कमजोर हुन्छ।"
    },
    4: {
        num: 4,
        name: { english: "4th House", hindi: "चतुर्थ भाव" },
        aka: "House of Home & Comforts",
        akaNp: "सुख र मातृभाव",
        categories: ["Kendra"],
        purushartha: "Moksha",
        karak: ["Moon", "Mercury"],
        naturalRuler: "Moon",
        naturalSign: "Cancer",
        description: "Ruler of home, mother, emotional balance, property, and automobiles. It symbolizes emotional depth, a caring nature, and stability.",
        descriptionNp: "घर, आमा, भावनात्मक सन्तुलन, सम्पत्ति र सवारी साधनको भाव। यसले भावनात्मक गहिराई र स्थिरताको प्रतिनिधित्व गर्दछ।",
        gemstone: "Pearl",
        exaltationDetail: "Jupiter is powerful in Cancer especially if it is sitting in this house, and Mars becomes weak here.",
        exaltationDetailNp: "कर्कट राशिमा बृहस्पति शक्तिशाली हुन्छ भने मंगल कमजोर हुन्छ।"
    },
    5: {
        num: 5,
        name: { english: "5th House", hindi: "पंचम भाव" },
        aka: "Love & Creativity House",
        akaNp: "प्रेम र सन्तान भाव",
        categories: ["Trikona", "Panaphara"],
        purushartha: "Dharma",
        karak: ["Jupiter"],
        naturalRuler: "Sun",
        naturalSign: "Leo",
        description: "Rules intelligence, children, education, creativity, and love affairs. It symbolizes creativity, leadership, and wisdom.",
        descriptionNp: "बुद्धि, सन्तान, शिक्षा, रचनात्मकता र प्रेम सम्बन्धको भाव। यसले नेतृत्व र ज्ञानको प्रतिनिधित्व गर्दछ।",
        gemstone: "Ruby",
        exaltationDetail: "The Sun is at its best in Aries (Natural Zodiac connection), while Saturn is weak in this sign.",
        exaltationDetailNp: "सूर्य मेष राशिमा सबैभन्दा राम्रो हुन्छ भने शनि यो राशिमा कमजोर हुन्छ।"
    },
    6: {
        num: 6,
        name: { english: "6th House", hindi: "षष्ठ भाव" },
        aka: "Service & Health House",
        akaNp: "सेवा र स्वास्थ्य भाव",
        categories: ["Dusthana", "Upachaya", "Apoklima"],
        purushartha: "Artha",
        karak: ["Mars", "Saturn"],
        naturalRuler: "Mercury",
        naturalSign: "Virgo",
        description: "Impacts health, debts, adversities, and rivalry. It represents diligence, self-control, and scrutiny.",
        descriptionNp: "स्वास्थ्य, ऋण, शत्रु र समस्याहरूको भाव। यसले परिश्रम र आत्म-नियन्त्रणको प्रतिनिधित्व गर्दछ।",
        gemstone: "Emerald",
        exaltationDetail: "Mercury is at its best position in Virgo and Venus is weakened in this house especially if it’s in Virgo.",
        exaltationDetailNp: "कन्या राशिमा बुध सबैभन्दा राम्रो स्थितिमा हुन्छ र शुक्र कमजोर हुन्छ।"
    },
    7: {
        num: 7,
        name: { english: "7th House", hindi: "सप्तम भाव" },
        aka: "House of Marriage & Partnership",
        akaNp: "विवाह र साझेदारीको भाव",
        categories: ["Kendra", "Maraka"],
        purushartha: "Kama",
        karak: ["Venus"],
        naturalRuler: "Venus",
        naturalSign: "Libra",
        description: "Controls marriage, trade relationships, and human interactions. It is the house of diplomacy, social bonding, and charm.",
        descriptionNp: "विवाह, व्यापार सम्बन्ध र मानवीय अन्तरक्रियाको भाव। यसले कूटनीति र सामाजिक सम्बन्धको प्रतिनिधित्व गर्दछ।",
        gemstone: "Diamond",
        exaltationDetail: "Saturn is in its most powerful position in Libra, while the Sun is weak especially if it’s in Libra sign.",
        exaltationDetailNp: "तुला राशिमा शनि सबैभन्दा शक्तिशाली हुन्छ भने सूर्य कमजोर हुन्छ।"
    },
    8: {
        num: 8,
        name: { english: "8th House", hindi: "अष्टम भाव" },
        aka: "Transformation & Mysticism House",
        akaNp: "परिवर्तन र रहस्यको भाव",
        categories: ["Dusthana", "Panaphara"],
        purushartha: "Moksha",
        karak: ["Saturn"],
        naturalRuler: "Mars",
        naturalSign: "Scorpio",
        description: "Rules accidents, longevity, secrets, legacy, and mystery. It indicates intensity, depth, and transformation.",
        descriptionNp: "दुर्घटना, दीर्घायु, रहस्य र परिवर्तनको भाव। यसले गहिराई र तीव्रताको प्रतिनिधित्व गर्दछ।",
        gemstone: "Red Coral",
        exaltationDetail: "Rahu becomes weak in this house, and Ketu rises in Scorpio sign.",
        exaltationDetailNp: "यो भावमा राहु कमजोर हुन्छ र वृश्चिक राशिमा केतु बलियो हुन्छ।"
    },
    9: {
        num: 9,
        name: { english: "9th House", hindi: "नवम भाव" },
        aka: "House of Luck & Higher Knowledge",
        akaNp: "भाग्य र उच्च ज्ञानको भाव",
        categories: ["Trikona", "Apoklima"],
        purushartha: "Dharma",
        karak: ["Jupiter", "Sun"],
        naturalRuler: "Jupiter",
        naturalSign: "Sagittarius",
        description: "Controls religion, philosophy, spirituality, foreign travel, and wisdom of life. This house is of optimism, belief, and higher education.",
        descriptionNp: "धर्म, दर्शन, आध्यात्मिकता र विदेश यात्राको भाव। यो भाग्य र उच्च शिक्षाको भाव हो।",
        gemstone: "Yellow Sapphire",
        exaltationDetail: "Jupiter becomes very powerful in Sagittarius especially if it’s in the 9th house, while Rahu is weak in this ruling sign.",
        exaltationDetailNp: "धनु राशिमा बृहस्पति धेरै शक्तिशाली हुन्छ भने राहु कमजोर हुन्छ।"
    },
    10: {
        num: 10,
        name: { english: "10th House", hindi: "दशम भाव" },
        aka: "Career & Social Status House",
        akaNp: "कर्म र सामाजिक प्रतिष्ठाको भाव",
        categories: ["Kendra", "Upachaya"],
        purushartha: "Artha",
        karak: ["Sun", "Mercury", "Jupiter", "Saturn"],
        naturalRuler: "Saturn",
        naturalSign: "Capricorn",
        description: "Effects career, reputation, success, and leadership. The tenth house is a representation of ambition, responsibility, and duty.",
        descriptionNp: "करियर, प्रतिष्ठा, सफलता र नेतृत्वको भाव। यसले महत्वाकांक्षा र कर्तव्यको प्रतिनिधित्व गर्दछ।",
        gemstone: "Blue Sapphire",
        exaltationDetail: "Capricorn is the best sign for Mars for this house but Saturn in Aries in this house gets weak related to natural zodiac.",
        exaltationDetailNp: "मकर राशि मंगलका लागि उत्तम हन्छ भने मेष राशिमा शनि कमजोर हुन्छ।"
    },
    11: {
        num: 11,
        name: { english: "11th House", hindi: "एकादश भाव" },
        aka: "House of Gains & Desires",
        akaNp: "आय र लाभको भाव",
        categories: ["Upachaya", "Panaphara"],
        purushartha: "Kama",
        karak: ["Jupiter"],
        naturalRuler: "Saturn",
        naturalSign: "Aquarius",
        description: "Responsible for earnings, society, ambitions, and success. It symbolizes innovation, networking, and ambitions.",
        descriptionNp: "आम्दानी, समाज, महत्वाकांक्षा र सफलताको जिम्मेवार भाव। यसले नेटवर्किङको प्रतिनिधित्व गर्दछ।",
        gemstone: "Blue Sapphire",
        exaltationDetail: "Mercury is in its powerful position in Aquarius and Ketu is weak there.",
        exaltationDetailNp: "कुम्भ राशिमा बुध शक्तिशाली स्थितिमा हुन्छ र केतु कमजोर हुन्छ।"
    },
    12: {
        num: 12,
        name: { english: "12th House", hindi: "द्वादश भाव" },
        aka: "House of Liberation & Expenditure",
        akaNp: "मोक्ष र व्ययको भाव",
        categories: ["Dusthana", "Apoklima"],
        purushartha: "Moksha",
        karak: ["Saturn", "Venus"],
        naturalRuler: "Jupiter",
        naturalSign: "Pisces",
        description: "Governs spiritual growth, isolation, foreign travel, and losses. It symbolizes intuition, selflessness, and detachment.",
        descriptionNp: "आध्यात्मिक विकास, अलगाव, विदेश यात्रा र घाटाको भाव। यसले वैराग्य र आन्तरिक शान्तिको प्रतिनिधित्व गर्दछ।",
        gemstone: "Yellow Sapphire",
        exaltationDetail: "Venus is at its strongest in this house especially if it’s in Pisces and Mars is considered to be a weak placement here.",
        exaltationDetailNp: "मीन राशिमा शुक्र सबैभन्दा बलियो हुन्छ भने मंगल कमजोर मानिन्छ।"
    },
};

/** Core Calculation Function */

/**
 * Calculates the House (Bhava) a planet occupies relative to the ascendant.
 *
 * @param {RasiNumber} planet_rasi_num - The Rasi number (1-12) where the planet
 *   is located.
 * @param {RasiNumber} ascendant_rasi_num - The Rasi number (1-12) of the
 *   ascendant (Lagna).
 * @returns {HouseDetail} A full House object containing its details.
 * @throws {Error} If a valid House cannot be determined.
 */
export function getHouse(
    planet_rasi_num: RasiNumber,
    ascendant_rasi_num: RasiNumber
): HouseDetail {
    /**
     * 1. Determine the House number by counting from the ascendant. The formula is
     *    (Planet's Rasi - Ascendant's Rasi + 1), normalized to the 1-12 range.
     */
    const houseNumber = NORMALIZE12(
        planet_rasi_num - ascendant_rasi_num + 1
    ) as HouseNumber;

    /**
     * 2. Retrieve House details using a direct O(1) array lookup. We use
     *    `houseNumber - 1` because the array is 0-indexed.
     */
    const details = HouseDetails[houseNumber];

    if (!details) {
        throw new Error(
            `Could not find House details for calculated number: ${houseNumber}.`
        );
    }

    /** 3. Return the found details. */
    return details;
}
