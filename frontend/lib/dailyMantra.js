const dailyGuidance = {
    0: { // Sunday
        day: "Sunday",
        deities: ["Lord Surya", "Lord Rama"],
        mantras: [
            { deity: "Lord Surya", mantra: "Om Ghrinih Suryaya Namaha", significance: "For health, vitality, and removal of obstacles." },
            { deity: "Lord Rama", mantra: "Om Sri Ram Jaya Ram Jaya Jaya Ram", significance: "For peace, righteousness, and victory." }
        ]
    },
    1: { // Monday
        day: "Monday",
        deities: ["Lord Shiva", "Lord Krishna"],
        mantras: [
            { deity: "Lord Shiva", mantra: "Om Namah Shivaya", significance: "The 'Panchakshara' mantra for peace and spiritual liberation." },
            { deity: "Lord Krishna", mantra: "Om Namo Bhagavate Vasudevaya", significance: "For divine love, wisdom, and overall success." }
        ]
    },
    2: { // Tuesday
        day: "Tuesday",
        deities: ["Hanuman", "Durga", "Kartikeya", "Narasimha"],
        mantras: [
            { deity: "Lord Hanuman", mantra: "Om Hanumate Namah", significance: "For strength and protection." },
            { deity: "Goddess Durga", mantra: "Om Dum Durgayei Namaha", significance: "To overcome distress and negative energy." },
            { deity: "Lord Kartikeya", mantra: "Om Saravanabhavaya Namah", significance: "For victory over enemies and spiritual clarity." },
            { deity: "Lord Narasimha", mantra: "Om Hrim Ksraum Ugram Viram Maha-Vishnum Jvalantam Sarvatomukham Nrisimham Bhishanam Bhadram Mrityur Mrityum Namamyaham", significance: "The Mahamantra for fearlessness and protection." }
        ]
    },
    3: { // Wednesday
        day: "Wednesday",
        deities: ["Ganesha", "Krishna", "Vithal"],
        mantras: [
            { deity: "Lord Ganesha", mantra: "Om Gam Ganapataye Namaha", significance: "To remove obstacles in new ventures." },
            { deity: "Lord Krishna", mantra: "Om Krishnaya Namaha", significance: "For devotion and joy." },
            { deity: "Lord Vithal", mantra: "Om Vithalaya Namaha", significance: "Specifically for the beloved form of Vishnu at Pandharpur." }
        ]
    },
    4: { // Thursday
        day: "Thursday",
        deities: ["Vishnu", "Dattatreya", "Lakshmi"],
        mantras: [
            { deity: "Lord Vishnu", mantra: "Om Namo Narayanaya", significance: "For prosperity and mercy." },
            { deity: "Lord Dattatreya", mantra: "Om Dram Dattatreyaya Namaha", significance: "To honor the combined form of Brahma, Vishnu, and Shiva." },
            { deity: "Mata Lakshmi", mantra: "Om Shreem Mahalakshmyai Namah", significance: "For wealth and abundance." }
        ]
    },
    5: { // Friday
        day: "Friday",
        deities: ["Lakshmi", "Durga", "Santoshi Maa"],
        mantras: [
            { deity: "Goddess Lakshmi", mantra: "Om Mahalakshmyai Cha Vidmahe Vishnu Patnyai Cha Dhimahi Tanno Lakshmih Prachodayat", significance: "The Lakshmi Gayatri for prosperity." },
            { deity: "Goddess Durga", mantra: "Sarva Mangala Mangalye Shive Sarvartha Sadhike, Sharanye Tryambake Gauri Narayani Namostute", significance: "A powerful prayer for all-around auspiciousness." },
            { deity: "Santoshi Maa", mantra: "Om Shri Santoshi Mahamyee Namaha", significance: "For contentment and domestic peace." }
        ]
    },
    6: { // Saturday
        day: "Saturday",
        deities: ["Shani", "Bhairav", "Hanuman"],
        mantras: [
            { deity: "Lord Shani", mantra: "Om Sanecharaya Namaha", significance: "To reduce the ill effects of Saturn." },
            { deity: "Lord Bhairav", mantra: "Om Kaalabhairavaya Namaha", significance: "For protection against time and negative forces." },
            { deity: "Lord Hanuman", mantra: "Om Anjaneyaya Vidmahe Vayuputraya Dheemahi Tanno Hanuman Prachodayat", significance: "The Hanuman Gayatri for courage." }
        ]
    }
};

export const getDailyGuidance = (date = new Date()) => {
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return dailyGuidance[dayIndex];
};
