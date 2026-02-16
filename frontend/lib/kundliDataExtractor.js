// Kundli Data Extractor - Extracts all data from VedicJyotish page and saves to database

export const extractKundliDataFromPage = () => {
  const kundliData = {
    basicDetails: {},
    planetaryPositions: {},
    yogaPhala: {},
    vimsottariDasha: {},
    birthChart: {},
    analysis: {}
  };

  try {
    // Extract basic birth details
    const nameElement = document.querySelector('h1, .name, [data-name]');
    const dateElement = document.querySelector('.date, [data-date]');
    const timeElement = document.querySelector('.time, [data-time]');
    const locationElement = document.querySelector('.location, [data-location]');

    kundliData.basicDetails = {
      name: nameElement?.textContent?.trim() || '',
      date: dateElement?.textContent?.trim() || '',
      time: timeElement?.textContent?.trim() || '',
      location: locationElement?.textContent?.trim() || ''
    };

    // Extract planetary positions
    const planetElements = document.querySelectorAll('.planet, .planet-info, [data-planet]');
    kundliData.planetaryPositions = {};
    
    planetElements.forEach(planet => {
      const planetName = planet.querySelector('.planet-name, [data-planet-name]')?.textContent?.trim();
      const position = planet.querySelector('.position, [data-position]')?.textContent?.trim();
      const sign = planet.querySelector('.sign, [data-sign]')?.textContent?.trim();
      const degree = planet.querySelector('.degree, [data-degree]')?.textContent?.trim();
      
      if (planetName) {
        kundliData.planetaryPositions[planetName.toLowerCase()] = {
          position,
          sign,
          degree
        };
      }
    });

    // Extract Yoga Phala data
    const yogaElements = document.querySelectorAll('.yoga, .yoga-item, [data-yoga]');
    kundliData.yogaPhala = [];
    
    yogaElements.forEach(yoga => {
      const yogaName = yoga.querySelector('.yoga-name, [data-yoga-name]')?.textContent?.trim();
      const yogaDescription = yoga.querySelector('.yoga-description, [data-yoga-desc]')?.textContent?.trim();
      const yogaEffect = yoga.querySelector('.yoga-effect, [data-yoga-effect]')?.textContent?.trim();
      
      if (yogaName) {
        kundliData.yogaPhala.push({
          name: yogaName,
          description: yogaDescription,
          effect: yogaEffect
        });
      }
    });

    // Extract Vimsottari Dasha data
    const dashaElements = document.querySelectorAll('.dasha, .dasha-item, [data-dasha]');
    kundliData.vimsottariDasha = [];
    
    dashaElements.forEach(dasha => {
      const planet = dasha.querySelector('.dasha-planet, [data-dasha-planet]')?.textContent?.trim();
      const period = dasha.querySelector('.dasha-period, [data-dasha-period]')?.textContent?.trim();
      const startDate = dasha.querySelector('.dasha-start, [data-dasha-start]')?.textContent?.trim();
      const endDate = dasha.querySelector('.dasha-end, [data-dasha-end]')?.textContent?.trim();
      
      if (planet) {
        kundliData.vimsottariDasha.push({
          planet,
          period,
          startDate,
          endDate
        });
      }
    });

    // Extract all divisional charts (D-charts)
    kundliData.divisionalCharts = {
      rashi: {},           // D-1: Main birth chart
      navamsa: {},         // D-9: 9th divisional chart
      dasamsa: {},         // D-10: 10th divisional chart (career)
      dwadasamsa: {},      // D-12: 12th divisional chart (parents)
      shodasamsa: {},     // D-16: 16th divisional chart (vehicles)
      vimsamsa: {},        // D-20: 20th divisional chart (spiritual)
      chaturvimsamsa: {},  // D-24: 24th divisional chart (education)
      bhamsa: {},          // D-27: 27th divisional chart (strength)
      trimsamsa: {},      // D-30: 30th divisional chart (evils)
      khavedamsa: {},     // D-40: 40th divisional chart (maternal)
      akshavedamsa: {},   // D-45: 45th divisional chart (paternal)
      shashtyamsa: {}      // D-60: 60th divisional chart (past life)
    };

    // Extract Rashi Chart (D-1) - Main birth chart
    const rashiElements = document.querySelectorAll('.rashi-chart, .birth-chart, [data-rashi]');
    rashiElements.forEach(element => {
      const houses = element.querySelectorAll('.house, [data-house]');
      houses.forEach(house => {
        const houseNumber = house.querySelector('.house-number, [data-house-number]')?.textContent?.trim();
        const planets = house.querySelectorAll('.planet, [data-planet]');
        const planetData = Array.from(planets).map(planet => ({
          name: planet.querySelector('.planet-name, [data-planet-name]')?.textContent?.trim(),
          degree: planet.querySelector('.degree, [data-degree]')?.textContent?.trim(),
          sign: planet.querySelector('.sign, [data-sign]')?.textContent?.trim()
        }));
        
        if (houseNumber) {
          kundliData.divisionalCharts.rashi[`house_${houseNumber}`] = {
            planets: planetData,
            sign: house.querySelector('.sign, [data-sign]')?.textContent?.trim()
          };
        }
      });
    });

    // Extract Navamsa Chart (D-9)
    const navamsaElements = document.querySelectorAll('.navamsa-chart, [data-navamsa]');
    navamsaElements.forEach(element => {
      const houses = element.querySelectorAll('.house, [data-house]');
      houses.forEach(house => {
        const houseNumber = house.querySelector('.house-number, [data-house-number]')?.textContent?.trim();
        const planets = house.querySelectorAll('.planet, [data-planet]');
        const planetData = Array.from(planets).map(planet => ({
          name: planet.querySelector('.planet-name, [data-planet-name]')?.textContent?.trim(),
          degree: planet.querySelector('.degree, [data-degree]')?.textContent?.trim(),
          sign: planet.querySelector('.sign, [data-sign]')?.textContent?.trim()
        }));
        
        if (houseNumber) {
          kundliData.divisionalCharts.navamsa[`house_${houseNumber}`] = {
            planets: planetData,
            sign: house.querySelector('.sign, [data-sign]')?.textContent?.trim()
          };
        }
      });
    });

    // Extract Dasamsa Chart (D-10) - Career chart
    const dasamsaElements = document.querySelectorAll('.dasamsa-chart, [data-dasamsa]');
    dasamsaElements.forEach(element => {
      const houses = element.querySelectorAll('.house, [data-house]');
      houses.forEach(house => {
        const houseNumber = house.querySelector('.house-number, [data-house-number]')?.textContent?.trim();
        const planets = house.querySelectorAll('.planet, [data-planet]');
        const planetData = Array.from(planets).map(planet => ({
          name: planet.querySelector('.planet-name, [data-planet-name]')?.textContent?.trim(),
          degree: planet.querySelector('.degree, [data-degree]')?.textContent?.trim(),
          sign: planet.querySelector('.sign, [data-sign]')?.textContent?.trim()
        }));
        
        if (houseNumber) {
          kundliData.divisionalCharts.dasamsa[`house_${houseNumber}`] = {
            planets: planetData,
            sign: house.querySelector('.sign, [data-sign]')?.textContent?.trim()
          };
        }
      });
    });

    // Extract other divisional charts
    const chartTypes = [
      { key: 'dwadasamsa', selector: '.dwadasamsa-chart, [data-dwadasamsa]' },
      { key: 'shodasamsa', selector: '.shodasamsa-chart, [data-shodasamsa]' },
      { key: 'vimsamsa', selector: '.vimsamsa-chart, [data-vimsamsa]' },
      { key: 'chaturvimsamsa', selector: '.chaturvimsamsa-chart, [data-chaturvimsamsa]' },
      { key: 'bhamsa', selector: '.bhamsa-chart, [data-bhamsa]' },
      { key: 'trimsamsa', selector: '.trimsamsa-chart, [data-trimsamsa]' },
      { key: 'khavedamsa', selector: '.khavedamsa-chart, [data-khavedamsa]' },
      { key: 'akshavedamsa', selector: '.akshavedamsa-chart, [data-akshavedamsa]' },
      { key: 'shashtyamsa', selector: '.shashtyamsa-chart, [data-shashtyamsa]' }
    ];

    chartTypes.forEach(chartType => {
      const elements = document.querySelectorAll(chartType.selector);
      elements.forEach(element => {
        const houses = element.querySelectorAll('.house, [data-house]');
        houses.forEach(house => {
          const houseNumber = house.querySelector('.house-number, [data-house-number]')?.textContent?.trim();
          const planets = house.querySelectorAll('.planet, [data-planet]');
          const planetData = Array.from(planets).map(planet => ({
            name: planet.querySelector('.planet-name, [data-planet-name]')?.textContent?.trim(),
            degree: planet.querySelector('.degree, [data-degree]')?.textContent?.trim(),
            sign: planet.querySelector('.sign, [data-sign]')?.textContent?.trim()
          }));
          
          if (houseNumber) {
            kundliData.divisionalCharts[chartType.key][`house_${houseNumber}`] = {
              planets: planetData,
              sign: house.querySelector('.sign, [data-sign]')?.textContent?.trim()
            };
          }
        });
      });
    });

    // Extract chart calculations and metadata
    kundliData.chartCalculations = {
      ayanamsa: document.querySelector('.ayanamsa, [data-ayanamsa]')?.textContent?.trim(),
      siderealTime: document.querySelector('.sidereal-time, [data-sidereal-time]')?.textContent?.trim(),
      localTime: document.querySelector('.local-time, [data-local-time]')?.textContent?.trim(),
      utcTime: document.querySelector('.utc-time, [data-utc-time]')?.textContent?.trim(),
      timezone: document.querySelector('.timezone, [data-timezone]')?.textContent?.trim()
    };

    // Extract chart images/paths
    kundliData.chartImages = {
      rashiImage: document.querySelector('.rashi-chart img, [data-rashi-image]')?.src,
      navamsaImage: document.querySelector('.navamsa-chart img, [data-navamsa-image]')?.src,
      dasamsaImage: document.querySelector('.dasamsa-chart img, [data-dasamsa-image]')?.src,
      dwadasamsaImage: document.querySelector('.dwadasamsa-chart img, [data-dwadasamsa-image]')?.src,
      shodasamsaImage: document.querySelector('.shodasamsa-chart img, [data-shodasamsa-image]')?.src,
      vimsamsaImage: document.querySelector('.vimsamsa-chart img, [data-vimsamsa-image]')?.src
    };

    // Extract analysis data
    const analysisElements = document.querySelectorAll('.analysis, .analysis-item, [data-analysis]');
    kundliData.analysis = [];
    
    analysisElements.forEach(analysis => {
      const analysisType = analysis.querySelector('.analysis-type, [data-analysis-type]')?.textContent?.trim();
      const analysisContent = analysis.querySelector('.analysis-content, [data-analysis-content]')?.textContent?.trim();
      
      if (analysisType) {
        kundliData.analysis.push({
          type: analysisType,
          content: analysisContent
        });
      }
    });

    // Extract from URL parameters as fallback
    const urlParams = new URLSearchParams(window.location.search);
    if (!kundliData.basicDetails.name) {
      kundliData.basicDetails.name = urlParams.get('name') || '';
    }
    if (!kundliData.basicDetails.date) {
      kundliData.basicDetails.date = urlParams.get('date') || '';
    }
    if (!kundliData.basicDetails.time) {
      kundliData.basicDetails.time = urlParams.get('time') || '';
    }
    if (!kundliData.basicDetails.location) {
      kundliData.basicDetails.location = urlParams.get('city') || '';
    }

    console.log('Extracted Kundli data:', kundliData);
    return kundliData;

  } catch (error) {
    console.error('Error extracting Kundli data:', error);
    return null;
  }
};

export const saveKundliToDatabase = async (kundliData) => {
  try {
    const response = await fetch('/api/save-kundli', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: kundliData.basicDetails.name,
        date: kundliData.basicDetails.date,
        time: kundliData.basicDetails.time,
        lat: new URLSearchParams(window.location.search).get('lat') || '',
        lon: new URLSearchParams(window.location.search).get('lon') || '',
        tznm: new URLSearchParams(window.location.search).get('tznm') || '',
        city: kundliData.basicDetails.location,
        kundliData: kundliData,
        planetaryPositions: kundliData.planetaryPositions,
        yogaPhala: kundliData.yogaPhala,
        vimsottariDasha: kundliData.vimsottariDasha,
        birthChart: kundliData.birthChart,
        analysis: kundliData.analysis,
        divisionalCharts: kundliData.divisionalCharts,
        chartCalculations: kundliData.chartCalculations,
        chartImages: kundliData.chartImages
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Kundli data saved successfully:', result);
      return { success: true, data: result };
    } else {
      console.error('Failed to save Kundli data:', result);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error saving Kundli data:', error);
    return { success: false, error: error.message };
  }
};

export const extractAndSaveKundli = async () => {
  try {
    console.log('Starting Kundli data extraction and save...');
    
    // Extract data from page
    const kundliData = extractKundliDataFromPage();
    
    if (!kundliData) {
      throw new Error('Failed to extract Kundli data from page');
    }

    // Save to database
    const saveResult = await saveKundliToDatabase(kundliData);
    
    if (saveResult.success) {
      console.log('Kundli data successfully extracted and saved!');
      return { success: true, message: 'Kundli data saved successfully!' };
    } else {
      throw new Error(saveResult.error || 'Failed to save Kundli data');
    }
  } catch (error) {
    console.error('Error in extractAndSaveKundli:', error);
    return { success: false, error: error.message };
  }
};
