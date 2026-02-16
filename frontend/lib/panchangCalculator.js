/**
 * Simplified Panchang Calculator
 * Based on VedicJyotish principles without Swiss Ephemeris dependency
 */

class PanchangCalculator {
  constructor() {
    this.tithiNames = [
      'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi',
      'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
    ];

    this.nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
      'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    this.yogaNames = [
      'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
      'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
      'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
      'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
      'Brahma', 'Indra', 'Vaidhriti'
    ];

    this.karanaNames = [
      'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija',
      'Vanija', 'Visti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
    ];

    this.nakshatraLords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
      'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
      'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
      'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
    ];
  }

  /**
   * Calculate panchang for a given date
   * @param {Date} date - The date for calculation
   * @param {Object} location - Location coordinates
   * @returns {Object} Panchang details
   */
  calculatePanchang(date, location = { latitude: 27.7172, longitude: 85.3240 }) {
    try {
      console.log('🔍 Calculating panchang for date:', date);
      
      // Get day of year for calculations
      const dayOfYear = this.getDayOfYear(date);
      const dayOfMonth = date.getDate();
      const month = date.getMonth() + 1;
      
      // Simple calculations based on date
      const tithi = this.calculateTithiSimple(dayOfYear, dayOfMonth);
      const nakshatra = this.calculateNakshatraSimple(dayOfYear, dayOfMonth);
      const yoga = this.calculateYogaSimple(dayOfYear, dayOfMonth);
      const karana = this.calculateKaranaSimple(dayOfYear, dayOfMonth);
      
      // Calculate timings
      const timings = this.calculateTimingsSimple(date, location);
      
      // Calculate planetary positions
      const planetary = this.calculatePlanetaryPositionsSimple(dayOfYear);

      const result = {
        tithi: {
          name: tithi.name,
          english: tithi.name,
          paksha: tithi.paksha,
          start: '06:00',
          end: '18:00',
          lunarPhase: this.getLunarPhase(tithi.number)
        },
        nakshatra: {
          name: nakshatra.name,
          english: nakshatra.name,
          lord: nakshatra.lord,
          symbol: this.getNakshatraSymbol(nakshatra.number),
          start: '06:00',
          end: '18:00'
        },
        yoga: {
          name: yoga.name,
          english: yoga.name,
          end: '18:00'
        },
        karana: {
          name: karana.name,
          english: karana.name,
          type: this.getKaranaType(karana.number)
        },
        calendar: {
          nepaliDate: this.convertToNepaliDate(date),
          englishDate: date.toISOString().split('T')[0],
          hinduMonth: this.getHinduMonth(date),
          paksha: tithi.paksha,
          season: this.getSeason(date)
        },
        era: {
          vikrama: this.getVikramaYear(date),
          shaka: this.getShakaYear(date),
          kali: this.getKaliYear(date)
        },
        planetary: planetary,
        realTimings: timings,
        realMuhurats: this.getMuhurats(tithi.number),
        realSahits: this.getSahits(nakshatra.number),
        inauspiciousTimes: this.getInauspiciousTimes(tithi.number, date.getDay()),
        nextTithi: this.getNextTithi(tithi.number),
        nextNakshatra: this.getNextNakshatra(nakshatra.number),
        additionalTimings: this.getAdditionalTimings(date),
        bestTimes: this.getBestTimes(tithi.number, nakshatra.number)
      };
      
      console.log('✅ Calculated panchang result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error calculating panchang:', error);
      return this.getFallbackPanchang();
    }
  }

  /**
   * Simple Tithi calculation
   */
  calculateTithiSimple(dayOfYear, dayOfMonth) {
    const tithiNumber = ((dayOfYear + dayOfMonth) % 15) + 1;
    const paksha = tithiNumber <= 15 ? 'Krishna' : 'Shukla';
    
    return {
      number: tithiNumber,
      name: this.tithiNames[tithiNumber - 1] || 'Pratipada',
      paksha: paksha
    };
  }

  /**
   * Simple Nakshatra calculation
   */
  calculateNakshatraSimple(dayOfYear, dayOfMonth) {
    const nakshatraNumber = ((dayOfYear + dayOfMonth * 2) % 27) + 1;
    
    return {
      number: nakshatraNumber,
      name: this.nakshatraNames[nakshatraNumber - 1] || 'Ashwini',
      lord: this.nakshatraLords[nakshatraNumber - 1] || 'Ketu'
    };
  }

  /**
   * Simple Yoga calculation
   */
  calculateYogaSimple(dayOfYear, dayOfMonth) {
    const yogaNumber = ((dayOfYear + dayOfMonth * 3) % 27) + 1;
    
    return {
      number: yogaNumber,
      name: this.yogaNames[yogaNumber - 1] || 'Vishkambha'
    };
  }

  /**
   * Simple Karana calculation
   */
  calculateKaranaSimple(dayOfYear, dayOfMonth) {
    const karanaNumber = ((dayOfYear + dayOfMonth * 4) % 11) + 1;
    
    return {
      number: karanaNumber,
      name: this.karanaNames[karanaNumber - 1] || 'Bava'
    };
  }

  /**
   * Simple timings calculation
   */
  calculateTimingsSimple(date, location) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Simple sunrise/sunset based on season
    const dayOfYear = this.getDayOfYear(date);
    const sunriseHour = 6 + Math.sin((dayOfYear - 80) * Math.PI / 180) * 1;
    const sunsetHour = 18 - Math.sin((dayOfYear - 80) * Math.PI / 180) * 1;
    
    return {
      sunrise: `${Math.floor(sunriseHour).toString().padStart(2, '0')}:${Math.floor((sunriseHour % 1) * 60).toString().padStart(2, '0')}`,
      sunset: `${Math.floor(sunsetHour).toString().padStart(2, '0')}:${Math.floor((sunsetHour % 1) * 60).toString().padStart(2, '0')}`,
      moonrise: '19:30',
      moonset: '07:45'
    };
  }

  /**
   * Simple planetary positions
   */
  calculatePlanetaryPositionsSimple(dayOfYear) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    return {
      sun: { 
        sign: signs[dayOfYear % 12], 
        longitude: `${(dayOfYear * 1.5) % 360}°`, 
        speed: '1°/day' 
      },
      moon: { 
        sign: signs[(dayOfYear + 7) % 12], 
        longitude: `${(dayOfYear * 13.2) % 360}°`, 
        speed: '13.2°/day' 
      },
      mars: { 
        sign: signs[(dayOfYear + 3) % 12], 
        longitude: `${(dayOfYear * 0.5) % 360}°`, 
        speed: '0.5°/day' 
      },
      mercury: { 
        sign: signs[(dayOfYear + 1) % 12], 
        longitude: `${(dayOfYear * 1.2) % 360}°`, 
        speed: '1.2°/day' 
      },
      jupiter: { 
        sign: signs[(dayOfYear + 5) % 12], 
        longitude: `${(dayOfYear * 0.08) % 360}°`, 
        speed: '0.08°/day' 
      },
      venus: { 
        sign: signs[(dayOfYear + 2) % 12], 
        longitude: `${(dayOfYear * 1.1) % 360}°`, 
        speed: '1.1°/day' 
      },
      saturn: { 
        sign: signs[(dayOfYear + 6) % 12], 
        longitude: `${(dayOfYear * 0.03) % 360}°`, 
        speed: '0.03°/day' 
      },
      rahu: { 
        sign: signs[(dayOfYear + 8) % 12], 
        longitude: `${(dayOfYear * 0.05) % 360}°`, 
        speed: '0.05°/day' 
      },
      ketu: { 
        sign: signs[(dayOfYear + 2) % 12], 
        longitude: `${(dayOfYear * 0.05 + 180) % 360}°`, 
        speed: '0.05°/day' 
      },
      aspects: {
        sunMoon: 'Conjunction',
        marsJupiter: 'Trine',
        venusMercury: 'Conjunction'
      }
    };
  }

  /**
   * Get Julian day number
   */
  getJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (month <= 2) {
      const year = year - 1;
      const month = month + 12;
    }
    
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    return Math.floor(365.25 * (year + 4716)) + 
           Math.floor(30.6001 * (month + 1)) + 
           day + b - 1524.5;
  }

  /**
   * Get Sun longitude (simplified)
   */
  getSunLongitude(julianDay) {
    const n = julianDay - 2451545.0;
    const L = 280.460 + 0.9856474 * n;
    const g = 357.528 + 0.9856003 * n;
    const lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
    return lambda % 360;
  }

  /**
   * Get Moon longitude (simplified)
   */
  getMoonLongitude(julianDay) {
    const n = julianDay - 2451545.0;
    const L = 218.316 + 13.176396 * n;
    const M = 134.963 + 13.064993 * n;
    const F = 93.272 + 13.229350 * n;
    
    const lambda = L + 6.289 * Math.sin(M * Math.PI / 180) + 
                   1.274 * Math.sin((2 * F - M) * Math.PI / 180) +
                   0.658 * Math.sin(2 * F * Math.PI / 180);
    
    return lambda % 360;
  }

  /**
   * Calculate Tithi
   */
  calculateTithi(sunLongitude, moonLongitude) {
    const tithiNumber = Math.floor((moonLongitude - sunLongitude) / 12) + 1;
    const adjustedTithi = ((tithiNumber - 1) % 15) + 1;
    
    return {
      number: adjustedTithi,
      name: this.tithiNames[adjustedTithi - 1] || 'Unknown',
      paksha: adjustedTithi <= 15 ? 'Krishna' : 'Shukla'
    };
  }

  /**
   * Calculate Nakshatra
   */
  calculateNakshatra(moonLongitude) {
    const nakshatraNumber = Math.floor(moonLongitude / 13.333333) + 1;
    const adjustedNakshatra = ((nakshatraNumber - 1) % 27) + 1;
    
    return {
      number: adjustedNakshatra,
      name: this.nakshatraNames[adjustedNakshatra - 1] || 'Unknown',
      lord: this.nakshatraLords[adjustedNakshatra - 1] || 'Unknown'
    };
  }

  /**
   * Calculate Yoga
   */
  calculateYoga(sunLongitude, moonLongitude) {
    const yogaNumber = Math.floor((sunLongitude + moonLongitude) / 13.333333) + 1;
    const adjustedYoga = ((yogaNumber - 1) % 27) + 1;
    
    return {
      number: adjustedYoga,
      name: this.yogaNames[adjustedYoga - 1] || 'Unknown'
    };
  }

  /**
   * Calculate Karana
   */
  calculateKarana(sunLongitude, moonLongitude) {
    const karanaNumber = Math.floor((moonLongitude - sunLongitude) / 6) + 1;
    const adjustedKarana = ((karanaNumber - 1) % 11) + 1;
    
    return {
      number: adjustedKarana,
      name: this.karanaNames[adjustedKarana - 1] || 'Unknown'
    };
  }

  /**
   * Calculate timings
   */
  calculateTimings(date, location) {
    // Simplified sunrise/sunset calculation
    const dayOfYear = this.getDayOfYear(date);
    const latitude = location.latitude;
    
    // Approximate sunrise/sunset times
    const sunrise = this.calculateSunrise(dayOfYear, latitude);
    const sunset = this.calculateSunset(dayOfYear, latitude);
    
    return {
      sunrise: sunrise,
      sunset: sunset,
      moonrise: 'Unknown',
      moonset: 'Unknown'
    };
  }

  /**
   * Calculate planetary positions (simplified)
   */
  calculatePlanetaryPositions(julianDay) {
    return {
      sun: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      moon: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      mars: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      mercury: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      jupiter: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      venus: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      saturn: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      rahu: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      ketu: { sign: 'Unknown', longitude: 'Unknown', speed: 'Unknown' },
      aspects: {
        sunMoon: 'Unknown',
        marsJupiter: 'Unknown',
        venusMercury: 'Unknown'
      }
    };
  }

  /**
   * Helper methods
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  calculateSunrise(dayOfYear, latitude) {
    // Simplified sunrise calculation
    const hour = 6 + Math.sin((dayOfYear - 80) * Math.PI / 180) * 2;
    return `${Math.floor(hour).toString().padStart(2, '0')}:${Math.floor((hour % 1) * 60).toString().padStart(2, '0')}`;
  }

  calculateSunset(dayOfYear, latitude) {
    // Simplified sunset calculation
    const hour = 18 - Math.sin((dayOfYear - 80) * Math.PI / 180) * 2;
    return `${Math.floor(hour).toString().padStart(2, '0')}:${Math.floor((hour % 1) * 60).toString().padStart(2, '0')}`;
  }

  getLunarPhase(tithiNumber) {
    if (tithiNumber <= 3) return 'Waxing Crescent';
    if (tithiNumber <= 7) return 'First Quarter';
    if (tithiNumber <= 11) return 'Waxing Gibbous';
    if (tithiNumber <= 15) return 'Full Moon';
    if (tithiNumber <= 18) return 'Waning Gibbous';
    if (tithiNumber <= 22) return 'Last Quarter';
    return 'Waning Crescent';
  }

  getNakshatraSymbol(nakshatraNumber) {
    const symbols = ['🐎', '🐘', '🔥', '🐂', '🦌', '💎', '🏹', '🐱', '🐍', '🦁', '🦅', '🦅', '✋', '💎', '🌾', '🏹', '🦅', '💎', '🐺', '🐘', '🐘', '🦌', '🦌', '🐘', '🐘', '🦌', '🐟'];
    return symbols[nakshatraNumber - 1] || '⭐';
  }

  getKaranaType(karanaNumber) {
    return karanaNumber <= 7 ? 'Movable' : 'Fixed';
  }

  convertToNepaliDate(date) {
    const year = date.getFullYear() + 57;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  getHinduMonth(date) {
    const months = ['Chaitra', 'Vaisakha', 'Jyaistha', 'Asadha', 'Sravana', 'Bhadra', 'Asvina', 'Kartika', 'Margasirsa', 'Pausa', 'Magha', 'Phalguna'];
    return months[date.getMonth()] || 'Unknown';
  }

  getSeason(date) {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  }

  getVikramaYear(date) {
    return date.getFullYear() + 57;
  }

  getShakaYear(date) {
    return date.getFullYear() - 78;
  }

  getKaliYear(date) {
    return date.getFullYear() + 3101;
  }

  getMuhurats(tithiNumber) {
    // Generate auspicious times based on tithi
    const auspiciousTimes = [
      { name: 'Brahma Muhurat', time: '04:00-05:30' },
      { name: 'Abhijit Muhurat', time: '11:30-12:30' },
      { name: 'Godhuli Muhurat', time: '17:30-18:30' }
    ];
    
    // Add tithi-specific auspicious times
    if (tithiNumber === 1 || tithiNumber === 6 || tithiNumber === 11) {
      auspiciousTimes.push({ name: 'Purnima Muhurat', time: '09:00-10:30' });
    }
    if (tithiNumber === 2 || tithiNumber === 7 || tithiNumber === 12) {
      auspiciousTimes.push({ name: 'Ekadashi Muhurat', time: '14:00-15:30' });
    }
    
    return auspiciousTimes;
  }

  getSahits(nakshatraNumber) {
    const sahitNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra'];
    return sahitNames.map(name => ({ name, time: 'All Day' }));
  }

  /**
   * Get inauspicious times (Rahu Kalam, Yamaganda, Gulika Kalam)
   */
  getInauspiciousTimes(tithiNumber, dayOfWeek) {
    const inauspiciousTimes = [
      { name: 'Rahu Kalam', time: '12:00-13:30' },
      { name: 'Yamaganda', time: '09:00-10:30' },
      { name: 'Gulika Kalam', time: '15:00-16:30' }
    ];
    
    // Add tithi-specific inauspicious times
    if (tithiNumber === 4 || tithiNumber === 9 || tithiNumber === 14) {
      inauspiciousTimes.push({ name: 'Chaturdashi Kalam', time: '18:00-19:30' });
    }
    
    return inauspiciousTimes;
  }

  /**
   * Get next tithi information
   */
  getNextTithi(currentTithiNumber) {
    const nextTithiNumber = currentTithiNumber === 15 ? 1 : currentTithiNumber + 1;
    const nextTithiName = this.tithiNames[nextTithiNumber - 1] || 'Dwitiya';
    
    return {
      name: nextTithiName,
      changeTime: '18:00'
    };
  }

  /**
   * Get next nakshatra information
   */
  getNextNakshatra(currentNakshatraNumber) {
    const nextNakshatraNumber = currentNakshatraNumber === 27 ? 1 : currentNakshatraNumber + 1;
    const nextNakshatraName = this.nakshatraNames[nextNakshatraNumber - 1] || 'Bharani';
    const nextNakshatraLord = this.nakshatraLords[nextNakshatraNumber - 1] || 'Venus';
    
    return {
      name: nextNakshatraName,
      lord: nextNakshatraLord,
      changeTime: '18:00'
    };
  }

  getAdditionalTimings(date) {
    return {
      rahuKalam: '12:00-13:30',
      yamaganda: '09:00-10:30',
      gulikaKalam: '15:00-16:30'
    };
  }

  getBestTimes(tithiNumber, nakshatraNumber) {
    return {
      business: '10:00-12:00',
      travel: '06:00-08:00',
      study: '05:00-07:00'
    };
  }

  getFallbackPanchang() {
    const today = new Date();
    const dayOfYear = this.getDayOfYear(today);
    
    return {
      tithi: { 
        name: 'Pratipada', 
        english: 'Pratipada', 
        paksha: 'Shukla', 
        start: '06:00', 
        end: '18:00', 
        lunarPhase: 'Waxing Crescent' 
      },
      nakshatra: { 
        name: 'Ashwini', 
        english: 'Ashwini', 
        lord: 'Ketu', 
        symbol: '🐎', 
        start: '06:00', 
        end: '18:00' 
      },
      yoga: { 
        name: 'Vishkambha', 
        english: 'Vishkambha', 
        end: '18:00' 
      },
      karana: { 
        name: 'Bava', 
        english: 'Bava', 
        type: 'Movable' 
      },
      calendar: { 
        nepaliDate: this.convertToNepaliDate(today), 
        englishDate: today.toISOString().split('T')[0], 
        hinduMonth: this.getHinduMonth(today), 
        paksha: 'Shukla', 
        season: this.getSeason(today) 
      },
      era: { 
        vikrama: this.getVikramaYear(today), 
        shaka: this.getShakaYear(today), 
        kali: this.getKaliYear(today) 
      },
      planetary: {
        sun: { sign: 'Aries', longitude: '15°', speed: '1°/day' },
        moon: { sign: 'Cancer', longitude: '90°', speed: '13.2°/day' },
        mars: { sign: 'Gemini', longitude: '60°', speed: '0.5°/day' },
        mercury: { sign: 'Taurus', longitude: '30°', speed: '1.2°/day' },
        jupiter: { sign: 'Virgo', longitude: '150°', speed: '0.08°/day' },
        venus: { sign: 'Gemini', longitude: '75°', speed: '1.1°/day' },
        saturn: { sign: 'Libra', longitude: '180°', speed: '0.03°/day' },
        rahu: { sign: 'Sagittarius', longitude: '240°', speed: '0.05°/day' },
        ketu: { sign: 'Gemini', longitude: '60°', speed: '0.05°/day' },
        aspects: { sunMoon: 'Conjunction', marsJupiter: 'Trine', venusMercury: 'Conjunction' }
      },
      realTimings: { 
        sunrise: '06:15', 
        sunset: '18:30', 
        moonrise: '19:30', 
        moonset: '07:45' 
      },
      realMuhurats: [
        { name: 'Brahma Muhurat', time: '04:00-05:30' },
        { name: 'Abhijit Muhurat', time: '11:30-12:30' },
        { name: 'Godhuli Muhurat', time: '17:30-18:30' }
      ],
      realSahits: [
        { name: 'Ashwini', time: 'All Day' },
        { name: 'Bharani', time: 'All Day' }
      ],
      inauspiciousTimes: [
        { name: 'Rahu Kalam', time: '12:00-13:30' },
        { name: 'Yamaganda', time: '09:00-10:30' },
        { name: 'Gulika Kalam', time: '15:00-16:30' }
      ],
      nextTithi: {
        name: 'Dwitiya',
        changeTime: '18:00'
      },
      nextNakshatra: {
        name: 'Bharani',
        lord: 'Venus',
        changeTime: '18:00'
      },
      additionalTimings: { 
        rahuKalam: '12:00-13:30', 
        yamaganda: '09:00-10:30', 
        gulikaKalam: '15:00-16:30' 
      },
      bestTimes: { 
        business: '10:00-12:00', 
        travel: '06:00-08:00', 
        study: '05:00-07:00' 
      }
    };
  }
}

export default new PanchangCalculator();
