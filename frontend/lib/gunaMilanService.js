/**
 * Guna Milan (Ashta-Koota Matching) Service
 * Standard Vedic Jyotish Implementation (Detailed Matrices)
 * Aligned with Verified Source (Drik Panchang Standards)
 */

import { getNakshatra } from './vedicjyotish/constants/Nakshatra';
import { getRasi } from './vedicjyotish/constants/Rasi';

// --- DATA CONSTANTS ---

// 1. VARNA (Order: Brahmin > Kshatriya > Vaishya > Shudra)
const VARNA_MAP = {
    Cancer: 'Brahmin', Scorpio: 'Brahmin', Pisces: 'Brahmin',
    Aries: 'Kshatriya', Leo: 'Kshatriya', Sagittarius: 'Kshatriya',
    Taurus: 'Vaishya', Virgo: 'Vaishya', Capricorn: 'Vaishya',
    Gemini: 'Shudra', Libra: 'Shudra', Aquarius: 'Shudra'
};
const VARNA_POINTS = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };

// 2. VASHYA (Group Classification)
const VASHYA_MAP = {
    Aries: 'Chatushpad', Taurus: 'Chatushpad', Gemini: 'Manav',
    Cancer: 'Jalchar', Leo: 'Vanachar', Virgo: 'Manav',
    Libra: 'Manav', Scorpio: 'Keet', Sagittarius: 'Manav', // Sag First Half Manav (Using Manav general)
    Capricorn: 'Jalchar', // Cap First Half Chatushpad, Second Jalchar (Using Jalchar general)
    Aquarius: 'Manav', Pisces: 'Jalchar'
};

// 3. TARA Names
const TARA_NAMES = ["", "Janma", "Sampat", "Vipat", "Kshem", "Pratyari", "Sadhak", "Vadha", "Mitra", "Atimitra"];

// 4. YONI (Animals) & MATRIX
const YONI_MAP = {
    Ashwini: 'Horse', Bharani: 'Elephant', Krittika: 'Sheep', Rohini: 'Serpent',
    Mrigashira: 'Serpent', Mrigashirsha: 'Serpent', Ardra: 'Dog', Punarvasu: 'Cat', Pushya: 'Sheep',
    Ashlesha: 'Cat', Magha: 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow',
    Hasta: 'Buffalo', Chitra: 'Tiger', Swati: 'Buffalo', Vishakha: 'Tiger',
    Anuradha: 'Deer', Jyeshtha: 'Deer', Moola: 'Dog', Mula: 'Dog', 'Purva Ashadha': 'Monkey',
    'Uttara Ashadha': 'Mongoose', Shravana: 'Monkey', Dhanishta: 'Lion', Shatabhisha: 'Horse',
    'Purva Bhadrapada': 'Lion', 'Uttara Bhadrapada': 'Cow', Revati: 'Elephant',
    'Purva Bhadra': 'Lion', 'Uttara Bhadra': 'Cow'
};

const YONI_FRIENDSHIP = {
    Horse: { Horse: 4, Elephant: 2, Sheep: 2, Serpent: 3, Dog: 2, Cat: 2, Rat: 1, Cow: 1, Buffalo: 0, Tiger: 1, Deer: 3, Monkey: 3, Mongoose: 2, Lion: 1 },
    Elephant: { Horse: 2, Elephant: 4, Sheep: 3, Serpent: 3, Dog: 2, Cat: 2, Rat: 2, Cow: 2, Buffalo: 3, Tiger: 1, Deer: 2, Monkey: 3, Mongoose: 2, Lion: 0 },
    Sheep: { Horse: 2, Elephant: 3, Sheep: 4, Serpent: 2, Dog: 1, Cat: 2, Rat: 1, Cow: 3, Buffalo: 3, Tiger: 1, Deer: 2, Monkey: 0, Mongoose: 3, Lion: 1 },
    Serpent: { Horse: 3, Elephant: 3, Sheep: 2, Serpent: 4, Dog: 2, Cat: 1, Rat: 1, Cow: 1, Buffalo: 1, Tiger: 2, Deer: 2, Monkey: 2, Mongoose: 0, Lion: 2 },
    Dog: { Horse: 2, Elephant: 2, Sheep: 1, Serpent: 2, Dog: 4, Cat: 2, Rat: 1, Cow: 1, Buffalo: 2, Tiger: 1, Deer: 0, Monkey: 2, Mongoose: 1, Lion: 2 },
    Cat: { Horse: 2, Elephant: 2, Sheep: 2, Serpent: 1, Dog: 2, Cat: 4, Rat: 0, Cow: 2, Buffalo: 2, Tiger: 2, Deer: 2, Monkey: 1, Mongoose: 1, Lion: 2 },
    Rat: { Horse: 1, Elephant: 2, Sheep: 1, Serpent: 1, Dog: 1, Cat: 0, Rat: 4, Cow: 2, Buffalo: 2, Tiger: 2, Deer: 2, Monkey: 1, Mongoose: 1, Lion: 2 },
    Cow: { Horse: 1, Elephant: 2, Sheep: 3, Serpent: 1, Dog: 1, Cat: 2, Rat: 2, Cow: 4, Buffalo: 3, Tiger: 0, Deer: 3, Monkey: 2, Mongoose: 1, Lion: 1 },
    Buffalo: { Horse: 0, Elephant: 3, Sheep: 3, Serpent: 1, Dog: 2, Cat: 2, Rat: 2, Cow: 3, Buffalo: 4, Tiger: 1, Deer: 2, Monkey: 2, Mongoose: 1, Lion: 2 },
    Tiger: { Horse: 1, Elephant: 1, Sheep: 1, Serpent: 2, Dog: 1, Cat: 2, Rat: 2, Cow: 0, Buffalo: 1, Tiger: 4, Deer: 1, Monkey: 1, Mongoose: 2, Lion: 1 },
    Deer: { Horse: 3, Elephant: 2, Sheep: 2, Serpent: 2, Dog: 0, Cat: 2, Rat: 2, Cow: 3, Buffalo: 2, Tiger: 1, Deer: 4, Monkey: 2, Mongoose: 2, Lion: 2 },
    Monkey: { Horse: 3, Elephant: 3, Sheep: 0, Serpent: 2, Dog: 2, Cat: 1, Rat: 1, Cow: 2, Buffalo: 2, Tiger: 1, Deer: 2, Monkey: 4, Mongoose: 3, Lion: 2 },
    Mongoose: { Horse: 2, Elephant: 2, Sheep: 3, Serpent: 0, Dog: 1, Cat: 1, Rat: 1, Cow: 1, Buffalo: 1, Tiger: 2, Deer: 2, Monkey: 3, Mongoose: 4, Lion: 2 },
    Lion: { Horse: 1, Elephant: 0, Sheep: 1, Serpent: 2, Dog: 2, Cat: 2, Rat: 2, Cow: 1, Buffalo: 2, Tiger: 1, Deer: 2, Monkey: 2, Mongoose: 2, Lion: 4 }
};

// 5. GRAHA MAITRI (Planetary Friendship)
const PLANET_FRIENDSHIP = {
    Sun: { Sun: 5, Moon: 5, Mars: 5, Mercury: 4, Jupiter: 5, Venus: 0, Saturn: 0 },
    Moon: { Sun: 5, Moon: 5, Mars: 4, Mercury: 5, Jupiter: 5, Venus: 0.5, Saturn: 0.5 },
    Mars: { Sun: 5, Moon: 4, Mars: 5, Mercury: 0.5, Jupiter: 5, Venus: 3, Saturn: 0.5 },
    Mercury: { Sun: 4, Moon: 0.5, Mars: 0.5, Mercury: 5, Jupiter: 0.5, Venus: 5, Saturn: 4 },
    Jupiter: { Sun: 5, Moon: 5, Mars: 5, Mercury: 0.5, Jupiter: 5, Venus: 0.5, Saturn: 3 },
    Venus: { Sun: 0, Moon: 0.5, Mars: 3, Mercury: 5, Jupiter: 0.5, Venus: 5, Saturn: 5 },
    Saturn: { Sun: 0, Moon: 0.5, Mars: 0.5, Mercury: 4, Jupiter: 3, Venus: 5, Saturn: 5 }
};

// 6. GANA
const GANA_MAP = {
    Ashwini: 'Deva', Bharani: 'Manushya', Krittika: 'Rakshasa', Rohini: 'Manushya',
    Mrigashirsha: 'Deva', Ardra: 'Manushya', Punarvasu: 'Deva', Pushya: 'Deva',
    Ashlesha: 'Rakshasa', Magha: 'Rakshasa', 'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya',
    Hasta: 'Deva', Chitra: 'Rakshasa', Swati: 'Deva', Vishakha: 'Rakshasa',
    Anuradha: 'Deva', Jyeshtha: 'Rakshasa', Moola: 'Rakshasa', 'Purva Ashadha': 'Manushya',
    'Uttara Ashadha': 'Manushya', Shravana: 'Deva', Dhanishta: 'Rakshasa', Shatabhisha: 'Rakshasa',
    'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya', Revati: 'Deva',
    'Purva Bhadra': 'Manushya', 'Uttara Bhadra': 'Manushya', 'Mrigashira': 'Deva', 'Mula': 'Rakshasa'
};

// 8. NADI
const NADI_MAP = {
    Ashwini: 'Adi', Bharani: 'Madhya', Krittika: 'Antya', Rohini: 'Antya',
    Mrigashirsha: 'Madhya', Ardra: 'Adi', Punarvasu: 'Adi', Pushya: 'Madhya',
    Ashlesha: 'Antya', Magha: 'Antya', 'Purva Phalguni': 'Madhya', 'Uttara Phalguni': 'Adi',
    Hasta: 'Adi', Chitra: 'Madhya', Swati: 'Antya', Vishakha: 'Antya',
    Anuradha: 'Madhya', Jyeshtha: 'Adi', Moola: 'Adi', 'Purva Ashadha': 'Madhya',
    'Uttara Ashadha': 'Antya', Shravana: 'Antya', Dhanishta: 'Madhya', Shatabhisha: 'Adi',
    'Purva Bhadrapada': 'Adi', 'Uttara Bhadrapada': 'Madhya', Revati: 'Antya',
    'Purva Bhadra': 'Adi', 'Uttara Bhadra': 'Madhya', 'Mrigashira': 'Madhya', 'Mula': 'Adi'
};

export class GunaMilanService {
    calculateMatching(maleMoonLon, femaleMoonLon) {
        const maleNak = getNakshatra(maleMoonLon);
        const femaleNak = getNakshatra(femaleMoonLon);
        const maleRashi = getRasi(maleMoonLon);
        const femaleRashi = getRasi(femaleMoonLon);

        const results = {
            varna: this.calcVarna(maleRashi, femaleRashi),
            vashya: this.calcVashya(maleRashi, femaleRashi),
            tara: this.calcTara(maleNak, femaleNak),
            yoni: this.calcYoni(maleNak, femaleNak),
            grahaMaitri: this.calcGrahaMaitri(maleRashi, femaleRashi),
            gana: this.calcGana(maleNak, femaleNak),
            bhakoot: this.calcBhakoot(maleRashi, femaleRashi),
            nadi: this.calcNadi(maleNak, femaleNak)
        };

        const totalScore = Object.values(results).reduce((acc, curr) => acc + curr.score, 0);

        // Dosha Checks (Critical only)
        let warnings = [];
        if (results.nadi.score === 0) warnings.push("Nadi Dosha detected");
        if (results.bhakoot.score === 0) warnings.push("Bhakoot Dosha detected");
        if (results.gana.score === 0) warnings.push("Gana Dosha detected");

        return {
            scores: results,
            totalScore: totalScore,
            maxScore: 36,
            warnings,
            maleDetails: {
                nakshatra: maleNak.name.english,
                rashi: maleRashi.name.english,
                lord: maleRashi.lord
            },
            femaleDetails: {
                nakshatra: femaleNak.name.english,
                rashi: femaleRashi.name.english,
                lord: femaleRashi.lord
            }
        };
    }

    calcVarna(maleRashi, femaleRashi) {
        const m = VARNA_MAP[maleRashi.name.english];
        const f = VARNA_MAP[femaleRashi.name.english];
        // Standard Drik: Male (Groom) Varna should be Superior or Equal to Female (Bride).
        // If Groom >= Bride -> 1. Else 0.
        // Orders: Brahmin(4) > Kshatriya(3) > Vaishya(2) > Shudra(1)
        const score = VARNA_POINTS[m] >= VARNA_POINTS[f] ? 1 : 0;
        return { name: "Varna", score, max: 1, male: m || 'Unknown', female: f || 'Unknown' };
    }

    calcVashya(maleRashi, femaleRashi) {
        const m = VASHYA_MAP[maleRashi.name.english];
        const f = VASHYA_MAP[femaleRashi.name.english];
        let score = 0;
        if (m === f) score = 2;
        else if (this.isVashyaFriendly(m, f) && this.isVashyaFriendly(f, m)) score = 2;
        else if (this.isVashyaFriendly(m, f) || this.isVashyaFriendly(f, m)) score = 1;

        if (this.isVashyaFriendly(m, f)) score = Math.max(score, 1);

        return { name: "Vashya", score, max: 2, male: m || 'Unknown', female: f || 'Unknown' };
    }

    isVashyaFriendly(m, f) {
        const friends = {
            Chatushpad: ['Manav', 'Jalchar', 'Keet'],
            Manav: ['Chatushpad', 'Jalchar', 'Keet'],
            Jalchar: ['Manav', 'Chatushpad', 'Keet'],
            Vanachar: [],
            Keet: ['Manav', 'Chatushpad', 'Jalchar']
        };
        return friends[m]?.includes(f);
    }

    calcTara(maleNak, femaleNak) {
        const getCount = (from, to) => ((to - from + 27) % 9) + 1;

        const countToMale = getCount(femaleNak.nakshatra_num, maleNak.nakshatra_num);
        const countToFemale = getCount(maleNak.nakshatra_num, femaleNak.nakshatra_num);

        const isBad = (c) => [3, 5, 7].includes(c);

        let score = 0;
        if (!isBad(countToMale) && !isBad(countToFemale)) score = 3;
        else if (isBad(countToMale) && isBad(countToFemale)) score = 0;
        else score = 1.5;

        return {
            name: "Tara",
            score, max: 3,
            male: TARA_NAMES[countToMale],
            female: TARA_NAMES[countToFemale]
        };
    }

    calcYoni(maleNak, femaleNak) {
        const m = YONI_MAP[maleNak.name.english];
        const f = YONI_MAP[femaleNak.name.english];
        const score = (YONI_FRIENDSHIP[m] && YONI_FRIENDSHIP[m][f]);
        return { name: "Yoni", score: (score !== undefined ? score : 0), max: 4, male: m || 'Unknown', female: f || 'Unknown' };
    }

    calcGrahaMaitri(maleRashi, femaleRashi) {
        const m = maleRashi.lord;
        const f = femaleRashi.lord;
        const score = (PLANET_FRIENDSHIP[m] && PLANET_FRIENDSHIP[m][f]);
        return { name: "Graha Maitri", score: (score !== undefined ? score : 0), max: 5, male: m || 'Unknown', female: f || 'Unknown' };
    }

    calcGana(maleNak, femaleNak) {
        const m = GANA_MAP[maleNak.name.english];
        const f = GANA_MAP[femaleNak.name.english];
        let score = 0;
        if (m === f) score = 6;
        else if ((m === 'Deva' && f === 'Manushya') || (f === 'Deva' && m === 'Manushya')) score = 5;
        else if (m === 'Rakshasa' && f === 'Deva') score = 1;
        else if (m === 'Deva' && f === 'Rakshasa') score = 1;
        else if (m === 'Rakshasa' && f === 'Manushya') score = 0;
        else if (m === 'Manushya' && f === 'Rakshasa') score = 0;

        if (m === 'Deva' && f === 'Rakshasa') score = 0;
        return { name: "Gana", score, max: 6, male: m || 'Unknown', female: f || 'Unknown' };
    }

    calcBhakoot(maleRashi, femaleRashi) {
        const dist = ((femaleRashi.rasi_num - maleRashi.rasi_num + 12) % 12) + 1;
        // Bad List (Shadashtaka 6/8, Dwirdwadasha 2/12, Navapanchama 9/5).
        const bad = [2, 5, 6, 8, 9, 12];
        let score = bad.includes(dist) ? 0 : 7;

        // Cancellation: Same Lord
        if (score === 0) {
            if (maleRashi.lord === femaleRashi.lord) score = 7;
        }

        return {
            name: "Bhakoot",
            score, max: 7,
            male: `${maleRashi.name.english} (${dist})`,
            female: femaleRashi.name.english
        };
    }

    calcNadi(maleNak, femaleNak) {
        const m = NADI_MAP[maleNak.name.english];
        const f = NADI_MAP[femaleNak.name.english];
        let score = (m === f) ? 0 : 8;
        return { name: "Nadi", score, max: 8, male: m || 'Unknown', female: f || 'Unknown' };
    }
}

export default new GunaMilanService();
