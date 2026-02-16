/**
 * Comprehensive Upagrahas and Kalavelas Service
 * Based on VedicJyotish repository implementation
 * Calculates Upagrahas and Kalavelas for comprehensive astrological analysis
 */

class UpagrahasService {
  constructor() {
    this.upagrahaNames = [
      'Dhuma', 'Vyatipata', 'Parivesha', 'Chapa', 'Upaketu', 
      'Gulika', 'Kaala', 'Mrityu', 'Yamaghantaka', 'Ardhaprahara'
    ];

    this.kalavelaNames = [
      'Gulika', 'Kaala', 'Mrityu', 'Yamaghantaka', 'Ardhaprahara'
    ];
  }

  /**
   * Calculate all Upagrahas and Kalavelas
   */
  calculateUpagrahasAndKalavelas(planets, birthDateTime, longitude, latitude) {
    try {
      console.log('🔮 Calculating Upagrahas and Kalavelas...');
      
      const upagrahas = {};
      const kalavelas = {};
      
      // Calculate Dhuma (Sun + 133°20')
      upagrahas.Dhuma = this.calculateDhuma(planets.Sun);
      
      // Calculate Vyatipata (360° - Dhuma)
      upagrahas.Vyatipata = this.calculateVyatipata(upagrahas.Dhuma);
      
      // Calculate Parivesha (Vyatipata + 180°)
      upagrahas.Parivesha = this.calculateParivesha(upagrahas.Vyatipata);
      
      // Calculate Chapa (360° - Parivesha)
      upagrahas.Chapa = this.calculateChapa(upagrahas.Parivesha);
      
      // Calculate Upaketu (Chapa + 16°40')
      upagrahas.Upaketu = this.calculateUpaketu(upagrahas.Chapa);
      
      // Calculate Kalavelas
      const kalavelasData = this.calculateKalavelas(birthDateTime, longitude, latitude);
      Object.assign(kalavelas, kalavelasData);
      
      console.log('✅ Upagrahas and Kalavelas calculated successfully');
      
      return {
        upagrahas,
        kalavelas,
        calculatedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ Error calculating Upagrahas and Kalavelas:', error);
      throw new Error(`Upagrahas and Kalavelas calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Dhuma (Sun + 133°20')
   */
  calculateDhuma(sunData) {
    const dhumaLongitude = (sunData.longitude + 133 + 20/60) % 360;
    const dhumaRasi = Math.floor(dhumaLongitude / 30) + 1;
    const dhumaHouse = this.getHouseFromLongitude(dhumaLongitude);
    
    return {
      name: 'Dhuma',
      longitude: dhumaLongitude,
      rasi: dhumaRasi,
      house: dhumaHouse,
      degrees: dhumaLongitude % 30,
      nakshatra: Math.floor(dhumaLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Vyatipata (360° - Dhuma)
   */
  calculateVyatipata(dhumaData) {
    const vyatipataLongitude = (360 - dhumaData.longitude) % 360;
    const vyatipataRasi = Math.floor(vyatipataLongitude / 30) + 1;
    const vyatipataHouse = this.getHouseFromLongitude(vyatipataLongitude);
    
    return {
      name: 'Vyatipata',
      longitude: vyatipataLongitude,
      rasi: vyatipataRasi,
      house: vyatipataHouse,
      degrees: vyatipataLongitude % 30,
      nakshatra: Math.floor(vyatipataLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Parivesha (Vyatipata + 180°)
   */
  calculateParivesha(vyatipataData) {
    const pariveshaLongitude = (vyatipataData.longitude + 180) % 360;
    const pariveshaRasi = Math.floor(pariveshaLongitude / 30) + 1;
    const pariveshaHouse = this.getHouseFromLongitude(pariveshaLongitude);
    
    return {
      name: 'Parivesha',
      longitude: pariveshaLongitude,
      rasi: pariveshaRasi,
      house: pariveshaHouse,
      degrees: pariveshaLongitude % 30,
      nakshatra: Math.floor(pariveshaLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Chapa (360° - Parivesha)
   */
  calculateChapa(pariveshaData) {
    const chapaLongitude = (360 - pariveshaData.longitude) % 360;
    const chapaRasi = Math.floor(chapaLongitude / 30) + 1;
    const chapaHouse = this.getHouseFromLongitude(chapaLongitude);
    
    return {
      name: 'Chapa',
      longitude: chapaLongitude,
      rasi: chapaRasi,
      house: chapaHouse,
      degrees: chapaLongitude % 30,
      nakshatra: Math.floor(chapaLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Upaketu (Chapa + 16°40')
   */
  calculateUpaketu(chapaData) {
    const upaketuLongitude = (chapaData.longitude + 16 + 40/60) % 360;
    const upaketuRasi = Math.floor(upaketuLongitude / 30) + 1;
    const upaketuHouse = this.getHouseFromLongitude(upaketuLongitude);
    
    return {
      name: 'Upaketu',
      longitude: upaketuLongitude,
      rasi: upaketuRasi,
      house: upaketuHouse,
      degrees: upaketuLongitude % 30,
      nakshatra: Math.floor(upaketuLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Kalavelas (Time-based calculations)
   */
  calculateKalavelas(birthDateTime, longitude, latitude) {
    const kalavelas = {};
    
    // Calculate Gulika (Saturday's Gulika)
    kalavelas.Gulika = this.calculateGulika(birthDateTime, longitude, latitude);
    
    // Calculate Kaala (Time of day)
    kalavelas.Kaala = this.calculateKaala(birthDateTime);
    
    // Calculate Mrityu (Death-related)
    kalavelas.Mrityu = this.calculateMrityu(birthDateTime);
    
    // Calculate Yamaghantaka (Yama's bell)
    kalavelas.Yamaghantaka = this.calculateYamaghantaka(birthDateTime);
    
    // Calculate Ardhaprahara (Half-prahar)
    kalavelas.Ardhaprahara = this.calculateArdhaprahara(birthDateTime);
    
    return kalavelas;
  }

  /**
   * Calculate Gulika (Saturday's Gulika)
   */
  calculateGulika(birthDateTime, longitude, latitude) {
    // Gulika is calculated based on Saturday's position
    const dayOfWeek = birthDateTime.getDay();
    const gulikaLongitude = this.calculateGulikaLongitude(dayOfWeek, longitude, latitude);
    const gulikaRasi = Math.floor(gulikaLongitude / 30) + 1;
    const gulikaHouse = this.getHouseFromLongitude(gulikaLongitude);
    
    return {
      name: 'Gulika',
      longitude: gulikaLongitude,
      rasi: gulikaRasi,
      house: gulikaHouse,
      degrees: gulikaLongitude % 30,
      nakshatra: Math.floor(gulikaLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Gulika longitude based on day of week
   */
  calculateGulikaLongitude(dayOfWeek, longitude, latitude) {
    // Simplified calculation - in practice, this would use more complex algorithms
    const baseLongitude = longitude + (dayOfWeek * 30);
    return baseLongitude % 360;
  }

  /**
   * Calculate Kaala (Time of day)
   */
  calculateKaala(birthDateTime) {
    const hour = birthDateTime.getHours();
    const minute = birthDateTime.getMinutes();
    const totalMinutes = hour * 60 + minute;
    
    // Kaala is calculated based on time of day
    const kaalaLongitude = (totalMinutes / 4) % 360; // 4 minutes per degree
    const kaalaRasi = Math.floor(kaalaLongitude / 30) + 1;
    const kaalaHouse = this.getHouseFromLongitude(kaalaLongitude);
    
    return {
      name: 'Kaala',
      longitude: kaalaLongitude,
      rasi: kaalaRasi,
      house: kaalaHouse,
      degrees: kaalaLongitude % 30,
      nakshatra: Math.floor(kaalaLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Mrityu (Death-related)
   */
  calculateMrityu(birthDateTime) {
    const dayOfYear = Math.floor((birthDateTime - new Date(birthDateTime.getFullYear(), 0, 0)) / 86400000);
    const mrityuLongitude = (dayOfYear * 0.9856) % 360; // Approximate daily motion
    const mrityuRasi = Math.floor(mrityuLongitude / 30) + 1;
    const mrityuHouse = this.getHouseFromLongitude(mrityuLongitude);
    
    return {
      name: 'Mrityu',
      longitude: mrityuLongitude,
      rasi: mrityuRasi,
      house: mrityuHouse,
      degrees: mrityuLongitude % 30,
      nakshatra: Math.floor(mrityuLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Yamaghantaka (Yama's bell)
   */
  calculateYamaghantaka(birthDateTime) {
    const hour = birthDateTime.getHours();
    const yamaghantakaLongitude = (hour * 15) % 360; // 15 degrees per hour
    const yamaghantakaRasi = Math.floor(yamaghantakaLongitude / 30) + 1;
    const yamaghantakaHouse = this.getHouseFromLongitude(yamaghantakaLongitude);
    
    return {
      name: 'Yamaghantaka',
      longitude: yamaghantakaLongitude,
      rasi: yamaghantakaRasi,
      house: yamaghantakaHouse,
      degrees: yamaghantakaLongitude % 30,
      nakshatra: Math.floor(yamaghantakaLongitude / 13.333333) + 1
    };
  }

  /**
   * Calculate Ardhaprahara (Half-prahar)
   */
  calculateArdhaprahara(birthDateTime) {
    const hour = birthDateTime.getHours();
    const minute = birthDateTime.getMinutes();
    const totalMinutes = hour * 60 + minute;
    
    // Ardhaprahara is calculated based on half-prahar
    const ardhapraharaLongitude = (totalMinutes / 2) % 360; // 2 minutes per degree
    const ardhapraharaRasi = Math.floor(ardhapraharaLongitude / 30) + 1;
    const ardhapraharaHouse = this.getHouseFromLongitude(ardhapraharaLongitude);
    
    return {
      name: 'Ardhaprahara',
      longitude: ardhapraharaLongitude,
      rasi: ardhapraharaRasi,
      house: ardhapraharaHouse,
      degrees: ardhapraharaLongitude % 30,
      nakshatra: Math.floor(ardhapraharaLongitude / 13.333333) + 1
    };
  }

  /**
   * Get house from longitude
   */
  getHouseFromLongitude(longitude) {
    // Simplified house calculation - in practice, this would use proper house systems
    return Math.floor(longitude / 30) + 1;
  }

  /**
   * Generate Upagrahas predictions
   */
  generateUpagrahasPredictions(upagrahas) {
    const predictions = [];
    
    Object.entries(upagrahas).forEach(([name, data]) => {
      const house = data.house;
      const rasi = data.rasi;
      
      predictions.push({
        condition: `${name} ${this.getHouseName(house)} में`,
        interpretation: `${name} के ${this.getHouseName(house)} में स्थित होने के प्रभाव से व्यक्ति के जीवन में विशेष परिणाम प्राप्त होते हैं।`
      });
    });
    
    return predictions;
  }

  /**
   * Generate Kalavelas predictions
   */
  generateKalavelasPredictions(kalavelas) {
    const predictions = [];
    
    Object.entries(kalavelas).forEach(([name, data]) => {
      const house = data.house;
      const rasi = data.rasi;
      
      predictions.push({
        condition: `${name} ${this.getHouseName(house)} में`,
        interpretation: `${name} के ${this.getHouseName(house)} में स्थित होने के प्रभाव से व्यक्ति के जीवन में विशेष परिणाम प्राप्त होते हैं।`
      });
    });
    
    return predictions;
  }

  /**
   * Get house name
   */
  getHouseName(houseNumber) {
    const houseNames = [
      'प्रथम भाव', 'द्वितीय भाव', 'तृतीय भाव', 'चतुर्थ भाव', 'पंचम भाव', 'षष्ठ भाव',
      'सप्तम भाव', 'अष्टम भाव', 'नवम भाव', 'दशम भाव', 'एकादश भाव', 'द्वादश भाव'
    ];
    
    return houseNames[houseNumber - 1] || `भाव ${houseNumber}`;
  }
}

const upagrahasService = new UpagrahasService();
export default upagrahasService;
