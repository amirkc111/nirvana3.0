import { DateTime } from "luxon";
import NepaliDate from "nepali-datetime";

export const NepaliPlanets: Record<string, string> = {
    "Sun": "सूर्य",
    "Moon": "चन्द्र",
    "Mars": "मंगल",
    "Mercury": "बुध",
    "Jupiter": "गुरु",
    "Venus": "शुक्र",
    "Saturn": "शनि",
    "Rahu": "राहु",
    "Ketu": "केतु",
    "Ascendant": "लग्न"
};

export const NepaliYoginis: Record<string, string> = {
    "Mangala": "मंगला",
    "Pingala": "पिंगला",
    "Dhanya": "धन्या",
    "Bhramari": "भ्रामरी",
    "Bhadrika": "भद्रिका",
    "Ulka": "उल्का",
    "Siddha": "सिद्धा",
    "Sankata": "संकटा"
};

export const NepaliDashaLevels: Record<string, string> = {
    "MahaDasha": "महादशा",
    "AntarDasha": "अन्तर्दशा",
    "PratyantarDasha": "प्रत्यन्तर दशा"
};

export const NepaliSystems: Record<string, string> = {
    "vimshottari": "विंशोत्तरी दशा",
    "yogini": "योगिनी दशा",
    "tribhagi": "त्रिभागी दशा"
};

export const NepaliTribhagiPhases: Record<string, string> = {
    "Purva": "पूर्व (¼)",
    "Madhya": "मध्य (½)",
    "Paschima": "पश्चिम (¼)"
};

/**
 * Converts English digits to Nepali digits.
 */
export function toNepaliNumerals(text: string | number): string {
    const str = String(text);
    const englishToNepali: Record<string, string> = {
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };
    return str.replace(/[0-9]/g, (digit) => englishToNepali[digit] || digit);
}

/**
 * Converts a Gregorian (AD) date to Nepali Bikram Sambat (BS) date string.
 */
export function formatToNepaliDate(date: string | DateTime | Date): string {
    const fallbackFormat = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${toNepaliNumerals(year)}/${toNepaliNumerals(month)}/${toNepaliNumerals(day)} (ई.सं.)`;
    };

    try {
        let jsDate: Date;
        if (date instanceof DateTime) {
            jsDate = new Date(date.toJSDate());
        } else if (typeof date === "string") {
            jsDate = new Date(date);
        } else if (date instanceof Date) {
            jsDate = date;
        } else {
            return String(date);
        }

        // Check if date is valid
        if (isNaN(jsDate.getTime())) {
            return String(date);
        }

        // SAFETY RANGE: nepali-datetime usually supports 1944 AD to 2043 AD
        const year = jsDate.getFullYear();
        if (year < 1944 || year > 2043) {
            return fallbackFormat(jsDate);
        }

        const npDate = new NepaliDate(jsDate);
        const formatted = npDate.format("YYYY/MM/DD");
        return toNepaliNumerals(formatted);
    } catch (e) {
        console.warn("formatToNepaliDate failed, using fallback:", e);
        try {
            const d = (date instanceof DateTime) ? new Date(date.toJSDate()) : new Date(date as any);
            return isNaN(d.getTime()) ? String(date) : fallbackFormat(d);
        } catch (inner) {
            return String(date);
        }
    }
}

/**
 * Localizes a name (Planet, Yogini, or Tribhagi Phase) to Nepali.
 */
export function localizeName(name: string): string {
    return NepaliPlanets[name] || NepaliYoginis[name] || NepaliTribhagiPhases[name] || name;
}

/**
 * Simple English to Nepali Transliteration helper.
 * Upgraded to handle vowel signs (matras), conjuncts (tr, ksh), and common patterns.
 */
export function simpleTransliterate(text: string): string {
    if (!text) return text;

    let source = String(text).toLowerCase().trim();

    // 1. COMMON OVERRIDES (Handle abbreviations and tricky surnames)
    const overrides: Record<string, string> = {
        'kc': 'केसी',
        'k.c.': 'केसी',
        'mc': 'एमसी',
        'm.c.': 'एमसी',
        'sharma': 'शर्मा',
        'verma': 'वर्मा',
        'nepal': 'नेपाल'
    };

    // Replace whole words or suffixes if they match overrides
    for (const [key, val] of Object.entries(overrides)) {
        if (source === key) return val;
        if (source.endsWith(' ' + key)) {
            return simpleTransliterate(source.substring(0, source.length - key.length).trim()) + ' ' + val;
        }
    }

    // 2. CONJUNCTS & SPECIALS (Longest match first)
    const specialMap: Record<string, string> = {
        'ksh': 'क्ष', 'tr': 'त्र', 'gy': 'ज्ञ', 'shr': 'श्र'
    };

    // 3. CONSONANTS mapping
    const consonantMap: Record<string, string> = {
        'kh': 'ख', 'gh': 'घ', 'ch': 'च', 'chh': 'छ', 'jh': 'झ',
        'th': 'थ', 'dh': 'ध', 'ph': 'फ', 'bh': 'भ', 'sh': 'श',
        'k': 'क', 'g': 'ग', 'c': 'च', 'j': 'ज', 't': 'त', 'd': 'द', 'n': 'न',
        'p': 'प', 'b': 'ब', 'm': 'म', 'y': 'य', 'r': 'र', 'l': 'ल',
        'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह', 'x': 'क्ष'
    };

    // 4. VOWELS mapping
    const matraMap: Record<string, string> = {
        'aa': 'ा', 'a': '', 'i': 'ि', 'ee': 'ी', 'u': 'ु', 'oo': 'ू',
        'e': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ', 'an': 'ं', 'am': 'ं'
        // 'ah' removed because it conflicts with 'h' in common names like bahadur
    };

    const fullVowelMap: Record<string, string> = {
        'aa': 'आ', 'a': 'अ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ',
        'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ', 'an': 'अं', 'am': 'अं'
    };

    let result = "";
    let i = 0;
    let lastWasConsonant = false;

    while (i < source.length) {
        let matched = false;

        // Skip spaces and symbols
        if (/[^a-z0-9]/.test(source[i])) {
            result += source[i];
            i++;
            lastWasConsonant = false;
            continue;
        }

        // Try Special Conjuncts
        for (const [key, val] of Object.entries(specialMap)) {
            if (source.startsWith(key, i)) {
                result += val;
                i += key.length;
                lastWasConsonant = true;
                matched = true;
                break;
            }
        }
        if (matched) continue;

        // Try Vowels 
        const vowelKeys = Object.keys(fullVowelMap).sort((a, b) => b.length - a.length);
        for (const key of vowelKeys) {
            if (source.startsWith(key, i)) {
                if (lastWasConsonant) {
                    result += matraMap[key];
                } else {
                    result += fullVowelMap[key];
                }
                i += key.length;
                lastWasConsonant = false;
                matched = true;
                break;
            }
        }
        if (matched) continue;

        // Try Consonants
        const consonantKeys = Object.keys(consonantMap).sort((a, b) => b.length - a.length);
        for (const key of consonantKeys) {
            if (source.startsWith(key, i)) {
                if (lastWasConsonant) {
                    // Implicit halant if consonant follows consonant
                    result += '्';
                }
                result += consonantMap[key];
                i += key.length;
                lastWasConsonant = true;
                matched = true;
                break;
            }
        }
        if (matched) continue;

        // Fallback
        result += source[i];
        i++;
        lastWasConsonant = false;
    }

    return result;
}
