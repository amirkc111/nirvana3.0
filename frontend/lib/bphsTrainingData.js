// Brihat Parasara Hora Sastra (BPHS) Training Data
// Classical Vedic Astrology Knowledge from Maharishi Parashara

export const bphsTrainingData = {
  // Core BPHS Principles
  corePrinciples: {
    creation: {
      title: "The Creation",
      description: "According to Parashara, the universe was created through the divine will of the Supreme Being, and astrology is the science that reveals the cosmic plan.",
      keyPoints: [
        "The universe is governed by cosmic laws",
        "Planets are the instruments of divine will",
        "Astrology reveals the divine plan for each individual"
      ]
    },
    
    planetaryCharacters: {
      title: "Planetary Characters and Description",
      description: "Detailed characteristics of all planets as described by Parashara",
      planets: {
        sun: {
          name: "Surya",
          nature: "Benefic when strong, malefic when weak",
          karaka: ["Soul", "Father", "Authority", "Vitality"],
          complexion: "Blood red",
          deity: "Agni (Fire)",
          sex: "Male",
          caste: "Kshatriya",
          taste: "Pungent",
          strength: "Exalted in Aries 10°",
          debilitation: "Libra 10°"
        },
        moon: {
          name: "Chandra",
          nature: "Benefic",
          karaka: ["Mind", "Mother", "Emotions", "Public"],
          complexion: "White",
          deity: "Varuna (Water)",
          sex: "Female",
          caste: "Brahmin",
          taste: "Salty",
          strength: "Exalted in Taurus 3°",
          debilitation: "Scorpio 3°"
        },
        mars: {
          name: "Mangala",
          nature: "Malefic",
          karaka: ["Energy", "Siblings", "Courage", "Action"],
          complexion: "Red",
          deity: "Kartikeya",
          sex: "Male",
          caste: "Kshatriya",
          taste: "Bitter",
          strength: "Exalted in Capricorn 28°",
          debilitation: "Cancer 28°"
        },
        mercury: {
          name: "Budha",
          nature: "Neutral (takes nature of associated planet)",
          karaka: ["Communication", "Intellect", "Trade", "Logic"],
          complexion: "Green",
          deity: "Vishnu",
          sex: "Neutral",
          caste: "Vaishya",
          taste: "Mixed",
          strength: "Exalted in Virgo 15°",
          debilitation: "Pisces 15°"
        },
        jupiter: {
          name: "Guru",
          nature: "Benefic",
          karaka: ["Wisdom", "Children", "Wealth", "Religion"],
          complexion: "Yellow",
          deity: "Indra",
          sex: "Male",
          caste: "Brahmin",
          taste: "Sweet",
          strength: "Exalted in Cancer 5°",
          debilitation: "Capricorn 5°"
        },
        venus: {
          name: "Shukra",
          nature: "Benefic",
          karaka: ["Love", "Luxury", "Art", "Relationships"],
          complexion: "White",
          deity: "Lakshmi",
          sex: "Female",
          caste: "Brahmin",
          taste: "Sour",
          strength: "Exalted in Pisces 27°",
          debilitation: "Virgo 27°"
        },
        saturn: {
          name: "Shani",
          nature: "Malefic",
          karaka: ["Discipline", "Karma", "Delay", "Restrictions"],
          complexion: "Dark",
          deity: "Yama",
          sex: "Neutral",
          caste: "Shudra",
          taste: "Astringent",
          strength: "Exalted in Libra 20°",
          debilitation: "Aries 20°"
        },
        rahu: {
          name: "Rahu",
          nature: "Malefic",
          karaka: ["Obsession", "Foreign", "Technology", "Ambition"],
          complexion: "Smoky",
          deity: "Serpent",
          sex: "Neutral",
          caste: "Mixed",
          taste: "Mixed",
          strength: "No exaltation",
          debilitation: "No debilitation"
        },
        ketu: {
          name: "Ketu",
          nature: "Malefic",
          karaka: ["Spirituality", "Detachment", "Past Karma"],
          complexion: "Brown",
          deity: "Ganesha",
          sex: "Neutral",
          caste: "Mixed",
          taste: "Mixed",
          strength: "No exaltation",
          debilitation: "No debilitation"
        }
      }
    },

    zodiacalSigns: {
      title: "Zodiacal Signs Described",
      description: "Detailed characteristics of all 12 zodiac signs as per Parashara",
      signs: {
        aries: {
          name: "Mesha",
          element: "Fire",
          quality: "Movable",
          lord: "Mars",
          nature: "Malefic",
          caste: "Kshatriya",
          sex: "Male",
          direction: "East",
          taste: "Bitter",
          tree: "Khair",
          limb: "Head"
        },
        taurus: {
          name: "Vrishabha",
          element: "Earth",
          quality: "Fixed",
          lord: "Venus",
          nature: "Benefic",
          caste: "Vaishya",
          sex: "Female",
          direction: "South",
          taste: "Sweet",
          tree: "Palash",
          limb: "Face"
        },
        gemini: {
          name: "Mithuna",
          element: "Air",
          quality: "Dual",
          lord: "Mercury",
          nature: "Neutral",
          caste: "Mixed",
          sex: "Neutral",
          direction: "West",
          taste: "Mixed",
          tree: "Ashoka",
          limb: "Arms"
        },
        cancer: {
          name: "Karka",
          element: "Water",
          quality: "Movable",
          lord: "Moon",
          nature: "Benefic",
          caste: "Brahmin",
          sex: "Female",
          direction: "North",
          taste: "Salty",
          tree: "Banyan",
          limb: "Chest"
        },
        leo: {
          name: "Simha",
          element: "Fire",
          quality: "Fixed",
          lord: "Sun",
          nature: "Benefic",
          caste: "Kshatriya",
          sex: "Male",
          direction: "East",
          taste: "Pungent",
          tree: "Banyan",
          limb: "Heart"
        },
        virgo: {
          name: "Kanya",
          element: "Earth",
          quality: "Dual",
          lord: "Mercury",
          nature: "Neutral",
          caste: "Mixed",
          sex: "Female",
          direction: "South",
          taste: "Mixed",
          tree: "Pipal",
          limb: "Stomach"
        },
        libra: {
          name: "Tula",
          element: "Air",
          quality: "Movable",
          lord: "Venus",
          nature: "Benefic",
          caste: "Vaishya",
          sex: "Male",
          direction: "West",
          taste: "Sour",
          tree: "Arjun",
          limb: "Navel"
        },
        scorpio: {
          name: "Vrishchika",
          element: "Water",
          quality: "Fixed",
          lord: "Mars",
          nature: "Malefic",
          caste: "Shudra",
          sex: "Female",
          direction: "North",
          taste: "Bitter",
          tree: "Khadira",
          limb: "Private parts"
        },
        sagittarius: {
          name: "Dhanu",
          element: "Fire",
          quality: "Dual",
          lord: "Jupiter",
          nature: "Benefic",
          caste: "Brahmin",
          sex: "Male",
          direction: "East",
          taste: "Sweet",
          tree: "Peepal",
          limb: "Thighs"
        },
        capricorn: {
          name: "Makara",
          element: "Earth",
          quality: "Movable",
          lord: "Saturn",
          nature: "Malefic",
          caste: "Shudra",
          sex: "Female",
          direction: "South",
          taste: "Astringent",
          tree: "Shami",
          limb: "Knees"
        },
        aquarius: {
          name: "Kumbha",
          element: "Air",
          quality: "Fixed",
          lord: "Saturn",
          nature: "Malefic",
          caste: "Shudra",
          sex: "Male",
          direction: "West",
          taste: "Astringent",
          tree: "Khadira",
          limb: "Ankles"
        },
        pisces: {
          name: "Meena",
          element: "Water",
          quality: "Dual",
          lord: "Jupiter",
          nature: "Benefic",
          caste: "Brahmin",
          sex: "Female",
          direction: "North",
          taste: "Salty",
          tree: "Ashoka",
          limb: "Feet"
        }
      }
    },

    houses: {
      title: "Judgement of Houses",
      description: "Detailed analysis of all 12 houses as per Parashara",
      houseAnalysis: {
        firstHouse: {
          name: "Lagna",
          karaka: "Sun",
          significations: ["Self", "Personality", "Appearance", "Health", "Vitality"],
          effects: "Physical appearance, personality, health, vitality, and overall life direction"
        },
        secondHouse: {
          name: "Dhana",
          karaka: "Jupiter",
          significations: ["Wealth", "Family", "Speech", "Food", "Eyes"],
          effects: "Wealth accumulation, family relations, speech, eating habits, and vision"
        },
        thirdHouse: {
          name: "Sahaja",
          karaka: "Mars",
          significations: ["Siblings", "Courage", "Short journeys", "Communication", "Hands"],
          effects: "Relations with siblings, courage, short travels, communication skills, and manual dexterity"
        },
        fourthHouse: {
          name: "Sukha",
          karaka: "Moon",
          significations: ["Mother", "Home", "Education", "Vehicles", "Happiness"],
          effects: "Mother's health, home life, education, vehicles, and emotional happiness"
        },
        fifthHouse: {
          name: "Putra",
          karaka: "Jupiter",
          significations: ["Children", "Intelligence", "Creativity", "Speculation", "Romance"],
          effects: "Children's health and success, intelligence, creative abilities, and romantic relationships"
        },
        sixthHouse: {
          name: "Ari",
          karaka: "Mars",
          significations: ["Enemies", "Diseases", "Service", "Debt", "Daily routine"],
          effects: "Enemies, health issues, service to others, debts, and daily work routine"
        },
        seventhHouse: {
          name: "Kalatra",
          karaka: "Venus",
          significations: ["Spouse", "Partnership", "Marriage", "Business", "Open enemies"],
          effects: "Marriage, spouse's nature, business partnerships, and open enemies"
        },
        eighthHouse: {
          name: "Ayu",
          karaka: "Saturn",
          significations: ["Longevity", "Occult", "Inheritance", "Transformation", "Secrets"],
          effects: "Longevity, occult sciences, inheritance, transformation, and hidden matters"
        },
        ninthHouse: {
          name: "Bhagya",
          karaka: "Jupiter",
          significations: ["Father", "Guru", "Dharma", "Higher learning", "Foreign travel"],
          effects: "Father's health, spiritual teacher, righteousness, higher education, and foreign connections"
        },
        tenthHouse: {
          name: "Karma",
          karaka: "Sun",
          significations: ["Profession", "Reputation", "Authority", "Status", "Government"],
          effects: "Career, reputation, authority, social status, and government connections"
        },
        eleventhHouse: {
          name: "Labha",
          karaka: "Jupiter",
          significations: ["Gains", "Friends", "Hopes", "Wishes", "Income"],
          effects: "Financial gains, friendships, fulfillment of desires, and income sources"
        },
        twelfthHouse: {
          name: "Vyaya",
          karaka: "Saturn",
          significations: ["Expenses", "Losses", "Foreign", "Spirituality", "Bed pleasures"],
          effects: "Expenses, losses, foreign lands, spirituality, and bed pleasures"
        }
      }
    },

    aspects: {
      title: "Aspects of the Signs",
      description: "Planetary aspects as described by Parashara",
      signAspects: {
        "1st": "7th house",
        "2nd": "6th and 8th houses", 
        "3rd": "5th and 9th houses",
        "4th": "8th and 10th houses",
        "5th": "3rd and 9th houses",
        "6th": "2nd and 12th houses",
        "7th": "1st house",
        "8th": "2nd and 4th houses",
        "9th": "3rd and 5th houses",
        "10th": "4th house",
        "11th": "5th house",
        "12th": "6th house"
      },
      planetaryAspects: {
        sun: "7th house aspect",
        moon: "7th house aspect",
        mars: "4th, 7th, 8th house aspects",
        mercury: "7th house aspect",
        jupiter: "5th, 7th, 9th house aspects",
        venus: "7th house aspect",
        saturn: "3rd, 7th, 10th house aspects",
        rahu: "5th, 7th, 9th house aspects",
        ketu: "5th, 7th, 9th house aspects"
      }
    },

    divisionalCharts: {
      title: "The Sixteen Divisions of a Sign",
      description: "Detailed explanation of all 16 vargas as per Parashara",
      vargas: {
        rashi: { name: "Rashi", division: "1", purpose: "Basic personality and life events" },
        hora: { name: "Hora", division: "2", purpose: "Wealth and family" },
        drekkana: { name: "Drekkana", division: "3", purpose: "Siblings and courage" },
        chaturthamsa: { name: "Chaturthamsa", division: "4", purpose: "Fortune and destiny" },
        panchamsa: { name: "Panchamsa", division: "5", purpose: "Spiritual practices" },
        shashthamsa: { name: "Shashthamsa", division: "6", purpose: "Health and diseases" },
        saptamsa: { name: "Saptamsa", division: "7", purpose: "Children and progeny" },
        ashtamsa: { name: "Ashtamsa", division: "8", purpose: "Longevity and death" },
        navamsa: { name: "Navamsa", division: "9", purpose: "Marriage and spouse" },
        dasamsa: { name: "Dasamsa", division: "10", purpose: "Career and profession" },
        rudramsa: { name: "Rudramsa", division: "11", purpose: "Gains and income" },
        dwadasamsa: { name: "Dwadasamsa", division: "12", purpose: "Parents and ancestors" },
        shodasamsa: { name: "Shodasamsa", division: "16", purpose: "Vehicles and comforts" },
        vimsamsa: { name: "Vimsamsa", division: "20", purpose: "Spiritual practices" },
        siddhamsa: { name: "Siddhamsa", division: "24", purpose: "Learning and education" },
        bhamsa: { name: "Bhamsa", division: "27", purpose: "Strength and courage" },
        trimsamsa: { name: "Trimsamsa", division: "30", purpose: "Evils and misfortunes" },
        chaturvimsamsa: { name: "Chaturvimsamsa", division: "24", purpose: "Learning and education" },
        akshavedamsa: { name: "Akshavedamsa", division: "45", purpose: "All matters" },
        shashtiamsa: { name: "Shashtiamsa", division: "60", purpose: "All matters" }
      }
    }
  },

  // Classical Yogas from BPHS
  classicalYogas: {
    rajaYogas: {
      description: "Royal combinations that bring power, authority, and success",
      conditions: [
        "Jupiter in kendras (1st, 4th, 7th, 10th) with benefic planets",
        "Strong 10th house with well-placed Jupiter or Sun",
        "Benefic planets in angular houses with good aspects",
        "Jupiter and Venus in kendras",
        "Sun and Moon in kendras"
      ],
      effects: "Brings recognition, authority, leadership qualities, and success in chosen field"
    },
    
    dhanaYogas: {
      description: "Wealth combinations that bring prosperity and financial success",
      conditions: [
        "Jupiter in 2nd house",
        "Venus in 2nd house", 
        "2nd lord in 11th house",
        "11th lord in 2nd house",
        "Jupiter and Venus conjunction",
        "Strong 2nd and 11th houses"
      ],
      effects: "Brings wealth, prosperity, financial stability, and material comforts"
    },
    
    vishYogas: {
      description: "Poisonous combinations that create challenges and obstacles",
      conditions: [
        "Mars and Saturn in conjunction",
        "Sun and Saturn in conjunction",
        "Malefic planets in angular houses",
        "Rahu and Ketu axis affecting all planets",
        "Weak benefic planets"
      ],
      effects: "Creates obstacles, delays, health issues, and relationship problems"
    }
  },

  // Classical Remedies from BPHS
  classicalRemedies: {
    planetaryRemedies: {
      sun: {
        problems: "Low energy, lack of confidence, health issues",
        remedies: [
          "Wear Ruby (Manik) gemstone",
          "Chant Surya mantras: Om Ghrini Suryaya Namah",
          "Perform Surya Namaskar daily",
          "Donate wheat, copper, or gold on Sundays",
          "Visit Sun temples and worship at sunrise"
        ]
      },
      moon: {
        problems: "Emotional instability, mental health issues",
        remedies: [
          "Wear Pearl (Moti) gemstone",
          "Chant Moon mantras: Om Chandraya Namah",
          "Observe Monday fasting",
          "Donate milk, rice, or white clothes",
          "Worship Shiva and perform Chandra Namaskar"
        ]
      },
      mars: {
        problems: "Anger, conflicts, accidents, blood-related issues",
        remedies: [
          "Wear Red Coral (Moonga) gemstone",
          "Chant Mars mantras: Om Mangalaya Namah",
          "Observe Tuesday fasting",
          "Worship Hanuman and perform physical exercise",
          "Donate red lentils or iron items"
        ]
      }
    },
    
    generalRemedies: {
      spiritual: [
        "Daily meditation and prayer",
        "Chanting Gayatri Mantra",
        "Performing Homa/Yagya",
        "Visiting temples regularly",
        "Reading spiritual texts"
      ],
      physical: [
        "Regular yoga practice",
        "Balanced diet according to planetary influences",
        "Adequate sleep and rest",
        "Physical exercise and outdoor activities",
        "Avoiding harmful habits"
      ],
      social: [
        "Charity and service to others",
        "Respecting elders and teachers",
        "Helping the needy and poor",
        "Maintaining good relationships",
        "Avoiding negative company"
      ]
    }
  },

  // BPHS Training Prompts
  trainingPrompts: {
    classicalAnalysis: {
      prompt: "Analyze this birth chart according to the classical principles of Brihat Parasara Hora Sastra",
      expectedResponse: "Provide analysis based on Parashara's classical methods, including planetary characteristics, house significations, and classical yogas"
    },
    
    yogaIdentification: {
      prompt: "Identify the classical yogas present in this birth chart as described by Parashara",
      expectedResponse: "Identify and explain Raja Yogas, Dhana Yogas, and other classical combinations with their effects"
    },
    
    houseAnalysis: {
      prompt: "Analyze each house in this birth chart according to Parashara's classical principles",
      expectedResponse: "Provide detailed house-wise analysis based on classical significations and effects"
    },
    
    remedySuggestions: {
      prompt: "Suggest classical remedies for the planetary afflictions found in this birth chart",
      expectedResponse: "Provide traditional remedies including mantras, gemstones, and spiritual practices as per classical texts"
    }
  }
};
