// Comprehensive Astrological Knowledge Base
// Based on the Kundali AI training data

export const astrologicalKnowledge = {
  // Planetary Data
  planets: {
    sun: {
      name: { en: "Sun", ne: "सूर्य" },
      karaka: ["soul", "father", "authority", "vitality"],
      nature: { en: "Male", ne: "पुरुष" },
      element: "Fire",
      exaltation: "Aries 10°",
      debilitation: "Libra 10°",
      remedies: {
        mantra: "Om Ghrini Suryaya Namah",
        gemstone: "Ruby (Manik)",
        fasting: "Sunday fast (optional)",
        color: "Red",
        metal: "Gold"
      }
    },
    moon: {
      name: { en: "Moon", ne: "चंद्र" },
      karaka: ["mind", "mother", "emotions", "public"],
      nature: { en: "Female", ne: "नारी" },
      element: "Water",
      exaltation: "Taurus 3°",
      debilitation: "Scorpio 3°",
      remedies: {
        mantra: "Om Chandraya Namah",
        gemstone: "Pearl (Moti)",
        fasting: "Monday vrat",
        color: "White",
        metal: "Silver"
      }
    },
    mars: {
      name: { en: "Mars", ne: "मंगल" },
      karaka: ["energy", "siblings", "courage", "action"],
      nature: { en: "Male", ne: "पुरुष" },
      element: "Fire",
      exaltation: "Capricorn 28°",
      debilitation: "Cancer 28°",
      remedies: {
        mantra: "Om Mangalaya Namah",
        gemstone: "Red Coral (Moonga)",
        fasting: "Tuesday fast",
        color: "Red",
        metal: "Iron"
      }
    },
    mercury: {
      name: { en: "Mercury", ne: "बुध" },
      karaka: ["communication", "intellect", "trade", "logic"],
      nature: { en: "Neutral", ne: "तटस्थ" },
      element: "Earth",
      exaltation: "Virgo 15°",
      debilitation: "Pisces 15°",
      remedies: {
        mantra: "Om Budhaya Namah",
        gemstone: "Emerald (Panna)",
        fasting: "Wednesday vrata",
        color: "Green",
        metal: "Mercury"
      }
    },
    jupiter: {
      name: { en: "Jupiter", ne: "गुरु" },
      karaka: ["wisdom", "children", "wealth", "religion"],
      nature: { en: "Male", ne: "पुरुष" },
      element: "Ether",
      exaltation: "Cancer 5°",
      debilitation: "Capricorn 5°",
      remedies: {
        mantra: "Om Gurave Namah",
        gemstone: "Yellow Sapphire (Pukhraj)",
        fasting: "Thursday vrat",
        color: "Yellow",
        metal: "Gold"
      }
    },
    venus: {
      name: { en: "Venus", ne: "शुक्र" },
      karaka: ["love", "luxury", "art", "relationships"],
      nature: { en: "Female", ne: "नारी" },
      element: "Water",
      exaltation: "Pisces 27°",
      debilitation: "Virgo 27°",
      remedies: {
        mantra: "Om Shukraya Namah",
        gemstone: "Diamond or White Sapphire",
        fasting: "Friday vrat",
        color: "White/Pink",
        metal: "Silver"
      }
    },
    saturn: {
      name: { en: "Saturn", ne: "शनि" },
      karaka: ["discipline", "karma", "delay", "restrictions"],
      nature: { en: "Neutral", ne: "तटस्थ" },
      element: "Air",
      exaltation: "Libra 20°",
      debilitation: "Aries 20°",
      remedies: {
        mantra: "Om Sham Shanicharaya Namah",
        gemstone: "Blue Sapphire (Neelam) - careful use",
        fasting: "Saturday vrat",
        color: "Dark Blue/Black",
        metal: "Iron"
      }
    },
    rahu: {
      name: { en: "Rahu", ne: "राहु" },
      karaka: ["obsession", "foreign", "technology", "ambition"],
      nature: { en: "Shadow", ne: "छाया" },
      element: "Air",
      remedies: {
        mantra: "Om Rahave Namah",
        gemstone: "Hessonite (Gomed)",
        fasting: "No strict fasting; charity recommended",
        color: "Smoky/Gray",
        metal: "Lead"
      }
    },
    ketu: {
      name: { en: "Ketu", ne: "केतु" },
      karaka: ["spirituality", "detachment", "past karma"],
      nature: { en: "Shadow", ne: "छाया" },
      element: "Fire",
      remedies: {
        mantra: "Om Ketave Namah",
        gemstone: "Cat's Eye (Lehsunia)",
        fasting: "Spiritual practices over fasting",
        color: "Brown/Yellow",
        metal: "Tin"
      }
    }
  },

  // House Interpretations
  houses: {
    1: {
      name: { en: "Lagna/Ascendant", ne: "लग्न" },
      karaka: ["self", "personality", "appearance", "health"],
      themes: ["identity", "physical body", "first impressions", "vitality"]
    },
    2: {
      name: { en: "Dhana", ne: "धन" },
      karaka: ["wealth", "family", "speech", "food"],
      themes: ["money", "possessions", "family", "speech", "eating habits"]
    },
    3: {
      name: { en: "Sahaja", ne: "सहज" },
      karaka: ["siblings", "courage", "short journeys", "communication"],
      themes: ["brothers/sisters", "courage", "short trips", "writing", "hands"]
    },
    4: {
      name: { en: "Sukha", ne: "सुख" },
      karaka: ["mother", "home", "education", "vehicles"],
      themes: ["mother", "home", "property", "education", "comforts"]
    },
    5: {
      name: { en: "Putra", ne: "पुत्र" },
      karaka: ["children", "intelligence", "creativity", "speculation"],
      themes: ["children", "intelligence", "creativity", "romance", "gambling"]
    },
    6: {
      name: { en: "Ari", ne: "अरि" },
      karaka: ["enemies", "diseases", "service", "debt"],
      themes: ["enemies", "diseases", "service", "debt", "daily routine"]
    },
    7: {
      name: { en: "Kalatra", ne: "कलत्र" },
      karaka: ["spouse", "partnership", "marriage", "business"],
      themes: ["spouse", "marriage", "partnership", "business", "open enemies"]
    },
    8: {
      name: { en: "Ayu", ne: "आयु" },
      karaka: ["longevity", "occult", "inheritance", "transformation"],
      themes: ["longevity", "occult sciences", "inheritance", "transformation", "secrets"]
    },
    9: {
      name: { en: "Bhagya", ne: "भाग्य" },
      karaka: ["father", "guru", "dharma", "higher learning"],
      themes: ["father", "guru", "dharma", "higher learning", "foreign travel"]
    },
    10: {
      name: { en: "Karma", ne: "कर्म" },
      karaka: ["profession", "reputation", "authority", "status"],
      themes: ["profession", "career", "reputation", "authority", "status"]
    },
    11: {
      name: { en: "Labha", ne: "लाभ" },
      karaka: ["gains", "friends", "hopes", "wishes"],
      themes: ["gains", "friends", "hopes", "wishes", "income"]
    },
    12: {
      name: { en: "Vyaya", ne: "व्यय" },
      karaka: ["expenses", "losses", "foreign", "spirituality"],
      themes: ["expenses", "losses", "foreign lands", "spirituality", "bed pleasures"]
    }
  },

  // Zodiac Signs
  signs: {
    aries: { name: { en: "Aries", ne: "मेष" }, element: "Fire", quality: "Cardinal" },
    taurus: { name: { en: "Taurus", ne: "वृष" }, element: "Earth", quality: "Fixed" },
    gemini: { name: { en: "Gemini", ne: "मिथुन" }, element: "Air", quality: "Mutable" },
    cancer: { name: { en: "Cancer", ne: "कर्क" }, element: "Water", quality: "Cardinal" },
    leo: { name: { en: "Leo", ne: "सिंह" }, element: "Fire", quality: "Fixed" },
    virgo: { name: { en: "Virgo", ne: "कन्या" }, element: "Earth", quality: "Mutable" },
    libra: { name: { en: "Libra", ne: "तुला" }, element: "Air", quality: "Cardinal" },
    scorpio: { name: { en: "Scorpio", ne: "वृश्चिक" }, element: "Water", quality: "Fixed" },
    sagittarius: { name: { en: "Sagittarius", ne: "धनु" }, element: "Fire", quality: "Mutable" },
    capricorn: { name: { en: "Capricorn", ne: "मकर" }, element: "Earth", quality: "Cardinal" },
    aquarius: { name: { en: "Aquarius", ne: "कुम्भ" }, element: "Air", quality: "Fixed" },
    pisces: { name: { en: "Pisces", ne: "मीन" }, element: "Water", quality: "Mutable" }
  },

  // Nakshatras (27 Lunar Mansions)
  nakshatras: {
    ashwini: { name: { en: "Ashwini", ne: "अश्विनी" }, lord: "Ketu", symbol: "Horse's head", qualities: ["swift", "healing", "initiative"] },
    bharani: { name: { en: "Bharani", ne: "भरणी" }, lord: "Venus", symbol: "Vulva", qualities: ["creative", "sensual", "transformative"] },
    krittika: { name: { en: "Krittika", ne: "कृत्तिका" }, lord: "Sun", symbol: "Razor", qualities: ["sharp", "cutting", "purification"] },
    rohini: { name: { en: "Rohini", ne: "रोहिणी" }, lord: "Moon", symbol: "Cart", qualities: ["fertile", "beautiful", "materialistic"] },
    mrigashira: { name: { en: "Mrigashira", ne: "मृगशिरा" }, lord: "Mars", symbol: "Deer's head", qualities: ["curious", "wandering", "gentle"] },
    ardra: { name: { en: "Ardra", ne: "आर्द्रा" }, lord: "Rahu", symbol: "Teardrop", qualities: ["emotional", "transformative", "intense"] },
    punarvasu: { name: { en: "Punarvasu", ne: "पुनर्वसु" }, lord: "Jupiter", symbol: "Bow", qualities: ["returning", "renewal", "optimistic"] },
    pushya: { name: { en: "Pushya", ne: "पुष्य" }, lord: "Saturn", symbol: "Flower", qualities: ["nourishing", "protective", "spiritual"] },
    ashlesha: { name: { en: "Ashlesha", ne: "आश्लेषा" }, lord: "Mercury", symbol: "Serpent", qualities: ["mystical", "intuitive", "transformative"] },
    magha: { name: { en: "Magha", ne: "मघा" }, lord: "Ketu", symbol: "Throne", qualities: ["royal", "authoritative", "ancestral"] },
    purva_phalguni: { name: { en: "Purva Phalguni", ne: "पूर्व फाल्गुनी" }, lord: "Venus", symbol: "Hammock", qualities: ["romantic", "artistic", "luxurious"] },
    uttara_phalguni: { name: { en: "Uttara Phalguni", ne: "उत्तर फाल्गुनी" }, lord: "Sun", symbol: "Fig tree", qualities: ["noble", "generous", "leadership"] },
    hasta: { name: { en: "Hasta", ne: "हस्त" }, lord: "Moon", symbol: "Hand", qualities: ["skillful", "dexterous", "healing"] },
    chitra: { name: { en: "Chitra", ne: "चित्रा" }, lord: "Mars", symbol: "Pearl", qualities: ["artistic", "beautiful", "creative"] },
    swati: { name: { en: "Swati", ne: "स्वाती" }, lord: "Rahu", symbol: "Sword", qualities: ["independent", "swaying", "changeable"] },
    vishakha: { name: { en: "Vishakha", ne: "विशाखा" }, lord: "Jupiter", symbol: "Archway", qualities: ["determined", "goal-oriented", "successful"] },
    anuradha: { name: { en: "Anuradha", ne: "अनुराधा" }, lord: "Saturn", symbol: "Lotus", qualities: ["devoted", "loyal", "persistent"] },
    jyeshtha: { name: { en: "Jyeshtha", ne: "ज्येष्ठा" }, lord: "Mercury", symbol: "Earring", qualities: ["elder", "authoritative", "protective"] },
    mula: { name: { en: "Mula", ne: "मूल" }, lord: "Ketu", symbol: "Root", qualities: ["foundational", "destructive", "transformative"] },
    purva_ashadha: { name: { en: "Purva Ashadha", ne: "पूर्व आषाढ़" }, lord: "Venus", symbol: "Fan", qualities: ["victorious", "invincible", "powerful"] },
    uttara_ashadha: { name: { en: "Uttara Ashadha", ne: "उत्तर आषाढ़" }, lord: "Sun", symbol: "Elephant tusk", qualities: ["universal", "invincible", "noble"] },
    shravana: { name: { en: "Shravana", ne: "श्रवण" }, lord: "Moon", symbol: "Ear", qualities: ["listening", "learning", "obedient"] },
    dhanishtha: { name: { en: "Dhanishtha", ne: "धनिष्ठा" }, lord: "Mars", symbol: "Drum", qualities: ["wealthy", "musical", "famous"] },
    shatabhisha: { name: { en: "Shatabhisha", ne: "शतभिषा" }, lord: "Rahu", symbol: "100 stars", qualities: ["mystical", "healing", "secretive"] },
    purva_bhadrapada: { name: { en: "Purva Bhadrapada", ne: "पूर्व भाद्रपद" }, lord: "Jupiter", symbol: "Sword", qualities: ["spiritual", "mystical", "transformative"] },
    uttara_bhadrapada: { name: { en: "Uttara Bhadrapada", ne: "उत्तर भाद्रपद" }, lord: "Saturn", symbol: "Snake", qualities: ["spiritual", "mystical", "protective"] },
    revati: { name: { en: "Revati", ne: "रेवती" }, lord: "Mercury", symbol: "Fish", qualities: ["nurturing", "compassionate", "spiritual"] }
  },

  // Advanced Astrological Concepts
  advancedConcepts: {
    // Major Yogas (Planetary Combinations)
    majorYogas: {
      rajaYogas: {
        name: { en: "Raja Yogas", ne: "राज योग" },
        description: { en: "Royal combinations that bring power, authority, and success", ne: "शाही संयोजन जो शक्ति, अधिकार र सफलता ल्याउँछ" },
        combinations: [
          "Jupiter + Sun in kendras",
          "Jupiter + Moon in kendras", 
          "Jupiter + Mars in kendras",
          "Jupiter + Mercury in kendras",
          "Jupiter + Venus in kendras"
        ]
      },
      dhanaYogas: {
        name: { en: "Dhana Yogas", ne: "धन योग" },
        description: { en: "Wealth combinations that bring prosperity and financial success", ne: "धन संयोजन जो समृद्धि र वित्तीय सफलता ल्याउँछ" },
        combinations: [
          "Jupiter in 2nd house",
          "Venus in 2nd house",
          "2nd lord in 11th house",
          "11th lord in 2nd house",
          "Jupiter + Venus conjunction"
        ]
      },
      vishYogas: {
        name: { en: "Vish Yogas", ne: "विष योग" },
        description: { en: "Poisonous combinations that create challenges and obstacles", ne: "विषैला संयोजन जो चुनौतीहरू र बाधाहरू सिर्जना गर्छ" },
        combinations: [
          "Mars + Saturn conjunction",
          "Sun + Saturn conjunction",
          "Rahu + Ketu axis",
          "Malefic planets in kendras"
        ]
      }
    },

    // Doshas (Afflictions)
    doshas: {
      manglikDosh: {
        name: { en: "Manglik Dosh", ne: "मंगलिक दोष" },
        description: { en: "Mars affliction affecting marriage and relationships", ne: "मंगल दोष जसले विवाह र सम्बन्धहरूलाई प्रभावित गर्छ" },
        conditions: ["Mars in 1st, 4th, 7th, 8th, 12th houses"],
        remedies: ["Manglik matching", "Mars remedies", "Delayed marriage"]
      },
      kalsarpDosh: {
        name: { en: "Kalsarp Dosh", ne: "कालसर्प दोष" },
        description: { en: "Rahu-Ketu axis affecting all planets", ne: "राहु-केतु अक्ष जसले सबै ग्रहहरूलाई प्रभावित गर्छ" },
        conditions: ["All planets between Rahu and Ketu"],
        remedies: ["Snake worship", "Rahu-Ketu remedies", "Spiritual practices"]
      },
      pitruDosh: {
        name: { en: "Pitru Dosh", ne: "पितृ दोष" },
        description: { en: "Ancestral affliction affecting family and prosperity", ne: "पैतृक दोष जसले परिवार र समृद्धिलाई प्रभावित गर्छ" },
        conditions: ["Sun + Rahu", "Sun + Ketu", "9th house afflictions"],
        remedies: ["Pitru tarpan", "Ancestor worship", "Charity to Brahmins"]
      }
    },

    // Dasha Systems
    dashaSystems: {
      vimsottari: {
        name: { en: "Vimsottari Dasha", ne: "विंशोत्तरी दशा" },
        description: { en: "120-year planetary periods system", ne: "१२० वर्षको ग्रहीय अवधि प्रणाली" },
        periods: {
          "Sun": "6 years",
          "Moon": "10 years", 
          "Mars": "7 years",
          "Rahu": "18 years",
          "Jupiter": "16 years",
          "Saturn": "19 years",
          "Mercury": "17 years",
          "Ketu": "7 years",
          "Venus": "20 years"
        }
      },
      yogini: {
        name: { en: "Yogini Dasha", ne: "योगिनी दशा" },
        description: { en: "36-year goddess-based periods", ne: "३६ वर्षको देवी-आधारित अवधि" },
        yoginis: ["Mangala", "Pingala", "Dhanya", "Bhramari", "Bhadrika", "Ulka", "Siddha", "Sankata"]
      }
    },

    // Divisional Charts
    divisionalCharts: {
      d1: { name: { en: "Rashi Chart", ne: "राशि चक्र" }, purpose: "Basic personality and life events" },
      d2: { name: { en: "Hora Chart", ne: "होरा चक्र" }, purpose: "Wealth and family" },
      d3: { name: { en: "Drekkana Chart", ne: "द्रेक्काण चक्र" }, purpose: "Siblings and courage" },
      d4: { name: { en: "Chaturthamsa Chart", ne: "चतुर्थांश चक्र" }, purpose: "Fortune and destiny" },
      d5: { name: { en: "Panchamsa Chart", ne: "पंचमांश चक्र" }, purpose: "Spiritual practices" },
      d6: { name: { en: "Shashthamsa Chart", ne: "षष्ठांश चक्र" }, purpose: "Health and diseases" },
      d7: { name: { en: "Saptamsa Chart", ne: "सप्तांश चक्र" }, purpose: "Children and progeny" },
      d8: { name: { en: "Ashtamsa Chart", ne: "अष्टांश चक्र" }, purpose: "Longevity and death" },
      d9: { name: { en: "Navamsa Chart", ne: "नवांश चक्र" }, purpose: "Marriage and spouse" },
      d10: { name: { en: "Dasamsa Chart", ne: "दशांश चक्र" }, purpose: "Career and profession" },
      d11: { name: { en: "Rudramsa Chart", ne: "रुद्रांश चक्र" }, purpose: "Gains and income" },
      d12: { name: { en: "Dwadasamsa Chart", ne: "द्वादशांश चक्र" }, purpose: "Parents and ancestors" }
    }
  },

  // Enhanced Remedies Database
  enhancedRemedies: {
    planetaryRemedies: {
      sun: {
        mantras: ["Om Ghrini Suryaya Namah", "Om Hrim Hrim Suryaya Namah"],
        gemstones: ["Ruby (Manik)", "Red Garnet", "Red Spinel"],
        colors: ["Red", "Orange", "Gold"],
        metals: ["Gold", "Copper"],
        fasting: "Sunday fast",
        donations: "Wheat, copper, gold to Brahmins",
        temples: "Sun temples, Surya temples",
        practices: ["Surya Namaskar", "Sun worship at sunrise"]
      },
      moon: {
        mantras: ["Om Chandraya Namah", "Om Som Somaya Namah"],
        gemstones: ["Pearl (Moti)", "Moonstone", "White Sapphire"],
        colors: ["White", "Silver", "Light Blue"],
        metals: ["Silver", "White metal"],
        fasting: "Monday fast",
        donations: "Rice, milk, white clothes to Brahmins",
        temples: "Moon temples, Shiva temples",
        practices: ["Chandra Namaskar", "Moon worship"]
      },
      mars: {
        mantras: ["Om Mangalaya Namah", "Om Kram Krim Krom Bhaumaya Namah"],
        gemstones: ["Red Coral (Moonga)", "Red Jasper", "Garnet"],
        colors: ["Red", "Orange"],
        metals: ["Iron", "Copper"],
        fasting: "Tuesday fast",
        donations: "Red lentils, iron items to Brahmins",
        temples: "Mars temples, Hanuman temples",
        practices: ["Hanuman worship", "Physical exercise"]
      },
      mercury: {
        mantras: ["Om Budhaya Namah", "Om Bram Breem Brom Budhaya Namah"],
        gemstones: ["Emerald (Panna)", "Green Tourmaline", "Peridot"],
        colors: ["Green", "Light Green"],
        metals: ["Mercury", "Brass"],
        fasting: "Wednesday fast",
        donations: "Green vegetables, books to Brahmins",
        temples: "Mercury temples, Vishnu temples",
        practices: ["Study", "Writing", "Communication"]
      },
      jupiter: {
        mantras: ["Om Gurave Namah", "Om Brim Brihaspataye Namah"],
        gemstones: ["Yellow Sapphire (Pukhraj)", "Yellow Topaz", "Citrine"],
        colors: ["Yellow", "Golden Yellow"],
        metals: ["Gold", "Brass"],
        fasting: "Thursday fast",
        donations: "Yellow clothes, gold to Brahmins",
        temples: "Jupiter temples, Vishnu temples",
        practices: ["Guru worship", "Teaching", "Charity"]
      },
      venus: {
        mantras: ["Om Shukraya Namah", "Om Dram Dreem Drom Shukraya Namah"],
        gemstones: ["Diamond", "White Sapphire", "Zircon"],
        colors: ["White", "Pink", "Light Blue"],
        metals: ["Silver", "Platinum"],
        fasting: "Friday fast",
        donations: "White flowers, silver to Brahmins",
        temples: "Venus temples, Lakshmi temples",
        practices: ["Art", "Music", "Beauty worship"]
      },
      saturn: {
        mantras: ["Om Sham Shanicharaya Namah", "Om Pram Preem Prom Shanicharaya Namah"],
        gemstones: ["Blue Sapphire (Neelam)", "Amethyst", "Lapis Lazuli"],
        colors: ["Dark Blue", "Black", "Purple"],
        metals: ["Iron", "Lead"],
        fasting: "Saturday fast",
        donations: "Black sesame, iron items to Brahmins",
        temples: "Saturn temples, Hanuman temples",
        practices: ["Service", "Discipline", "Meditation"]
      },
      rahu: {
        mantras: ["Om Rahave Namah", "Om Bhram Bhreem Bhrom Rahave Namah"],
        gemstones: ["Hessonite (Gomed)", "Smoky Quartz", "Black Tourmaline"],
        colors: ["Smoky", "Gray", "Black"],
        metals: ["Lead", "Iron"],
        fasting: "No strict fasting",
        donations: "Charity to poor, black items",
        temples: "Rahu temples, Shiva temples",
        practices: ["Charity", "Service to others"]
      },
      ketu: {
        mantras: ["Om Ketave Namah", "Om Sram Sreem Srom Ketave Namah"],
        gemstones: ["Cat's Eye (Lehsunia)", "Chrysoberyl", "Tourmaline"],
        colors: ["Brown", "Yellow", "Gray"],
        metals: ["Tin", "Lead"],
        fasting: "Spiritual practices",
        donations: "Spiritual books, meditation items",
        temples: "Ketu temples, Ganesha temples",
        practices: ["Meditation", "Spiritual practices", "Detachment"]
      }
    },

    // General Remedies
    generalRemedies: {
      mantras: {
        gayatri: "Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yonah Prachodayat",
        mahamrityunjaya: "Om Tryambakam Yajamahe, Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan, Mrityor Mukshiya Maamritat",
        om: "Om",
        shanti: "Om Shanti Shanti Shanti"
      },
      practices: {
        meditation: "Daily meditation for mental peace",
        yoga: "Regular yoga practice for physical and mental health",
        charity: "Regular charity and service to others",
        fasting: "Periodic fasting for spiritual purification",
        pilgrimage: "Visiting holy places and temples"
      }
    }
  }
};

// Helper functions for astrological analysis
export const astrologicalHelpers = {
  // Get planetary information
  getPlanetInfo: (planetName) => {
    return astrologicalKnowledge.planets[planetName.toLowerCase()] || null;
  },

  // Get house information
  getHouseInfo: (houseNumber) => {
    return astrologicalKnowledge.houses[houseNumber] || null;
  },

  // Get sign information
  getSignInfo: (signName) => {
    return astrologicalKnowledge.signs[signName.toLowerCase()] || null;
  },

  // Get nakshatra information
  getNakshatraInfo: (nakshatraName) => {
    return astrologicalKnowledge.nakshatras[nakshatraName.toLowerCase()] || null;
  },

  // Generate comprehensive planetary analysis
  generatePlanetaryAnalysis: (planet, sign, house) => {
    const planetInfo = astrologicalHelpers.getPlanetInfo(planet);
    const signInfo = astrologicalHelpers.getSignInfo(sign);
    const houseInfo = astrologicalHelpers.getHouseInfo(house);

    if (!planetInfo || !signInfo || !houseInfo) {
      return null;
    }

    return {
      planet: planetInfo,
      sign: signInfo,
      house: houseInfo,
      analysis: {
        en: `${planetInfo.name.en} in ${signInfo.name.en} (${houseInfo.name.en}) - ${planetInfo.karaka.join(', ')}`,
        ne: `${planetInfo.name.ne} ${signInfo.name.ne} मा (${houseInfo.name.ne}) - ${planetInfo.karaka.join(', ')}`
      }
    };
  },

  // Get remedies for a planet
  getPlanetaryRemedies: (planetName) => {
    const planet = astrologicalHelpers.getPlanetInfo(planetName);
    return planet ? planet.remedies : null;
  }
};
