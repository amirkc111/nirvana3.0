/**
 * Comprehensive Vimsottari Dasha Service
 * Based on VedicJyotish repository implementation
 * Calculates Vimsottari Dasha periods using Moon's Nakshatra
 */

class VimsottariDashaService {
  constructor() {
    this.dashaDurations = {
      'Sun': 6,
      'Moon': 10,
      'Mars': 7,
      'Rahu': 18,
      'Jupiter': 16,
      'Saturn': 19,
      'Mercury': 17,
      'Ketu': 7,
      'Venus': 20
    };

    this.dashaOrder = [
      'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'
    ];

    this.planetNames = {
      'Sun': 'सूर्य',
      'Moon': 'चंद्र',
      'Mars': 'मंगल',
      'Rahu': 'राहु',
      'Jupiter': 'गुरु',
      'Saturn': 'शनि',
      'Mercury': 'बुध',
      'Ketu': 'केतु',
      'Venus': 'शुक्र'
    };
  }

  /**
   * Calculate Vimsottari Dasha periods
   */
  calculateVimsottariDasha(birthDateTime, moonNakshatra, moonLongitude) {
    try {
      console.log('🕉️ Calculating Vimsottari Dasha...');
      
      // Calculate total degrees in nakshatra (360/27 = 13.333333)
      const degreesPerNakshatra = 360 / 27;
      
      // Calculate remaining degrees in current nakshatra
      const remainingDegrees = degreesPerNakshatra - (moonLongitude % degreesPerNakshatra);
      
      // Calculate remaining time in current dasha
      const currentDashaLord = this.getNakshatraLord(moonNakshatra);
      const totalDashaDuration = this.dashaDurations[currentDashaLord];
      const remainingTime = (remainingDegrees / degreesPerNakshatra) * totalDashaDuration;
      
      // Calculate start date of current dasha
      const startDate = new Date(birthDateTime);
      startDate.setFullYear(startDate.getFullYear() - remainingTime);
      
      // Calculate all dasha periods
      const dashaPeriods = this.calculateAllDashaPeriods(startDate, currentDashaLord);
      
      console.log('✅ Vimsottari Dasha calculated successfully');
      
      return {
        currentDasha: dashaPeriods[0],
        allDashas: dashaPeriods,
        calculatedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ Error calculating Vimsottari Dasha:', error);
      throw new Error(`Vimsottari Dasha calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate all dasha periods
   */
  calculateAllDashaPeriods(startDate, currentDashaLord) {
    const dashas = [];
    let currentDate = new Date(startDate);
    
    // Find current dasha index
    const currentIndex = this.dashaOrder.indexOf(currentDashaLord);
    
    // Calculate all 9 dasha periods
    for (let i = 0; i < 9; i++) {
      const dashaIndex = (currentIndex + i) % 9;
      const dashaLord = this.dashaOrder[dashaIndex];
      const duration = this.dashaDurations[dashaLord];
      
      const startDateTime = new Date(currentDate);
      const endDateTime = new Date(currentDate);
      endDateTime.setFullYear(endDateTime.getFullYear() + duration);
      
      dashas.push({
        lord: dashaLord,
        lordHindi: this.planetNames[dashaLord],
        duration: duration,
        startDate: startDateTime,
        endDate: endDateTime,
        isCurrent: i === 0
      });
      
      currentDate = new Date(endDateTime);
    }
    
    return dashas;
  }

  /**
   * Get nakshatra lord
   */
  getNakshatraLord(nakshatraNumber) {
    const nakshatraLords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
      'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
      'Jupiter', 'Saturn', 'Mercury'
    ];
    
    return nakshatraLords[nakshatraNumber - 1];
  }

  /**
   * Generate Dasha predictions
   */
  generateDashaPredictions(dashaLord) {
    const predictions = {
      'Sun': {
        title: 'सूर्य दास प्रभाव',
        effects: [
          'सूर्य दास के दौरान व्यक्ति को सम्मान, प्रतिष्ठा और नेतृत्व क्षमता प्राप्त होती है।',
          'इस अवधि में व्यक्ति को सरकारी कार्यों में सफलता मिल सकती है।',
          'सूर्य के प्रभाव से व्यक्ति का स्वास्थ्य और ऊर्जा स्तर बेहतर होता है।',
          'इस दास में व्यक्ति को पिता से सहयोग और मार्गदर्शन मिलता है।'
        ]
      },
      'Moon': {
        title: 'चंद्र दास प्रभाव',
        effects: [
          'चंद्र दास के दौरान व्यक्ति की भावनाएं और मन की स्थिति प्रभावित होती है।',
          'इस अवधि में व्यक्ति को माता से सहयोग और स्नेह मिलता है।',
          'चंद्र के प्रभाव से व्यक्ति की कल्पनाशीलता और रचनात्मकता बढ़ती है।',
          'इस दास में व्यक्ति को जल से संबंधित कार्यों में सफलता मिल सकती है।'
        ]
      },
      'Mars': {
        title: 'मंगल दास प्रभाव',
        effects: [
          'मंगल दास के दौरान व्यक्ति को साहस, ऊर्जा और नेतृत्व क्षमता प्राप्त होती है।',
          'इस अवधि में व्यक्ति को भाई-बहनों से सहयोग मिलता है।',
          'मंगल के प्रभाव से व्यक्ति की कार्यक्षमता और दृढ़ता बढ़ती है।',
          'इस दास में व्यक्ति को युद्ध, खेल या तकनीकी क्षेत्रों में सफलता मिल सकती है।'
        ]
      },
      'Rahu': {
        title: 'राहु दास प्रभाव',
        effects: [
          'राहु दास के दौरान व्यक्ति को विदेशी संबंधों और तकनीकी क्षेत्रों में सफलता मिल सकती है।',
          'इस अवधि में व्यक्ति की मानसिक स्थिति में उतार-चढ़ाव हो सकता है।',
          'राहु के प्रभाव से व्यक्ति को अप्रत्याशित लाभ और हानि दोनों का सामना करना पड़ सकता है।',
          'इस दास में व्यक्ति को अपने कार्यों में सावधानी बरतनी चाहिए और धर्म-कर्म पर विशेष ध्यान देना चाहिए।'
        ]
      },
      'Jupiter': {
        title: 'गुरु दास प्रभाव',
        effects: [
          'गुरु दास के दौरान व्यक्ति को ज्ञान, शिक्षा और आध्यात्मिकता में सफलता मिलती है।',
          'इस अवधि में व्यक्ति को गुरु, शिक्षक या आध्यात्मिक गुरु से मार्गदर्शन मिलता है।',
          'गुरु के प्रभाव से व्यक्ति की बुद्धि और विवेक बढ़ता है।',
          'इस दास में व्यक्ति को धर्म, दान और सेवा के कार्यों में सफलता मिल सकती है।'
        ]
      },
      'Saturn': {
        title: 'शनि दास प्रभाव',
        effects: [
          'शनि दास के दौरान व्यक्ति को कठिन परिश्रम और धैर्य की आवश्यकता होती है।',
          'इस अवधि में व्यक्ति को अपने कर्मों का फल मिलता है।',
          'शनि के प्रभाव से व्यक्ति की जिम्मेदारी और अनुशासन बढ़ता है।',
          'इस दास में व्यक्ति को दीर्घकालिक लक्ष्यों की प्राप्ति में सफलता मिल सकती है।'
        ]
      },
      'Mercury': {
        title: 'बुध दास प्रभाव',
        effects: [
          'बुध दास के दौरान व्यक्ति को बुद्धि, संचार और व्यापार में सफलता मिलती है।',
          'इस अवधि में व्यक्ति को शिक्षा, लेखन और मीडिया क्षेत्रों में सफलता मिल सकती है।',
          'बुध के प्रभाव से व्यक्ति की बुद्धि और तर्कशक्ति बढ़ती है।',
          'इस दास में व्यक्ति को संचार और तकनीकी क्षेत्रों में सफलता मिल सकती है।'
        ]
      },
      'Ketu': {
        title: 'केतु दास प्रभाव',
        effects: [
          'केतु दास के दौरान व्यक्ति को आध्यात्मिकता और मोक्ष की ओर रुचि बढ़ती है।',
          'इस अवधि में व्यक्ति को गुप्त कार्यों और शोध में सफलता मिल सकती है।',
          'केतु के प्रभाव से व्यक्ति की आध्यात्मिक जागृति होती है।',
          'इस दास में व्यक्ति को अपने अतीत के कर्मों का फल मिलता है।'
        ]
      },
      'Venus': {
        title: 'शुक्र दास प्रभाव',
        effects: [
          'शुक्र दास के दौरान व्यक्ति को कला, सौंदर्य और सुख-सुविधाओं में सफलता मिलती है।',
          'इस अवधि में व्यक्ति को विवाह, प्रेम और साथी से सुख मिलता है।',
          'शुक्र के प्रभाव से व्यक्ति की कलात्मक क्षमता और सौंदर्य बोध बढ़ता है।',
          'इस दास में व्यक्ति को धन, सुख-सुविधाओं और भोग-विलास में सफलता मिल सकती है।'
        ]
      }
    };
    
    return predictions[dashaLord] || {
      title: `${dashaLord} दास प्रभाव`,
      effects: [`${dashaLord} दास के प्रभावों का विश्लेषण किया जा रहा है।`]
    };
  }

  /**
   * Calculate Antar Dasha (Sub-period)
   */
  calculateAntarDasha(mahaDasha, antarDashaLord) {
    const mahaDuration = mahaDasha.duration;
    const antarDuration = this.dashaDurations[antarDashaLord];
    
    // Antar dasha duration = (Maha dasha duration * Antar dasha duration) / 120
    const antarDashaDuration = (mahaDuration * antarDuration) / 120;
    
    const startDate = new Date(mahaDasha.startDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + antarDashaDuration);
    
    return {
      lord: antarDashaLord,
      lordHindi: this.planetNames[antarDashaLord],
      duration: antarDashaDuration,
      startDate: startDate,
      endDate: endDate,
      parentDasha: mahaDasha.lord
    };
  }

  /**
   * Generate comprehensive Dasha report
   */
  generateDashaReport(dashaData) {
    const report = {
      currentDasha: dashaData.currentDasha,
      predictions: this.generateDashaPredictions(dashaData.currentDasha.lord),
      allDashas: dashaData.allDashas.map(dasha => ({
        ...dasha,
        predictions: this.generateDashaPredictions(dasha.lord)
      }))
    };
    
    return report;
  }
}

const vimsottariDashaService = new VimsottariDashaService();
export default vimsottariDashaService;
