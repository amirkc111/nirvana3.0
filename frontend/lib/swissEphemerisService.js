/**
 * Swiss Ephemeris Service for Panchang Calculations
 * Based on VedicJyotish repository: https://github.com/PtPrashantTripathi/VedicJyotish
 */

class SwissEphemerisService {
  constructor() {
    this.isInitialized = false;
    this.swisseph = null;
  }

  /**
   * Initialize Swiss Ephemeris
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Import Swiss Ephemeris WASM
      const { SwissEph } = await import('swisseph');
      this.swisseph = new SwissEph();
      this.isInitialized = true;
      console.log('✅ Swiss Ephemeris initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Swiss Ephemeris:', error);
      throw error;
    }
  }

  /**
   * Calculate Panchang details for a given date and location
   * @param {Date} date - The date for calculation
   * @param {Object} location - Location coordinates {latitude, longitude, timezone}
   * @returns {Object} Panchang details
   */
  async calculatePanchang(date, location = { latitude: 27.7172, longitude: 85.3240, timezone: 5.75 }) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const julianDay = this.swisseph.swe_julday(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        this.getDecimalTime(date),
        1 // Gregorian calendar
      );

      // Calculate planetary positions
      const planetaryPositions = await this.calculatePlanetaryPositions(julianDay);
      
      // Calculate Tithi
      const tithi = await this.calculateTithi(julianDay);
      
      // Calculate Nakshatra
      const nakshatra = await this.calculateNakshatra(julianDay);
      
      // Calculate Yoga
      const yoga = await this.calculateYoga(julianDay);
      
      // Calculate Karana
      const karana = await this.calculateKarana(julianDay);
      
      // Calculate sunrise/sunset
      const timings = await this.calculateTimings(julianDay, location);

      return {
        tithi,
        nakshatra,
        yoga,
        karana,
        planetary: planetaryPositions,
        timings,
        date: {
          julian: julianDay,
          gregorian: date.toISOString().split('T')[0],
          nepali: this.convertToNepaliDate(date)
        }
      };
    } catch (error) {
      console.error('❌ Error calculating panchang:', error);
      throw error;
    }
  }

  /**
   * Calculate planetary positions
   */
  async calculatePlanetaryPositions(julianDay) {
    const planets = {
      sun: 0,
      moon: 1,
      mars: 4,
      mercury: 2,
      jupiter: 5,
      venus: 3,
      saturn: 6,
      rahu: 11,
      ketu: 12
    };

    const positions = {};
    
    for (const [planet, id] of Object.entries(planets)) {
      try {
        const result = this.swisseph.swe_calc_ut(julianDay, id, 0);
        positions[planet] = {
          longitude: result[0],
          latitude: result[1],
          distance: result[2],
          speed: result[3]
        };
      } catch (error) {
        console.warn(`⚠️ Could not calculate position for ${planet}:`, error);
        positions[planet] = {
          longitude: 0,
          latitude: 0,
          distance: 0,
          speed: 0
        };
      }
    }

    return positions;
  }

  /**
   * Calculate Tithi
   */
  async calculateTithi(julianDay) {
    try {
      const sunPos = this.swisseph.swe_calc_ut(julianDay, 0, 0)[0]; // Sun longitude
      const moonPos = this.swisseph.swe_calc_ut(julianDay, 1, 0)[0]; // Moon longitude
      
      const tithiNumber = Math.floor((moonPos - sunPos) / 12) + 1;
      const tithiNames = [
        'Purnima', 'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi',
        'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
      ];
      
      return {
        number: tithiNumber,
        name: tithiNames[tithiNumber - 1] || 'Unknown',
        paksha: tithiNumber <= 15 ? 'Krishna' : 'Shukla'
      };
    } catch (error) {
      console.warn('⚠️ Could not calculate Tithi:', error);
      return { number: 0, name: 'Unknown', paksha: 'Unknown' };
    }
  }

  /**
   * Calculate Nakshatra
   */
  async calculateNakshatra(julianDay) {
    try {
      const moonPos = this.swisseph.swe_calc_ut(julianDay, 1, 0)[0]; // Moon longitude
      const nakshatraNumber = Math.floor(moonPos / 13.333333) + 1;
      
      const nakshatraNames = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
        'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
      ];
      
      return {
        number: nakshatraNumber,
        name: nakshatraNames[nakshatraNumber - 1] || 'Unknown',
        lord: this.getNakshatraLord(nakshatraNumber)
      };
    } catch (error) {
      console.warn('⚠️ Could not calculate Nakshatra:', error);
      return { number: 0, name: 'Unknown', lord: 'Unknown' };
    }
  }

  /**
   * Calculate Yoga
   */
  async calculateYoga(julianDay) {
    try {
      const sunPos = this.swisseph.swe_calc_ut(julianDay, 0, 0)[0];
      const moonPos = this.swisseph.swe_calc_ut(julianDay, 1, 0)[0];
      
      const yogaNumber = Math.floor((sunPos + moonPos) / 13.333333) + 1;
      const yogaNames = [
        'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
        'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
        'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
        'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
        'Brahma', 'Indra', 'Vaidhriti'
      ];
      
      return {
        number: yogaNumber,
        name: yogaNames[yogaNumber - 1] || 'Unknown'
      };
    } catch (error) {
      console.warn('⚠️ Could not calculate Yoga:', error);
      return { number: 0, name: 'Unknown' };
    }
  }

  /**
   * Calculate Karana
   */
  async calculateKarana(julianDay) {
    try {
      const sunPos = this.swisseph.swe_calc_ut(julianDay, 0, 0)[0];
      const moonPos = this.swisseph.swe_calc_ut(julianDay, 1, 0)[0];
      
      const karanaNumber = Math.floor((moonPos - sunPos) / 6) + 1;
      const karanaNames = [
        'Kimstughna', 'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija',
        'Vanija', 'Visti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
      ];
      
      return {
        number: karanaNumber,
        name: karanaNames[karanaNumber - 1] || 'Unknown'
      };
    } catch (error) {
      console.warn('⚠️ Could not calculate Karana:', error);
      return { number: 0, name: 'Unknown' };
    }
  }

  /**
   * Calculate sunrise/sunset timings
   */
  async calculateTimings(julianDay, location) {
    try {
      const sunrise = this.swisseph.swe_rise_trans(
        julianDay, 0, 0, 0, 1, location.latitude, location.longitude, 0, 0, 0
      );
      
      const sunset = this.swisseph.swe_rise_trans(
        julianDay, 0, 0, 0, 2, location.latitude, location.longitude, 0, 0, 0
      );

      return {
        sunrise: this.formatTime(sunrise),
        sunset: this.formatTime(sunset),
        moonrise: 'Unknown', // Complex calculation
        moonset: 'Unknown'    // Complex calculation
      };
    } catch (error) {
      console.warn('⚠️ Could not calculate timings:', error);
      return {
        sunrise: 'Unknown',
        sunset: 'Unknown',
        moonrise: 'Unknown',
        moonset: 'Unknown'
      };
    }
  }

  /**
   * Get Nakshatra lord
   */
  getNakshatraLord(nakshatraNumber) {
    const lords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
      'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
      'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
      'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
    ];
    return lords[nakshatraNumber - 1] || 'Unknown';
  }

  /**
   * Convert time to decimal hours
   */
  getDecimalTime(date) {
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  }

  /**
   * Format time for display
   */
  formatTime(julianTime) {
    if (!julianTime || julianTime < 0) return 'Unknown';
    
    const hours = Math.floor(julianTime * 24);
    const minutes = Math.floor((julianTime * 24 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Convert to Nepali date (simplified)
   */
  convertToNepaliDate(date) {
    // This is a simplified conversion
    // In a real implementation, you'd use a proper Nepali calendar library
    const year = date.getFullYear() + 57; // Approximate BS year
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return {
      year,
      month,
      day,
      full: `${year}-${month}-${day}`
    };
  }
}

// Export singleton instance
export default new SwissEphemerisService();
