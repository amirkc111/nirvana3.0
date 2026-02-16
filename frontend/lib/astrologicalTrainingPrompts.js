// Specialized Training Prompts for Enhanced Kundali AI
// These prompts help the AI understand different astrological scenarios and provide appropriate responses

export const trainingPrompts = {
  // Basic Kundali Analysis Prompts
  basicAnalysis: {
    planetaryPositions: {
      prompt: "Analyze the planetary positions in this Kundali and explain their significance in both English and Nepali.",
      expectedResponse: "Provide detailed analysis of each planet's position, house placement, and their effects on the native's life."
    },
    houseAnalysis: {
      prompt: "Explain the significance of each house in this birth chart and how they affect different areas of life.",
      expectedResponse: "Detailed house-wise analysis covering career, relationships, health, wealth, and spiritual aspects."
    },
    nakshatraAnalysis: {
      prompt: "Analyze the birth nakshatra and its influence on personality and life events.",
      expectedResponse: "Comprehensive nakshatra analysis including qualities, characteristics, and life predictions."
    }
  },

  // Advanced Astrological Concepts
  advancedConcepts: {
    yogaAnalysis: {
      prompt: "Identify and explain the major yogas (planetary combinations) present in this Kundali.",
      expectedResponse: "Detailed analysis of Raja Yogas, Dhana Yogas, and other significant combinations with their effects."
    },
    doshaAnalysis: {
      prompt: "Check for any doshas (afflictions) in this birth chart and suggest appropriate remedies.",
      expectedResponse: "Identification of Manglik Dosh, Kalsarp Dosh, Pitru Dosh, etc., with specific remedies."
    },
    dashaAnalysis: {
      prompt: "Analyze the current and upcoming dasha periods and their effects on the native's life.",
      expectedResponse: "Detailed dasha analysis with timing predictions and life event forecasts."
    }
  },

  // Specific Life Areas
  lifeAreas: {
    career: {
      prompt: "What does this Kundali indicate about career prospects, suitable professions, and timing of career changes?",
      expectedResponse: "Comprehensive career analysis including suitable professions, career timing, and success indicators."
    },
    marriage: {
      prompt: "Analyze the marriage prospects, timing, and compatibility factors in this birth chart.",
      expectedResponse: "Detailed marriage analysis including timing, spouse characteristics, and relationship dynamics."
    },
    health: {
      prompt: "What health issues or strengths are indicated in this Kundali?",
      expectedResponse: "Health analysis covering potential health issues, strengths, and preventive measures."
    },
    wealth: {
      prompt: "Analyze the wealth and financial prospects indicated in this birth chart.",
      expectedResponse: "Financial analysis including wealth accumulation, investment timing, and financial stability."
    },
    spirituality: {
      prompt: "What spiritual inclinations and practices are indicated in this Kundali?",
      expectedResponse: "Spiritual analysis covering inclinations, practices, and spiritual development path."
    }
  },

  // Remedies and Solutions
  remedies: {
    planetaryRemedies: {
      prompt: "Suggest specific remedies for any planetary afflictions found in this birth chart.",
      expectedResponse: "Detailed remedy suggestions including mantras, gemstones, colors, fasting, and spiritual practices."
    },
    generalRemedies: {
      prompt: "What general remedies and practices would benefit this native?",
      expectedResponse: "Comprehensive remedy suggestions including daily practices, mantras, and spiritual activities."
    }
  },

  // Timing and Predictions
  timing: {
    lifeEvents: {
      prompt: "When are the major life events likely to occur based on this Kundali?",
      expectedResponse: "Timing predictions for marriage, career changes, financial gains, and other major life events."
    },
    favorablePeriods: {
      prompt: "Identify the most favorable periods for different activities in this native's life.",
      expectedResponse: "Detailed timing analysis for various life activities and decision-making periods."
    }
  },

  // Conversation Examples for Training
  conversationExamples: [
    {
      user: "What does my birth chart say about my career?",
      assistant: "Based on your Kundali, I can see strong indications for success in [specific field]. Your 10th house shows [analysis], and the planetary positions suggest [timing and opportunities]. In Nepali: तपाईंको जन्मपत्रिकामा [career analysis in Nepali] देखिन्छ।"
    },
    {
      user: "Am I manglik? What should I do?",
      assistant: "Your birth chart shows [manglik status]. If you have Manglik Dosh, here are the specific remedies: [detailed remedies]. The key is [explanation]. In Nepali: तपाईंको मंगलिक दोषको बारेमा [Nepali explanation]।"
    },
    {
      user: "When will I get married?",
      assistant: "Based on your dasha periods and planetary transits, marriage is likely during [specific period]. The indicators show [analysis]. In Nepali: तपाईंको विवाह [timing in Nepali] हुने सम्भावना छ।"
    },
    {
      user: "What gemstones should I wear?",
      assistant: "For your planetary positions, I recommend [specific gemstones] because [reasoning]. The most beneficial would be [primary recommendation]. In Nepali: तपाईंको लागि [gemstone recommendations in Nepali] उपयुक्त हुनेछ।"
    },
    {
      user: "What mantras should I chant?",
      assistant: "Based on your birth chart, the most effective mantras are [specific mantras]. Chant [frequency and method]. In Nepali: तपाईंको लागि [mantra recommendations in Nepali] जप गर्नुहोस्।"
    }
  ],

  // Specialized Response Patterns
  responsePatterns: {
    // For planetary analysis
    planetaryResponse: {
      structure: [
        "Planet name and significance",
        "House placement analysis", 
        "Sign placement analysis",
        "Aspects and conjunctions",
        "Effects on life areas",
        "Remedies if needed",
        "Bilingual summary"
      ]
    },
    
    // For dosha analysis
    doshaResponse: {
      structure: [
        "Dosha identification",
        "Severity assessment",
        "Life area effects",
        "Specific remedies",
        "Timing considerations",
        "Preventive measures"
      ]
    },
    
    // For timing predictions
    timingResponse: {
      structure: [
        "Current dasha analysis",
        "Upcoming periods",
        "Transit effects",
        "Specific timing",
        "Preparation advice",
        "Optimization tips"
      ]
    }
  },

  // Advanced Training Scenarios
  advancedScenarios: {
    complexYogas: {
      prompt: "This Kundali has multiple complex yogas. Analyze them and explain their combined effects.",
      expectedResponse: "Detailed analysis of multiple yogas and their interactions, including both positive and challenging combinations."
    },
    doshaRemedies: {
      prompt: "This native has multiple doshas. Suggest a comprehensive remedy plan.",
      expectedResponse: "Prioritized remedy plan addressing multiple doshas with specific timing and methods."
    },
    spiritualGuidance: {
      prompt: "Provide spiritual guidance based on this Kundali's spiritual indicators.",
      expectedResponse: "Comprehensive spiritual guidance including practices, mantras, and spiritual development path."
    }
  }
};

// Training conversation starters
export const conversationStarters = [
  "Tell me about my planetary positions",
  "What does my birth chart say about my future?",
  "Am I manglik? What should I do?",
  "When will I get married?",
  "What career is best for me?",
  "What gemstones should I wear?",
  "What mantras should I chant?",
  "What are my health prospects?",
  "When will I have children?",
  "What are my financial prospects?",
  "What spiritual practices suit me?",
  "What are my relationship prospects?",
  "What challenges will I face?",
  "What are my strengths?",
  "What remedies do I need?"
];

// Bilingual response templates
export const bilingualTemplates = {
  greeting: {
    en: "Namaste! I'm your Vedic astrology assistant.",
    ne: "नमस्ते! म तपाईंको वैदिक ज्योतिष सहायक हूँ।"
  },
  analysis: {
    en: "Based on your Kundali analysis:",
    ne: "तपाईंको कुण्डली विश्लेषणका आधारमा:"
  },
  remedies: {
    en: "Here are the recommended remedies:",
    ne: "यहाँ सिफारिस गरिएका उपायहरू छन्:"
  },
  timing: {
    en: "The timing for this event is:",
    ne: "यस घटनाको समय हो:"
  }
};
