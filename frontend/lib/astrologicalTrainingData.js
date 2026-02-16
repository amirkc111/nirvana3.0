// Comprehensive Training Data for Enhanced Kundali AI
// Realistic astrological scenarios and responses for better AI training

export const trainingData = {
  // Sample Kundali scenarios with detailed analysis
  sampleKundalis: [
    {
      name: "Rajesh Kumar",
      birthDetails: {
        date: "1985-03-15",
        time: "10:30:00",
        place: "Delhi, India",
        latitude: 28.6139,
        longitude: 77.2090
      },
      planetaryPositions: {
        sun: { sign: "Pisces", house: 12, degree: 29.5 },
        moon: { sign: "Cancer", house: 4, degree: 15.2 },
        mars: { sign: "Aries", house: 1, degree: 8.7 },
        mercury: { sign: "Pisces", house: 12, degree: 12.3 },
        jupiter: { sign: "Capricorn", house: 10, degree: 22.1 },
        venus: { sign: "Aquarius", house: 11, degree: 18.9 },
        saturn: { sign: "Scorpio", house: 8, degree: 5.4 },
        rahu: { sign: "Gemini", house: 3, degree: 14.6 },
        ketu: { sign: "Sagittarius", house: 9, degree: 14.6 }
      },
      analysis: {
        strengths: ["Strong Jupiter in 10th house", "Moon in own sign Cancer", "Venus in 11th house"],
        challenges: ["Mars in 1st house (Manglik)", "Saturn in 8th house", "Sun in 12th house"],
        yogas: ["Gaj Kesari Yoga", "Dhana Yoga", "Raja Yoga"],
        doshas: ["Manglik Dosh"],
        career: "Suitable for government service, teaching, or spiritual work",
        marriage: "Delayed marriage due to Manglik Dosh, but will be successful",
        health: "Generally good health, but need to take care of eyes and head"
      }
    },
    {
      name: "Priya Sharma",
      birthDetails: {
        date: "1990-07-22",
        time: "14:45:00",
        place: "Mumbai, India",
        latitude: 19.0760,
        longitude: 72.8777
      },
      planetaryPositions: {
        sun: { sign: "Cancer", house: 4, degree: 6.8 },
        moon: { sign: "Leo", house: 5, degree: 23.4 },
        mars: { sign: "Virgo", house: 6, degree: 11.2 },
        mercury: { sign: "Leo", house: 5, degree: 18.7 },
        jupiter: { sign: "Cancer", house: 4, degree: 29.1 },
        venus: { sign: "Gemini", house: 3, degree: 7.5 },
        saturn: { sign: "Capricorn", house: 10, degree: 16.8 },
        rahu: { sign: "Cancer", house: 4, degree: 9.3 },
        ketu: { sign: "Capricorn", house: 10, degree: 9.3 }
      },
      analysis: {
        strengths: ["Sun in own sign", "Jupiter in 4th house", "Strong 5th house"],
        challenges: ["Rahu in 4th house", "Ketu in 10th house", "Saturn in 10th house"],
        yogas: ["Adhi Yoga", "Vipreet Raja Yoga"],
        doshas: ["Kalsarp Dosh"],
        career: "Excellent for creative fields, arts, or entertainment",
        marriage: "Early marriage indicated, spouse will be creative and artistic",
        health: "Good health, but need to take care of heart and stomach"
      }
    }
  ],

  // Detailed response examples for different queries
  responseExamples: {
    careerAnalysis: {
      query: "What career is best for me?",
      response: {
        en: "Based on your Kundali, you have strong indications for success in [specific field]. Your 10th house shows [analysis], and the planetary positions suggest [timing and opportunities]. The most suitable professions for you are [list]. You should focus on [specific advice] and avoid [warnings].",
        ne: "तपाईंको कुण्डलीका आधारमा, [विशिष्ट क्षेत्र]मा सफलताका लागि बलियो संकेत छ। तपाईंको १०औं घरले [विश्लेषण] देखाउँछ, र ग्रहीय स्थितिहरूले [समय र अवसरहरू] सुझाव दिन्छ। तपाईंका लागि सबैभन्दा उपयुक्त पेशाहरू [सूची] हुन्। तपाईंले [विशिष्ट सल्लाह]मा ध्यान दिनुपर्छ र [चेतावनीहरू]बाट बच्नुपर्छ।"
      }
    },
    marriageAnalysis: {
      query: "When will I get married?",
      response: {
        en: "Your marriage timing is indicated by [specific dasha periods]. Based on your current dasha and planetary transits, marriage is likely during [specific period]. Your spouse will be [characteristics] and the marriage will be [nature]. The most favorable time is [timing] when [planetary conditions].",
        ne: "तपाईंको विवाहको समय [विशिष्ट दशा अवधि]द्वारा निर्धारित छ। तपाईंको वर्तमान दशा र ग्रहीय गोचरका आधारमा, विवाह [विशिष्ट अवधि]मा हुने सम्भावना छ। तपाईंको जीवनसाथी [विशेषताहरू] हुनेछ र विवाह [प्रकृति] हुनेछ। सबैभन्दा अनुकूल समय [समय] हो जब [ग्रहीय अवस्थाहरू]।"
      }
    },
    healthAnalysis: {
      query: "What are my health prospects?",
      response: {
        en: "Your health chart shows [analysis]. The strong points are [strengths] and areas of concern are [weaknesses]. You should focus on [preventive measures] and avoid [risk factors]. The most critical periods for health are [timing] when you need to be extra careful.",
        ne: "तपाईंको स्वास्थ्य चार्टले [विश्लेषण] देखाउँछ। बलियो पक्षहरू [शक्तिहरू] हुन् र चिन्ताका क्षेत्रहरू [कमजोरीहरू] हुन्। तपाईंले [रोकथाम उपायहरू]मा ध्यान दिनुपर्छ र [जोखिम कारकहरू]बाट बच्नुपर्छ। स्वास्थ्यका लागि सबैभन्दा महत्वपूर्ण अवधिहरू [समय] हुन् जब तपाईंले अतिरिक्त सावधानी अपनाउनुपर्छ।"
      }
    }
  },

  // Advanced astrological concepts with examples
  advancedConcepts: {
    yogaAnalysis: {
      rajaYoga: {
        description: "Royal combinations that bring power, authority, and success",
        examples: [
          "Jupiter in kendras (1st, 4th, 7th, 10th houses) with benefic planets",
          "Strong 10th house with well-placed Jupiter or Sun",
          "Benefic planets in angular houses with good aspects"
        ],
        effects: "Brings recognition, authority, leadership qualities, and success in chosen field"
      },
      dhanaYoga: {
        description: "Wealth combinations that bring prosperity and financial success",
        examples: [
          "Jupiter in 2nd house",
          "Venus in 2nd house",
          "2nd lord in 11th house",
          "Strong 11th house with benefic planets"
        ],
        effects: "Brings wealth, prosperity, financial stability, and material comforts"
      },
      vishYoga: {
        description: "Poisonous combinations that create challenges and obstacles",
        examples: [
          "Mars and Saturn in conjunction",
          "Sun and Saturn in conjunction",
          "Malefic planets in angular houses",
          "Rahu-Ketu axis affecting all planets"
        ],
        effects: "Creates obstacles, delays, health issues, and relationship problems"
      }
    },
    doshaAnalysis: {
      manglikDosh: {
        description: "Mars affliction affecting marriage and relationships",
        conditions: "Mars in 1st, 4th, 7th, 8th, or 12th houses",
        effects: "Delayed marriage, relationship issues, marital discord",
        remedies: [
          "Manglik matching with another Manglik person",
          "Mars remedies: Red coral, Tuesday fasting, Hanuman worship",
          "Delayed marriage (after 28 years for men, 24 years for women)",
          "Chanting Mars mantras: Om Mangalaya Namah"
        ]
      },
      kalsarpDosh: {
        description: "Rahu-Ketu axis affecting all planets",
        conditions: "All planets between Rahu and Ketu",
        effects: "Obstacles in all areas of life, delays, and challenges",
        remedies: [
          "Snake worship and Nag Panchami observance",
          "Rahu-Ketu remedies: Hessonite and Cat's Eye gemstones",
          "Spiritual practices and meditation",
          "Charity and service to others"
        ]
      }
    }
  },

  // Timing predictions with specific examples
  timingPredictions: {
    dashaAnalysis: {
      vimsottari: {
        description: "120-year planetary periods system",
        periods: {
          "Sun": "6 years - Leadership, authority, recognition",
          "Moon": "10 years - Emotions, mind, public life",
          "Mars": "7 years - Energy, courage, conflicts",
          "Rahu": "18 years - Material desires, foreign connections",
          "Jupiter": "16 years - Wisdom, growth, spirituality",
          "Saturn": "19 years - Discipline, delays, hard work",
          "Mercury": "17 years - Communication, intelligence, commerce",
          "Ketu": "7 years - Spirituality, detachment, past karma",
          "Venus": "20 years - Love, luxury, arts, relationships"
        }
      }
    },
    transitAnalysis: {
      jupiterTransit: {
        description: "Jupiter's transit through different signs",
        effects: {
          "Aries": "New beginnings, leadership, courage",
          "Taurus": "Stability, wealth, material gains",
          "Gemini": "Communication, learning, short travels",
          "Cancer": "Home, family, emotional security",
          "Leo": "Creativity, children, entertainment",
          "Virgo": "Health, service, daily routine",
          "Libra": "Partnerships, marriage, balance",
          "Scorpio": "Transformation, secrets, shared resources",
          "Sagittarius": "Higher learning, philosophy, long travels",
          "Capricorn": "Career, authority, responsibility",
          "Aquarius": "Friends, groups, humanitarian work",
          "Pisces": "Spirituality, compassion, service"
        }
      }
    }
  },

  // Remedy suggestions with specific details
  remedySuggestions: {
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
        problems: "Emotional instability, mental health issues, water-related problems",
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
  }
};
