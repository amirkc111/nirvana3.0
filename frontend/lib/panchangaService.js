/**
 * Comprehensive Panchanga Service
 * Based on VedicJyotish repository implementation
 * Calculates Tithi, Nakshatra, Yoga, Karana, Vara using Swiss Ephemeris
 */

class PanchangaService {
  constructor() {
    this.tithiNames = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
      'Amavasya'
    ];

    this.nakshatraNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    this.nakshatraLords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
      'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury'
    ];

    this.yogaNames = [
      'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
      'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
      'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
      'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
      'Brahma', 'Indra', 'Vaidhriti'
    ];

    this.karanaNames = [
      'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija',
      'Visti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
    ];

    this.varaNames = [
      'Ravivar', 'Somavar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'
    ];
  }

  /**
   * Calculate comprehensive Panchanga for given date and location
   */
  async calculatePanchanga(datetime, longitude, latitude, altitude = 0) {
    try {
      console.log('🕉️ Calculating Panchanga...');
      
      // Convert to Julian Day
      const tjd_ut = this.getJulianDay(datetime);
      
      // Set Swiss Ephemeris flags
      const IFLAGS = window.swe.SEFLG_SWIEPH | window.swe.SEFLG_SPEED | window.swe.SEFLG_SIDEREAL;
      
      // Set sidereal mode to Lahiri
      window.swe.swe_set_sid_mode(window.swe.SE_SIDM_LAHIRI, 0, 0);
      
      // Set topocentric coordinates
      window.swe.swe_set_topo(longitude, latitude, altitude);
      
      // Get Sun and Moon positions
      const sunResult = window.swe.swe_calc_ut(tjd_ut, window.swe.SE_SUN, IFLAGS);
      const moonResult = window.swe.swe_calc_ut(tjd_ut, window.swe.SE_MOON, IFLAGS);
      
      const sunLongitude = sunResult[0];
      const moonLongitude = moonResult[0];
      
      // Calculate Panchanga elements
      const tithi = this.calculateTithi(sunLongitude, moonLongitude);
      const nakshatra = this.calculateNakshatra(moonLongitude);
      const yoga = this.calculateYoga(sunLongitude, moonLongitude);
      const karana = this.calculateKarana(sunLongitude, moonLongitude);
      const vara = this.calculateVara(datetime);
      
      // Calculate rise/set times
      const riseSetTimes = this.calculateRiseSetTimes(tjd_ut, longitude, latitude);
      
      console.log('✅ Panchanga calculated successfully');
      
      return {
        tithi,
        nakshatra,
        yoga,
        karana,
        vara,
        riseSetTimes,
        sunLongitude,
        moonLongitude,
        calculatedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ Error calculating Panchanga:', error);
      throw new Error(`Panchanga calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Tithi (Lunar Day)
   */
  calculateTithi(sunLongitude, moonLongitude) {
    const longitudeDifference = this.normalizeAngle(moonLongitude - sunLongitude);
    const tithiNumber = Math.floor(longitudeDifference / 12) + 1;
    const tithiName = this.tithiNames[tithiNumber - 1];
    const tithiDegrees = longitudeDifference % 12;
    
    return {
      number: tithiNumber,
      name: tithiName,
      degrees: tithiDegrees,
      paksha: tithiNumber <= 15 ? 'Shukla' : 'Krishna',
      isPurnima: tithiNumber === 15,
      isAmavasya: tithiNumber === 30 || tithiNumber === 0
    };
  }

  /**
   * Calculate Nakshatra (Lunar Mansion)
   */
  calculateNakshatra(moonLongitude) {
    const nakshatraNumber = Math.floor(moonLongitude / 13.333333) + 1;
    const nakshatraName = this.nakshatraNames[nakshatraNumber - 1];
    const nakshatraLord = this.nakshatraLords[nakshatraNumber - 1];
    const nakshatraDegrees = moonLongitude % 13.333333;
    
    return {
      number: nakshatraNumber,
      name: nakshatraName,
      lord: nakshatraLord,
      degrees: nakshatraDegrees,
      pada: Math.floor(nakshatraDegrees / 3.333333) + 1
    };
  }

  /**
   * Calculate Yoga (Sun + Moon combination)
   */
  calculateYoga(sunLongitude, moonLongitude) {
    const combinedLongitude = this.normalizeAngle(sunLongitude + moonLongitude);
    const yogaNumber = Math.floor(combinedLongitude / 13.333333) + 1;
    const yogaName = this.yogaNames[yogaNumber - 1];
    const yogaDegrees = combinedLongitude % 13.333333;
    
    return {
      number: yogaNumber,
      name: yogaName,
      degrees: yogaDegrees
    };
  }

  /**
   * Calculate Karana (Half Tithi)
   */
  calculateKarana(sunLongitude, moonLongitude) {
    const longitudeDifference = this.normalizeAngle(moonLongitude - sunLongitude);
    const karanaNumber = Math.floor(longitudeDifference / 6) + 1;
    const karanaName = this.karanaNames[(karanaNumber - 1) % 11];
    
    return {
      number: karanaNumber,
      name: karanaName,
      isFixed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(karanaNumber)
    };
  }

  /**
   * Calculate Vara (Weekday)
   */
  calculateVara(datetime) {
    const dayOfWeek = datetime.getDay();
    const varaName = this.varaNames[dayOfWeek];
    const varaLord = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][dayOfWeek];
    
    return {
      number: dayOfWeek + 1,
      name: varaName,
      lord: varaLord
    };
  }

  /**
   * Calculate rise/set times for Sun and Moon
   */
  calculateRiseSetTimes(tjd_ut, longitude, latitude) {
    try {
      const geopos = [longitude, latitude, 0];
      
      // Calculate Sun rise/set
      const sunRiseSet = this.calcRiseSet(tjd_ut, window.swe.SE_SUN, geopos);
      
      // Calculate Moon rise/set
      const moonRiseSet = this.calcRiseSet(tjd_ut, window.swe.SE_MOON, geopos);
      
      return {
        sun: {
          rise: sunRiseSet.rise,
          set: sunRiseSet.set
        },
        moon: {
          rise: moonRiseSet.rise,
          set: moonRiseSet.set
        }
      };
    } catch (error) {
      console.warn('⚠️ Could not calculate rise/set times:', error);
      return {
        sun: { rise: 'N/A', set: 'N/A' },
        moon: { rise: 'N/A', set: 'N/A' }
      };
    }
  }

  /**
   * Calculate rise/set times for a celestial body
   */
  calcRiseSet(tjd_ut, planetId, geopos) {
    try {
      const result = window.swe.swe_rise_trans(
        tjd_ut,
        planetId,
        '',
        window.swe.SEFLG_SWIEPH,
        window.swe.SE_CALC_RISE | window.swe.SE_CALC_SET,
        geopos,
        0,
        0,
        [0, 0, 0, 0, 0, 0]
      );
      
      return {
        rise: result[0] > 0 ? this.jdToDateTime(result[0]) : 'N/A',
        set: result[1] > 0 ? this.jdToDateTime(result[1]) : 'N/A'
      };
    } catch (error) {
      console.warn(`⚠️ Could not calculate rise/set for planet ${planetId}:`, error);
      return { rise: 'N/A', set: 'N/A' };
    }
  }

  /**
   * Convert Julian Day to DateTime
   */
  jdToDateTime(jd) {
    try {
      const result = window.swe.swe_jdut1_to_utc(jd, window.swe.SE_GREG_CAL);
      return new Date(result[0], result[1] - 1, result[2], result[3], result[4], result[5]);
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get Julian Day from DateTime
   */
  getJulianDay(datetime) {
    const year = datetime.getFullYear();
    const month = datetime.getMonth() + 1;
    const day = datetime.getDate();
    const hour = datetime.getHours();
    const minute = datetime.getMinutes();
    const second = datetime.getSeconds();
    
    const result = window.swe.swe_utc_to_jd(
      year, month, day, hour, minute, second,
      window.swe.SE_GREG_CAL
    );
    
    return result[1]; // Return Julian Day UT
  }

  /**
   * Normalize angle to 0-360 range
   */
  normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }
}

const panchangaService = new PanchangaService();
export default panchangaService;
