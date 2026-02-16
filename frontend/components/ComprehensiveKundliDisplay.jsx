"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import PanchangaService from '../lib/panchangaService.js';
import YogPhalaService from '../lib/yogPhalaService.js';
import VimsottariDashaService from '../lib/vimsottariDashaService.js';
import UpagrahasService from '../lib/upagrahasService.js';

// Kundali chart renderer will be loaded dynamically

// Rashi names for chart display
const rashiNames = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

// Make rashiNames available globally for KundaliSVG
if (typeof window !== 'undefined') {
  window.rashiNames = rashiNames;
  console.log('✅ rashiNames exposed to global scope');
}

export default function ComprehensiveKundliDisplay({ birthData, onClose }) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swissephLoaded, setSwissephLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [chartData, setChartData] = useState(null);
  const [kundaliChart, setKundaliChart] = useState(null);
  const [d2Chart, setD2Chart] = useState(null);
  const [d6Chart, setD6Chart] = useState(null);
  const [d8Chart, setD8Chart] = useState(null);
  const [d9Chart, setD9Chart] = useState(null);
  const [d12Chart, setD12Chart] = useState(null);

  // Initialize Swiss Ephemeris WebAssembly
  useEffect(() => {
    const initializeSwissEphemeris = async () => {
      try {
        console.log('🔄 Initializing Swiss Ephemeris...');
        
        // Import Swiss Ephemeris WebAssembly (VedicJyotish approach)
        const SwissEPH = await import('sweph-wasm');
        console.log('📦 SwissEPH imported:', SwissEPH);
        
        // Initialize Swiss Ephemeris with correct method
        console.log('🔄 Initializing Swiss Ephemeris with path: /swisseph/assets/swisseph.wasm');
        window.swe = await SwissEPH.default.init('/swisseph/assets/swisseph.wasm');
        console.log('🔧 Swiss Ephemeris initialized:', window.swe);
        console.log('🔧 Swiss Ephemeris methods available:', Object.keys(window.swe));
        
        // Set ephemeris data path
        try {
          await window.swe.swe_set_ephe_path('/swisseph/assets/ephe', [
            'seas_18.se1',
            'sepl_18.se1', 
            'semo_18.se1',
            'sefstars.txt'
          ]);
          console.log('📁 Ephemeris data path set');
        } catch (epheError) {
          console.warn('⚠️ Could not set ephemeris path, continuing with default:', epheError);
        }
        
        setSwissephLoaded(true);
        console.log('✅ Swiss Ephemeris loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load Swiss Ephemeris:', err);
      setError(`Failed to load astronomical calculation engine: ${err.message}`);
      
      // Create fallback test data for debugging
      console.log('🧪 Creating fallback test data...');
      const testData = {
        name: birthData?.name || 'Test User',
        birthData: { datetime: new Date(), longitude: 85.3240, latitude: 27.7172, altitude: 0 },
        planets: {
          'Sun': { longitude: 45.5, speed: 1.0, rasi: 2 },
          'Moon': { longitude: 120.3, speed: 13.0, rasi: 4 },
          'Mars': { longitude: 200.7, speed: 0.5, rasi: 7 },
          'Mercury': { longitude: 60.2, speed: 1.2, rasi: 2 },
          'Jupiter': { longitude: 300.1, speed: 0.1, rasi: 10 },
          'Venus': { longitude: 80.9, speed: 1.1, rasi: 3 },
          'Saturn': { longitude: 250.4, speed: 0.05, rasi: 9 },
          'Ascendant': { longitude: 24.82, speed: 0, rasi: 1 }
        },
        houses: [24.82, 54.82, 84.82, 114.82, 144.82, 174.82, 204.82, 234.82, 264.82, 294.82, 324.82, 354.82],
        ascendant: 24.82,
        d9Data: {},
        d12Data: {},
        generatedAt: new Date()
      };
      
      console.log('📊 Setting fallback test data:', testData);
      setKundliData(testData);
      setChartData(generateChartData(testData));
    }
    };

    initializeSwissEphemeris();
  }, []);

  // Generate comprehensive Kundli data
  const generateKundli = async () => {
    if (!swissephLoaded || !window.swe) {
      console.log('❌ Swiss Ephemeris not loaded');
      setError('Swiss Ephemeris not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 ComprehensiveKundliDisplay - birthData received:', birthData);
      
      // Validate required fields
      if (!birthData.birthYear || !birthData.birthMonth || !birthData.birthDay) {
        throw new Error('Missing required birth date information');
      }
      
      if (!birthData.latitude || !birthData.longitude) {
        console.warn('⚠️ Missing coordinates, using default Kathmandu location');
      }
      
      const birthDateTime = new Date(
        birthData.birthYear,
        birthData.birthMonth - 1,
        birthData.birthDay,
        birthData.birthHour || 12,
        birthData.birthMinute || 0,
        birthData.birthSecond || 0
      );
      
      console.log('📅 Calculated birthDateTime:', birthDateTime);

      const kundliResult = await calculateComprehensiveKundli({
        datetime: birthDateTime,
        longitude: parseFloat(birthData.longitude),
        latitude: parseFloat(birthData.latitude),
        altitude: 0,
        name: birthData.name
      });

      console.log('📊 Setting Kundli data:', kundliResult);
      setKundliData(kundliResult);
      setChartData(generateChartData(kundliResult));
      console.log('✅ Kundli data set successfully');
    } catch (err) {
      console.error('❌ Kundli generation failed:', err);
      setError('Failed to generate Kundli. Please check your birth details.');
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive Kundli calculation
  const calculateComprehensiveKundli = async (params) => {
    try {
      const { datetime, longitude, latitude, altitude, name } = params;
      
      console.log('🔍 Kundli calculation params:', { datetime, longitude, latitude, altitude, name });
      
      // Set sidereal mode (Lahiri Ayanamsa)
      window.swe.swe_set_sid_mode(window.swe.SE_SIDM_LAHIRI, 0, 0);
      window.swe.swe_set_topo(longitude, latitude, altitude);
      
      const utc_dt = new Date(datetime);
      console.log('📅 UTC datetime:', utc_dt);
      
      const tjd_ut = window.swe.swe_utc_to_jd(
        utc_dt.getUTCFullYear(),
        utc_dt.getUTCMonth() + 1,
        utc_dt.getUTCDate(),
        utc_dt.getUTCHours(),
        utc_dt.getUTCMinutes(),
        utc_dt.getUTCSeconds(),
        window.swe.SE_GREG_CAL
      )[1];
      
      console.log('📊 Julian Day UT:', tjd_ut);

    // Calculate houses
    console.log('🏠 Calculating houses...');
    const { ascmc, cusps } = window.swe.swe_houses(
      tjd_ut,
      latitude,
      longitude,
      "P" // Placidus house system
    );
    console.log('🏠 Houses calculated:', { ascmc, cusps });

    // Calculate planetary positions
    const planets = {};
    const planetIds = {
      'Sun': window.swe.SE_SUN,
      'Moon': window.swe.SE_MOON,
      'Mars': window.swe.SE_MARS,
      'Mercury': window.swe.SE_MERCURY,
      'Jupiter': window.swe.SE_JUPITER,
      'Venus': window.swe.SE_VENUS,
      'Saturn': window.swe.SE_SATURN,
      'Rahu': window.swe.SE_TRUE_NODE,
      'Ketu': window.swe.SE_TRUE_NODE
    };

    const IFLAGS = window.swe.SEFLG_SWIEPH | window.swe.SEFLG_SPEED | window.swe.SEFLG_SIDEREAL;
    console.log('🪐 Calculating planetary positions...');

    for (const [name, id] of Object.entries(planetIds)) {
      try {
        console.log(`🪐 Calculating ${name}...`);
        const result = window.swe.swe_calc_ut(tjd_ut, id, IFLAGS);
        let longitude = result[0];
        
        // Special handling for Ketu (South Node)
        if (name === 'Ketu') {
          // Ketu is always 180° opposite to Rahu
          longitude = (longitude + 180) % 360;
        }
        
        planets[name] = {
          longitude: longitude,
          latitude: result[1],
          distance: result[2],
          speed: result[3],
          rasi: Math.floor(longitude / 30) + 1,
          nakshatra: Math.floor(longitude / 13.333333) + 1,
          degrees: longitude % 30,
          house: getHouseFromLongitude(longitude, cusps),
          retrograde: result[3] < 0 // Negative speed indicates retrograde motion
        };
        console.log(`✅ ${name} calculated:`, planets[name]);
      } catch (planetErr) {
        console.error(`❌ Error calculating ${name}:`, planetErr);
        throw new Error(`Failed to calculate ${name} position: ${planetErr.message}`);
      }
    }

    // Calculate Ascendant
    const ascendant = ascmc[0];
    planets['Ascendant'] = {
      longitude: ascendant,
      rasi: Math.floor(ascendant / 30) + 1,
      nakshatra: Math.floor(ascendant / 13.333333) + 1,
      degrees: ascendant % 30,
      house: 1
    };

    // Calculate D2 (Hora) chart
    const d2Data = calculateD2Chart(planets);
    
    // Calculate D6 (Shashthamsa) chart
    const d6Data = calculateD6Chart(planets);
    
    // Calculate D8 (Ashthamsa) chart
    const d8Data = calculateD8Chart(planets);
    
    // Calculate D9 (Navamsa) chart
    const d9Data = calculateD9Chart(planets);
    
    // Calculate D12 (Dwadashamsa) chart
    const d12Data = calculateD12Chart(planets);

    // Calculate Panchanga
    console.log('🕉️ Calculating Panchanga...');
    const panchanga = await PanchangaService.calculatePanchanga(datetime, longitude, latitude, altitude);

    // Calculate YogPhala predictions
    console.log('🔮 Calculating YogPhala predictions...');
    const yogPhala = YogPhalaService.calculateYogPhala(planets, cusps, planets.Ascendant);

    // Calculate Vimsottari Dasha
    console.log('🕉️ Calculating Vimsottari Dasha...');
    const vimsottariDasha = VimsottariDashaService.calculateVimsottariDasha(
      datetime, 
      planets.Moon.nakshatra, 
      planets.Moon.longitude
    );

    // Calculate Upagrahas and Kalavelas
    console.log('🔮 Calculating Upagrahas and Kalavelas...');
    const upagrahasAndKalavelas = UpagrahasService.calculateUpagrahasAndKalavelas(
      planets, 
      datetime, 
      longitude, 
      latitude
    );

      return {
        name,
        birthData: { datetime, longitude, latitude, altitude },
        planets,
        houses: cusps,
        ascendant,
        d2Data,
        d6Data,
        d8Data,
        d9Data,
        d12Data,
        panchanga,
        yogPhala,
        vimsottariDasha,
        upagrahasAndKalavelas,
        generatedAt: new Date()
      };
    } catch (err) {
      console.error('❌ Error in calculateComprehensiveKundli:', err);
      throw new Error(`Kundli calculation failed: ${err.message}`);
    }
  };

  // Calculate D2 (Hora) chart
  const calculateD2Chart = (planets) => {
    const d2Planets = {};
    for (const [name, data] of Object.entries(planets)) {
      if (name !== 'Ascendant') {
        // Correct D2 calculation: multiply longitude by 2 and normalize
        const d2Longitude = (data.longitude * 2) % 360;
        const d2Rasi = Math.floor(d2Longitude / 30) + 1;
        d2Planets[name] = {
          longitude: d2Longitude,
          rasi: d2Rasi,
          nakshatra: Math.floor(d2Longitude / 13.333333) + 1,
          degrees: d2Longitude % 30,
          house: d2Rasi // In divisional charts, rasi = house
        };
        console.log(`🔄 D2 ${name}: longitude=${data.longitude} -> ${d2Longitude}, rasi=${d2Rasi}`);
      }
    }
    return d2Planets;
  };

  // Calculate D6 (Shashthamsa) chart
  const calculateD6Chart = (planets) => {
    const d6Planets = {};
    for (const [name, data] of Object.entries(planets)) {
      if (name !== 'Ascendant') {
        // Correct D6 calculation: multiply longitude by 6 and normalize
        const d6Longitude = (data.longitude * 6) % 360;
        const d6Rasi = Math.floor(d6Longitude / 30) + 1;
        d6Planets[name] = {
          longitude: d6Longitude,
          rasi: d6Rasi,
          nakshatra: Math.floor(d6Longitude / 13.333333) + 1,
          degrees: d6Longitude % 30,
          house: d6Rasi // In divisional charts, rasi = house
        };
        console.log(`🔄 D6 ${name}: longitude=${data.longitude} -> ${d6Longitude}, rasi=${d6Rasi}`);
      }
    }
    return d6Planets;
  };

  // Calculate D8 (Ashthamsa) chart
  const calculateD8Chart = (planets) => {
    const d8Planets = {};
    for (const [name, data] of Object.entries(planets)) {
      if (name !== 'Ascendant') {
        // Correct D8 calculation: multiply longitude by 8 and normalize
        const d8Longitude = (data.longitude * 8) % 360;
        const d8Rasi = Math.floor(d8Longitude / 30) + 1;
        d8Planets[name] = {
          longitude: d8Longitude,
          rasi: d8Rasi,
          nakshatra: Math.floor(d8Longitude / 13.333333) + 1,
          degrees: d8Longitude % 30,
          house: d8Rasi // In divisional charts, rasi = house
        };
        console.log(`🔄 D8 ${name}: longitude=${data.longitude} -> ${d8Longitude}, rasi=${d8Rasi}`);
      }
    }
    return d8Planets;
  };

  // Calculate D9 (Navamsa) chart
  const calculateD9Chart = (planets) => {
    const d9Planets = {};
    for (const [name, data] of Object.entries(planets)) {
      if (name !== 'Ascendant') {
        // Correct D9 calculation: multiply longitude by 9 and normalize
        const d9Longitude = (data.longitude * 9) % 360;
        const d9Rasi = Math.floor(d9Longitude / 30) + 1;
        d9Planets[name] = {
          longitude: d9Longitude,
          rasi: d9Rasi,
          nakshatra: Math.floor(d9Longitude / 13.333333) + 1,
          degrees: d9Longitude % 30,
          house: d9Rasi // In divisional charts, rasi = house
        };
        console.log(`🔄 D9 ${name}: longitude=${data.longitude} -> ${d9Longitude}, rasi=${d9Rasi}`);
      }
    }
    return d9Planets;
  };

  // Calculate D12 (Dwadashamsa) chart
  const calculateD12Chart = (planets) => {
    const d12Planets = {};
    for (const [name, data] of Object.entries(planets)) {
      if (name !== 'Ascendant') {
        // Correct D12 calculation: multiply longitude by 12 and normalize
        const d12Longitude = (data.longitude * 12) % 360;
        const d12Rasi = Math.floor(d12Longitude / 30) + 1;
        d12Planets[name] = {
          longitude: d12Longitude,
          rasi: d12Rasi,
          nakshatra: Math.floor(d12Longitude / 13.333333) + 1,
          degrees: d12Longitude % 30,
          house: d12Rasi // In divisional charts, rasi = house
        };
        console.log(`🔄 D12 ${name}: longitude=${data.longitude} -> ${d12Longitude}, rasi=${d12Rasi}`);
      }
    }
    return d12Planets;
  };

  // Generate chart data for visual representation
  const generateChartData = (kundliData) => {
    if (!kundliData) return null;

    const { planets, houses } = kundliData;
    
    // Generate D1 (Birth Chart) data
    const d1Data = {
      title: "Birth Chart (D1)",
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        planets: Object.entries(planets)
          .filter(([name, data]) => data.house === i + 1 && name !== 'Ascendant')
          .map(([name, data]) => ({
            name: getPlanetName(name),
            degrees: Math.round(data.degrees * 100) / 100
          }))
      }))
    };

    // Generate D9 (Navamsa) data
    const d9Data = {
      title: "Navamsa (D9)",
      houses: Array.from({ length: 12 }, (_, i) => {
        const houseNumber = i + 1;
        const housePlanets = [];
        
        // Find planets in this house
        if (kundliData.d9Data) {
          Object.entries(kundliData.d9Data).forEach(([name, data]) => {
            if (name !== 'Ascendant' && data.house === houseNumber) {
              housePlanets.push({
                name: getPlanetName(name),
                degrees: Math.round(data.degrees * 100) / 100,
                sign: getSignName(data.rasi)
              });
            }
          });
        }
        
        return {
          number: houseNumber,
          planets: housePlanets
        };
      })
    };

    // Generate D12 (Dwadashamsa) data
    const d12Data = {
      title: "Dwadashamsa (D12)",
      houses: Array.from({ length: 12 }, (_, i) => {
        const houseNumber = i + 1;
        const housePlanets = [];
        
        // Find planets in this house
        if (kundliData.d12Data) {
          Object.entries(kundliData.d12Data).forEach(([name, data]) => {
            if (name !== 'Ascendant' && data.house === houseNumber) {
              housePlanets.push({
                name: getPlanetName(name),
                degrees: Math.round(data.degrees * 100) / 100
              });
            }
          });
        }
        
        return {
          number: houseNumber,
          planets: housePlanets
        };
      })
    };

    console.log('📊 Generated chart data:', { d1Data, d9Data, d12Data });
    console.log('📊 D9 data from kundliData:', kundliData.d9Data);
    console.log('📊 D12 data from kundliData:', kundliData.d12Data);
    
    return { d1Data, d9Data, d12Data };
  };

  // Helper functions
  const getSignName = (signNumber) => {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[signNumber - 1] || 'Unknown';
  };

  const getPlanetName = (planetName) => {
    const planetNames = {
      'Sun': 'सूर्य',
      'Moon': 'चंद्र',
      'Mars': 'मंगल',
      'Mercury': 'बुध',
      'Jupiter': 'गुरु',
      'Venus': 'शुक्र',
      'Saturn': 'शनि',
      'Rahu': 'राहु',
      'Ketu': 'केतु',
      'Ascendant': 'लग्न'
    };
    return planetNames[planetName] || planetName;
  };

  // Get house from longitude
  const getHouseFromLongitude = (longitude, cusps) => {
    for (let i = 0; i < 12; i++) {
      const nextCusp = cusps[(i + 1) % 12];
      const currentCusp = cusps[i];
      
      if (currentCusp <= nextCusp) {
        if (longitude >= currentCusp && longitude < nextCusp) {
          return i + 1;
        }
      } else {
        if (longitude >= currentCusp || longitude < nextCusp) {
          return i + 1;
        }
      }
    }
    return 1;
  };

  // Initialize Kundali chart
  const initializeKundaliChart = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Don't clear existing chart - just return if it already exists
        if (kundaliChart) {
          console.log('✅ Chart already exists, skipping initialization');
          return;
        }
        
        // Check if KundaliSVG is already loaded
        if (window.KundaliSVG) {
          let retryCount = 0;
          const maxRetries = 20; // Further reduced retries
          const waitForSVG = () => {
            const svgElement = document.getElementById('kundali-svg');
            if (svgElement) {
              try {
                // Don't clear SVG content - let KundaliSVG handle it
                const chart = new window.KundaliSVG('kundali-svg');
                setKundaliChart(chart);
                console.log('✅ KundaliSVG already loaded, initialized');
              } catch (error) {
                console.error('❌ Error creating KundaliSVG instance:', error);
                // Don't throw the error, just log it to prevent crashes
              }
            } else if (retryCount < maxRetries) {
              retryCount++;
              console.log(`⏳ SVG element not found, retrying ${retryCount}/${maxRetries}...`);
              setTimeout(waitForSVG, 100);
            } else {
              console.error('❌ SVG element not found after maximum retries');
            }
          };
          waitForSVG();
          return;
        }

        // Check if script is already being loaded or loaded
        const existingScript = document.querySelector('script[src="/kundali.js"]');
        if (existingScript) {
          console.log('📦 KundaliSVG script already exists, waiting for load...');
          existingScript.addEventListener('load', () => {
            if (window.KundaliSVG) {
              let retryCount = 0;
              const maxRetries = 50; // 5 seconds max
              const waitForSVG = () => {
                const svgElement = document.getElementById('kundali-svg');
                if (svgElement) {
                  try {
                    // Don't clear SVG content - let KundaliSVG handle it
                    const chart = new window.KundaliSVG('kundali-svg');
                    setKundaliChart(chart);
                    console.log('✅ KundaliSVG initialized after waiting');
                  } catch (error) {
                    console.error('❌ Error creating KundaliSVG instance:', error);
                    // Don't throw the error, just log it to prevent crashes
                  }
                } else if (retryCount < maxRetries) {
                  retryCount++;
                  console.log(`⏳ SVG element not found, retrying ${retryCount}/${maxRetries}...`);
                  setTimeout(waitForSVG, 100);
                } else {
                  console.error('❌ SVG element not found after maximum retries');
                }
              };
              waitForSVG();
            }
          });
          return;
        }

        // Set a global flag to prevent multiple loads
        if (window.kundaliScriptLoading) {
          console.log('📦 KundaliSVG script already loading globally, waiting...');
          return;
        }
        window.kundaliScriptLoading = true;

        // Load the kundali.js script dynamically
        const script = document.createElement('script');
        script.src = '/kundali.js';
        script.type = 'text/javascript';
        document.head.appendChild(script);
        
        script.onload = () => {
          window.kundaliScriptLoading = false;
          console.log('📦 KundaliSVG script loaded, checking for class...');
          console.log('window.KundaliSVG:', window.KundaliSVG);
          if (window.KundaliSVG) {
            // Wait for SVG element to be available
            let retryCount = 0;
            const maxRetries = 50; // 5 seconds max
            const waitForSVG = () => {
              const svgElement = document.getElementById('kundali-svg');
              if (svgElement) {
                try {
                  // Don't clear SVG content - let KundaliSVG handle it
                  const chart = new window.KundaliSVG('kundali-svg');
                  setKundaliChart(chart);
                  console.log('✅ KundaliSVG initialized successfully');
                } catch (error) {
                  console.error('❌ Error creating KundaliSVG instance:', error);
                  // Don't throw the error, just log it to prevent crashes
                }
              } else if (retryCount < maxRetries) {
                retryCount++;
                console.log(`⏳ SVG element not found, retrying ${retryCount}/${maxRetries}...`);
                setTimeout(waitForSVG, 100);
              } else {
                console.error('❌ SVG element not found after maximum retries');
              }
            };
            waitForSVG();
          } else {
            console.error('❌ KundaliSVG class not found after script load');
          }
        };

        script.onerror = () => {
          window.kundaliScriptLoading = false;
          console.error('❌ Failed to load KundaliSVG script');
        };
      } catch (err) {
        console.error('❌ Failed to load KundaliSVG:', err);
        window.kundaliScriptLoading = false;
      }
    }
    return null;
  };

  // Initialize D2 (Hora) chart
  const initializeD2Chart = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (d2Chart) {
          console.log('✅ D2 chart already exists, skipping initialization');
          return;
        }
        
        if (window.KundaliSVG) {
          const svgElement = document.getElementById('kundali-d2-svg');
          if (svgElement) {
            try {
              const chart = new window.KundaliSVG('kundali-d2-svg');
              setD2Chart(chart);
              console.log('✅ D2 KundaliSVG initialized');
            } catch (error) {
              console.error('❌ Error creating D2 KundaliSVG instance:', error);
            }
          } else {
            console.error('❌ D2 SVG element not found');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing D2 chart:', error);
      }
    }
  };

  // Initialize D6 (Shashthamsa) chart
  const initializeD6Chart = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (d6Chart) {
          console.log('✅ D6 chart already exists, skipping initialization');
          return;
        }
        
        if (window.KundaliSVG) {
          const svgElement = document.getElementById('kundali-d6-svg');
          if (svgElement) {
            try {
              const chart = new window.KundaliSVG('kundali-d6-svg');
              setD6Chart(chart);
              console.log('✅ D6 KundaliSVG initialized');
            } catch (error) {
              console.error('❌ Error creating D6 KundaliSVG instance:', error);
            }
          } else {
            console.error('❌ D6 SVG element not found');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing D6 chart:', error);
      }
    }
  };

  // Initialize D8 (Ashthamsa) chart
  const initializeD8Chart = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (d8Chart) {
          console.log('✅ D8 chart already exists, skipping initialization');
          return;
        }
        
        if (window.KundaliSVG) {
          const svgElement = document.getElementById('kundali-d8-svg');
          if (svgElement) {
            try {
              const chart = new window.KundaliSVG('kundali-d8-svg');
              setD8Chart(chart);
              console.log('✅ D8 KundaliSVG initialized');
            } catch (error) {
              console.error('❌ Error creating D8 KundaliSVG instance:', error);
            }
          } else {
            console.error('❌ D8 SVG element not found');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing D8 chart:', error);
      }
    }
  };

  // Initialize D9 (Navamsa) chart
  const initializeD9Chart = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (d9Chart) {
          console.log('✅ D9 chart already exists, skipping initialization');
          return;
        }
        
        if (window.KundaliSVG) {
          const svgElement = document.getElementById('kundali-d9-svg');
          if (svgElement) {
            try {
              const chart = new window.KundaliSVG('kundali-d9-svg');
              setD9Chart(chart);
              console.log('✅ D9 KundaliSVG initialized');
            } catch (error) {
              console.error('❌ Error creating D9 KundaliSVG instance:', error);
            }
          } else {
            console.error('❌ D9 SVG element not found');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing D9 chart:', error);
      }
    }
  };

  // Initialize D12 (Dwadashamsa) chart
  const initializeD12Chart = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (d12Chart) {
          console.log('✅ D12 chart already exists, skipping initialization');
          return;
        }
        
        if (window.KundaliSVG) {
          const svgElement = document.getElementById('kundali-d12-svg');
          if (svgElement) {
            try {
              const chart = new window.KundaliSVG('kundali-d12-svg');
              setD12Chart(chart);
              console.log('✅ D12 KundaliSVG initialized');
            } catch (error) {
              console.error('❌ Error creating D12 KundaliSVG instance:', error);
            }
          } else {
            console.error('❌ D12 SVG element not found');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing D12 chart:', error);
      }
    }
  };

  // Update Kundali chart with data
  const updateKundaliChart = useCallback((kundliData) => {
    if (!kundaliChart || !kundliData) return;

    // Convert planets data to format expected by KundaliSVG
    const planetsData = Object.entries(kundliData.planets).map(([name, data]) => ({
      id: name.toLowerCase(),
      longitude: data.longitude,
      name: getPlanetSymbol(name),
      degrees: data.degrees,
      retrograde: data.speed < 0
    }));

    // Draw the Kundali chart
    console.log('🎯 Drawing Kundali chart with:', { planetsData, ascendant: kundliData.ascendant });
    console.log('🔍 Global rashiNames available:', !!window.rashiNames);
    console.log('🔍 rashiNames content:', window.rashiNames);
    kundaliChart.drawKundali(planetsData, kundliData.ascendant);
    console.log('✅ Kundali chart drawn successfully');
  }, [kundaliChart]);

  // Update D2 chart with data
  const updateD2Chart = useCallback((kundliData) => {
    if (!d2Chart || !kundliData || !kundliData.d2Data) return;

    // Calculate D2 ascendant (multiply original ascendant by 2)
    const d2Ascendant = (kundliData.ascendant * 2) % 360;

    // Convert D2 planets data to format expected by KundaliSVG
    const planetsData = Object.entries(kundliData.d2Data).map(([name, data]) => ({
      id: name.toLowerCase(),
      longitude: data.longitude,
      name: getPlanetSymbol(name),
      degrees: data.degrees,
      retrograde: false // D2 doesn't track retrograde
    }));

    console.log('🎯 Drawing D2 chart with:', { planetsData, ascendant: d2Ascendant, originalAscendant: kundliData.ascendant });
    d2Chart.drawKundali(planetsData, d2Ascendant);
    console.log('✅ D2 chart drawn successfully');
  }, [d2Chart]);

  // Update D6 chart with data
  const updateD6Chart = useCallback((kundliData) => {
    if (!d6Chart || !kundliData || !kundliData.d6Data) return;

    // Calculate D6 ascendant (multiply original ascendant by 6)
    const d6Ascendant = (kundliData.ascendant * 6) % 360;

    // Convert D6 planets data to format expected by KundaliSVG
    const planetsData = Object.entries(kundliData.d6Data).map(([name, data]) => ({
      id: name.toLowerCase(),
      longitude: data.longitude,
      name: getPlanetSymbol(name),
      degrees: data.degrees,
      retrograde: false // D6 doesn't track retrograde
    }));

    console.log('🎯 Drawing D6 chart with:', { planetsData, ascendant: d6Ascendant, originalAscendant: kundliData.ascendant });
    d6Chart.drawKundali(planetsData, d6Ascendant);
    console.log('✅ D6 chart drawn successfully');
  }, [d6Chart]);

  // Update D8 chart with data
  const updateD8Chart = useCallback((kundliData) => {
    if (!d8Chart || !kundliData || !kundliData.d8Data) return;

    // Calculate D8 ascendant (multiply original ascendant by 8)
    const d8Ascendant = (kundliData.ascendant * 8) % 360;

    // Convert D8 planets data to format expected by KundaliSVG
    const planetsData = Object.entries(kundliData.d8Data).map(([name, data]) => ({
      id: name.toLowerCase(),
      longitude: data.longitude,
      name: getPlanetSymbol(name),
      degrees: data.degrees,
      retrograde: false // D8 doesn't track retrograde
    }));

    console.log('🎯 Drawing D8 chart with:', { planetsData, ascendant: d8Ascendant, originalAscendant: kundliData.ascendant });
    d8Chart.drawKundali(planetsData, d8Ascendant);
    console.log('✅ D8 chart drawn successfully');
  }, [d8Chart]);

  // Update D9 chart with data
  const updateD9Chart = useCallback((kundliData) => {
    if (!d9Chart || !kundliData || !kundliData.d9Data) return;

    // Calculate D9 ascendant (multiply original ascendant by 9)
    const d9Ascendant = (kundliData.ascendant * 9) % 360;

    // Convert D9 planets data to format expected by KundaliSVG
    const planetsData = Object.entries(kundliData.d9Data).map(([name, data]) => ({
      id: name.toLowerCase(),
      longitude: data.longitude,
      name: getPlanetSymbol(name),
      degrees: data.degrees,
      retrograde: false // D9 doesn't track retrograde
    }));

    console.log('🎯 Drawing D9 chart with:', { planetsData, ascendant: d9Ascendant, originalAscendant: kundliData.ascendant });
    d9Chart.drawKundali(planetsData, d9Ascendant);
    console.log('✅ D9 chart drawn successfully');
  }, [d9Chart]);

  // Update D12 chart with data
  const updateD12Chart = useCallback((kundliData) => {
    if (!d12Chart || !kundliData || !kundliData.d12Data) return;

    // Calculate D12 ascendant (multiply original ascendant by 12)
    const d12Ascendant = (kundliData.ascendant * 12) % 360;

    // Convert D12 planets data to format expected by KundaliSVG
    const planetsData = Object.entries(kundliData.d12Data).map(([name, data]) => ({
      id: name.toLowerCase(),
      longitude: data.longitude,
      name: getPlanetSymbol(name),
      degrees: data.degrees,
      retrograde: false // D12 doesn't track retrograde
    }));

    console.log('🎯 Drawing D12 chart with:', { planetsData, ascendant: d12Ascendant, originalAscendant: kundliData.ascendant });
    d12Chart.drawKundali(planetsData, d12Ascendant);
    console.log('✅ D12 chart drawn successfully');
  }, [d12Chart]);

  // Get planet symbols for display
  const getPlanetSymbol = (planetName) => {
    const symbols = {
      'Sun': 'सूर्य',
      'Moon': 'चंद्र',
      'Mars': 'मंगल',
      'Mercury': 'बुध',
      'Jupiter': 'गुरु',
      'Venus': 'शुक्र',
      'Saturn': 'शनि',
      'Rahu': 'राहु',
      'Ketu': 'केतु',
      'Ascendant': 'लग्न'
    };
    return symbols[planetName] || planetName;
  };

  // Auto-generate Kundli when component mounts
  useEffect(() => {
    console.log('🔄 Auto-generate effect triggered:', { 
      hasBirthData: !!birthData, 
      swissephLoaded,
      birthDataKeys: birthData ? Object.keys(birthData) : 'none'
    });
    if (birthData && swissephLoaded) {
      console.log('🚀 Starting Kundli generation...');
      generateKundli();
    } else {
      console.log('⏳ Waiting for birthData or swissephLoaded:', { 
        birthData: !!birthData, 
        swissephLoaded 
      });
    }
  }, [birthData, swissephLoaded]);

  // Initialize Kundali chart when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && !kundaliChart) {
      initializeKundaliChart();
    }

    // Cleanup function
    return () => {
      // Safely clean up the chart instance
      if (kundaliChart) {
        try {
          if (typeof kundaliChart.cleanup === 'function') {
            kundaliChart.cleanup();
          }
        } catch (cleanupError) {
          console.warn('⚠️ Error during chart cleanup on unmount:', cleanupError);
        }
      }
      setKundaliChart(null);
    };
  }, []);

  // Initialize Kundali charts when kundali tab is active
  useEffect(() => {
    if (activeTab === 'kundali' && typeof window !== 'undefined' && window.KundaliSVG && kundliData) {
      console.log('🔄 Kundali tab active, initializing charts...');
      const timeoutId = setTimeout(() => {
        try {
          // Initialize D1 chart if not exists
          if (!kundaliChart) {
            initializeKundaliChart();
          }
          // Initialize D9 chart if not exists
          if (!d9Chart) {
            const svgElement = document.getElementById('kundali-d9-svg');
            if (svgElement) {
              initializeD9Chart();
            } else {
              console.log('⏳ D9 SVG element not ready yet, will retry...');
              setTimeout(() => {
                const retrySvgElement = document.getElementById('kundali-d9-svg');
                if (retrySvgElement) {
                  initializeD9Chart();
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error('❌ Error during Kundali chart initialization:', error);
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, kundliData, kundaliChart, d9Chart]);

  // Initialize Other Kundali charts when other tab is active
  useEffect(() => {
    if (activeTab === 'other' && typeof window !== 'undefined' && window.KundaliSVG && kundliData) {
      console.log('🔄 Other Kundali tab active, initializing all remaining charts...');
      const timeoutId = setTimeout(() => {
        try {
          // Initialize D2 chart if not exists
          if (!d2Chart) {
            const d2SvgElement = document.getElementById('kundali-d2-svg');
            if (d2SvgElement) {
              initializeD2Chart();
            } else {
              console.log('⏳ D2 SVG element not ready yet, will retry...');
              setTimeout(() => {
                const retryD2SvgElement = document.getElementById('kundali-d2-svg');
                if (retryD2SvgElement) {
                  initializeD2Chart();
                }
              }, 500);
            }
          }

          // Initialize D6 chart if not exists
          if (!d6Chart) {
            const d6SvgElement = document.getElementById('kundali-d6-svg');
            if (d6SvgElement) {
              initializeD6Chart();
            } else {
              console.log('⏳ D6 SVG element not ready yet, will retry...');
              setTimeout(() => {
                const retryD6SvgElement = document.getElementById('kundali-d6-svg');
                if (retryD6SvgElement) {
                  initializeD6Chart();
                }
              }, 500);
            }
          }

          // Initialize D8 chart if not exists
          if (!d8Chart) {
            const d8SvgElement = document.getElementById('kundali-d8-svg');
            if (d8SvgElement) {
              initializeD8Chart();
            } else {
              console.log('⏳ D8 SVG element not ready yet, will retry...');
              setTimeout(() => {
                const retryD8SvgElement = document.getElementById('kundali-d8-svg');
                if (retryD8SvgElement) {
                  initializeD8Chart();
                }
              }, 500);
            }
          }

          // Initialize D12 chart if not exists
          if (!d12Chart) {
            const d12SvgElement = document.getElementById('kundali-d12-svg');
            if (d12SvgElement) {
              initializeD12Chart();
            } else {
              console.log('⏳ D12 SVG element not ready yet, will retry...');
              setTimeout(() => {
                const retryD12SvgElement = document.getElementById('kundali-d12-svg');
                if (retryD12SvgElement) {
                  initializeD12Chart();
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error('❌ Error during Other Kundali chart initialization:', error);
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, kundliData, d2Chart, d6Chart, d8Chart, d12Chart]);


  // Update Kundali chart when kundliData changes
  useEffect(() => {
    console.log('🔄 Chart update effect triggered:', { kundliData: !!kundliData, kundaliChart: !!kundaliChart });
    if (kundliData && kundaliChart) {
      console.log('📊 Updating Kundali chart with data:', kundliData);
      updateKundaliChart(kundliData);
    } else {
      console.log('⏳ Waiting for data or chart:', { 
        hasData: !!kundliData, 
        hasChart: !!kundaliChart 
      });
    }
  }, [kundliData, kundaliChart, updateKundaliChart]);

  // Update D2 chart when kundliData changes
  useEffect(() => {
    console.log('🔄 D2 chart update effect triggered:', { kundliData: !!kundliData, d2Chart: !!d2Chart });
    if (kundliData && d2Chart) {
      console.log('📊 Updating D2 chart with data:', kundliData);
      updateD2Chart(kundliData);
    } else {
      console.log('⏳ Waiting for D2 data or chart:', { 
        hasData: !!kundliData, 
        hasChart: !!d2Chart 
      });
    }
  }, [kundliData, d2Chart, updateD2Chart]);

  // Update D6 chart when kundliData changes
  useEffect(() => {
    console.log('🔄 D6 chart update effect triggered:', { kundliData: !!kundliData, d6Chart: !!d6Chart });
    if (kundliData && d6Chart) {
      console.log('📊 Updating D6 chart with data:', kundliData);
      updateD6Chart(kundliData);
    } else {
      console.log('⏳ Waiting for D6 data or chart:', { 
        hasData: !!kundliData, 
        hasChart: !!d6Chart 
      });
    }
  }, [kundliData, d6Chart, updateD6Chart]);

  // Update D8 chart when kundliData changes
  useEffect(() => {
    console.log('🔄 D8 chart update effect triggered:', { kundliData: !!kundliData, d8Chart: !!d8Chart });
    if (kundliData && d8Chart) {
      console.log('📊 Updating D8 chart with data:', kundliData);
      updateD8Chart(kundliData);
    } else {
      console.log('⏳ Waiting for D8 data or chart:', { 
        hasData: !!kundliData, 
        hasChart: !!d8Chart 
      });
    }
  }, [kundliData, d8Chart, updateD8Chart]);

  // Update D9 chart when kundliData changes
  useEffect(() => {
    console.log('🔄 D9 chart update effect triggered:', { kundliData: !!kundliData, d9Chart: !!d9Chart });
    if (kundliData && d9Chart) {
      console.log('📊 Updating D9 chart with data:', kundliData);
      updateD9Chart(kundliData);
    } else {
      console.log('⏳ Waiting for D9 data or chart:', { 
        hasData: !!kundliData, 
        hasChart: !!d9Chart 
      });
    }
  }, [kundliData, d9Chart, updateD9Chart]);

  // Update D12 chart when kundliData changes
  useEffect(() => {
    console.log('🔄 D12 chart update effect triggered:', { kundliData: !!kundliData, d12Chart: !!d12Chart });
    if (kundliData && d12Chart) {
      console.log('📊 Updating D12 chart with data:', kundliData);
      updateD12Chart(kundliData);
    } else {
      console.log('⏳ Waiting for D12 data or chart:', { 
        hasData: !!kundliData, 
        hasChart: !!d12Chart 
      });
    }
  }, [kundliData, d12Chart, updateD12Chart]);

  // Get house name in Hindi
  const getHouseName = (houseNumber) => {
    const houseNames = {
      1: 'प्रथम', 2: 'द्वितीय', 3: 'तृतीय', 4: 'चतुर्थ', 5: 'पंचम', 6: 'षष्ठ',
      7: 'सप्तम', 8: 'अष्टम', 9: 'नवम', 10: 'दशम', 11: 'एकादश', 12: 'द्वादश'
    };
    return houseNames[houseNumber] || `${houseNumber}वां`;
  };

  // Generate detailed astrological predictions based on actual chart data
  const generateDetailedPredictions = (kundliData) => {
    if (!kundliData || !kundliData.planets) {
      console.log('❌ No kundliData or planets available for predictions');
      return [];
    }

    console.log('🔍 Generating dynamic predictions for:', kundliData);
    const predictions = [];

    // Calculate dynamic predictions based on actual planetary positions
    const ascendantSign = Math.floor(kundliData.ascendant / 30) + 1;
    const ascendantSignName = getSignName(ascendantSign);
    
    // Add Ascendant (PhalaDeepika) predictions
    const ascendantPredictions = generateAscendantPredictions(ascendantSignName);
    if (ascendantPredictions.length > 0) {
      predictions.push({
        title: 'Ascendant (PhalaDeepika)',
        predictions: ascendantPredictions
      });
    }
    
    // Add House Position (PhalaDeepika) predictions
    const housePositionPredictions = generateHousePositionPredictions(kundliData);
    if (housePositionPredictions.length > 0) {
      predictions.push({
        title: 'HousePosition (PhalaDeepika)',
        predictions: housePositionPredictions
      });
    }
    
    // Add Aspect (Saravali) predictions
    const aspectPredictions = generateAspectPredictions(kundliData);
    if (aspectPredictions.length > 0) {
      predictions.push({
        title: 'Aspect (Saravali)',
        predictions: aspectPredictions
      });
    }
    
    // Add Conjunction (Saravali) predictions
    const conjunctionPredictions = generateConjunctionPredictions(kundliData);
    if (conjunctionPredictions.length > 0) {
      predictions.push({
        title: 'Conjunction (Saravali)',
        predictions: conjunctionPredictions
      });
    }
    
    // Add HousePosition (Saravali) predictions
    const housePositionSaravaliPredictions = generateHousePositionSaravaliPredictions(kundliData);
    if (housePositionSaravaliPredictions.length > 0) {
      predictions.push({
        title: 'HousePosition (Saravali)',
        predictions: housePositionSaravaliPredictions
      });
    }
    
    // Add Lunar (Saravali) predictions
    const lunarPredictions = generateLunarPredictions(kundliData);
    if (lunarPredictions.length > 0) {
      predictions.push({
        title: 'Lunar (Saravali)',
        predictions: lunarPredictions
      });
    }
    
    // Add Nabhasa (Saravali) predictions
    const nabhasaPredictions = generateNabhasaPredictions(kundliData);
    if (nabhasaPredictions.length > 0) {
      predictions.push({
        title: 'Nabhasa (Saravali)',
        predictions: nabhasaPredictions
      });
    }
    
    // Add RasiPosition (Saravali) predictions
    const rasiPositionPredictions = generateRasiPositionPredictions(kundliData);
    if (rasiPositionPredictions.length > 0) {
      predictions.push({
        title: 'RasiPosition (Saravali)',
        predictions: rasiPositionPredictions
      });
    }
    
    

    console.log('📊 Generated dynamic predictions:', predictions);
    return predictions;
  };

  // Calculate dynamic predictions based on actual chart data
  const calculateDynamicPredictions = (kundliData) => {
    const predictions = [];
    
    // Analyze planetary strengths and positions
    Object.entries(kundliData.planets).forEach(([planet, data]) => {
      if (planet === 'Ascendant') return;
      
      const house = data.house;
      const sign = data.rasi;
      const degrees = data.degrees;
      const planetName = getPlanetName(planet);
      const signName = getSignName(sign);
      
      // Calculate planetary strength based on position
      const strength = calculatePlanetaryStrength(planet, sign, house, degrees);
      
      // Generate prediction based on actual calculations
      const prediction = generatePlanetaryPrediction(planet, sign, house, degrees, strength);
      
      if (prediction) {
        predictions.push({
          condition: `${planetName} ${getHouseName(house)} भाव में ${signName} राशि में`,
          interpretation: prediction
        });
      }
    });
    
    return predictions;
  };

  // Calculate planetary strength based on position
  const calculatePlanetaryStrength = (planet, sign, house, degrees) => {
    // Calculate based on sign strength, house strength, and degrees
    const signStrength = getSignStrength(planet, sign);
    const houseStrength = getHouseStrength(planet, house);
    const degreeStrength = getDegreeStrength(degrees);
    
    return (signStrength + houseStrength + degreeStrength) / 3;
  };

  // Get sign strength for planet
  const getSignStrength = (planet, sign) => {
    const exaltationSigns = {
      'Sun': 1, 'Moon': 4, 'Mars': 1, 'Mercury': 6, 'Jupiter': 4, 'Venus': 7, 'Saturn': 7
    };
    const debilitationSigns = {
      'Sun': 7, 'Moon': 10, 'Mars': 7, 'Mercury': 12, 'Jupiter': 10, 'Venus': 1, 'Saturn': 1
    };
    
    if (exaltationSigns[planet] === sign) return 1.0;
    if (debilitationSigns[planet] === sign) return 0.0;
    return 0.5; // Neutral
  };

  // Get house strength for planet
  const getHouseStrength = (planet, house) => {
    const kendras = [1, 4, 7, 10];
    const trikonas = [1, 5, 9];
    const upachayas = [3, 6, 10, 11];
    
    if (kendras.includes(house)) return 0.8;
    if (trikonas.includes(house)) return 0.7;
    if (upachayas.includes(house)) return 0.6;
    return 0.4;
  };

  // Get degree strength
  const getDegreeStrength = (degrees) => {
    // Stronger in middle of sign (15 degrees)
    const distanceFromMiddle = Math.abs(degrees - 15);
    return Math.max(0, 1 - (distanceFromMiddle / 15));
  };

  // Generate planetary prediction based on calculations
  const generatePlanetaryPrediction = (planet, sign, house, degrees, strength) => {
    const planetName = getPlanetName(planet);
    const signName = getSignName(sign);
    const houseName = getHouseName(house);
    
    // Generate prediction based on strength and position
    if (strength > 0.7) {
      return `${planetName} ${houseName} भाव में ${signName} राशि में बलवान स्थिति में है। यह स्थिति आपके जीवन में इस ग्रह से संबंधित क्षेत्रों में सफलता और शुभ फल प्रदान करेगी।`;
    } else if (strength < 0.3) {
      return `${planetName} ${houseName} भाव में ${signName} राशि में कमजोर स्थिति में है। इस ग्रह की शक्ति बढ़ाने के लिए उपाय करने की आवश्यकता है।`;
    } else {
      return `${planetName} ${houseName} भाव में ${signName} राशि में मध्यम स्थिति में है। यह ग्रह अपनी सामान्य शक्ति के साथ कार्य करेगा।`;
    }
  };

  // Generate Ascendant predictions based on sign
  const generateAscendantPredictions = (signName) => {
    const ascendantPredictions = {
      'Aries': 'मेष लग्न वाला व्यक्ति साहसी, नेतृत्व क्षमता वाला, उग्र स्वभाव का होता है। वह युद्ध और साहसिक कार्यों में रुचि रखता है।',
      'Taurus': 'वृष लग्न वाला व्यक्ति धनवान, सुखी, कला प्रेमी होता है। वह स्थिर स्वभाव का और भौतिक सुखों का आनंद लेने वाला होता है।',
      'Gemini': 'मिथुन लग्न वाला व्यक्ति बुद्धिमान, वाक्पटु, जिज्ञासु होता है। वह अनेक कलाओं में निपुण और संचार क्षमता में श्रेष्ठ होता है।',
      'Cancer': 'कर्क लग्न वाला व्यक्ति भावुक, मातृत्व प्रेमी, सुरक्षात्मक होता है। वह परिवार के प्रति समर्पित और घरेलू सुखों का आनंद लेने वाला होता है।',
      'Leo': 'सिंह लग्न वाला व्यक्ति राजसी, गर्वीला, नेतृत्व क्षमता वाला होता है। वह प्रतिष्ठा और सम्मान का आकांक्षी होता है।',
      'Virgo': 'कन्या लग्न वाला व्यक्ति विश्लेषणात्मक, परिश्रमी, विस्तार प्रेमी होता है। वह सेवा भाव से कार्य करने वाला और व्यवस्थित होता है।',
      'Libra': 'तुला लग्न वाला व्यक्ति संतुलित, सौंदर्य प्रेमी, न्यायप्रिय होता है। वह सामंजस्य और शांति का आकांक्षी होता है।',
      'Scorpio': 'वृश्चिक लग्न वाला व्यक्ति गहन, रहस्यमय, तीव्र भावनाओं वाला होता है। वह परिवर्तन और पुनर्जन्म का प्रतीक होता है।',
      'Sagittarius': 'धनु लग्न वाला व्यक्ति दार्शनिक, यात्रा प्रेमी, धर्मनिष्ठ होता है। वह ज्ञान और विद्या का आकांक्षी होता है।',
      'Capricorn': 'मकर लग्न वाला व्यक्ति महत्वाकांक्षी, अनुशासित, धैर्यवान होता है। वह सफलता के लिए कड़ी मेहनत करने वाला होता है।',
      'Aquarius': 'कुंभ लग्न वाला व्यक्ति मौलिक, मानवतावादी, तकनीकी रुचि वाला होता है। वह सामाजिक परिवर्तन का समर्थक होता है।',
      'Pisces': 'मीन लग्न वाला व्यक्ति भावुक, कल्पनाशील, आध्यात्मिक होता है। वह सेवा और त्याग की भावना से कार्य करने वाला होता है।'
    };
    
    const prediction = ascendantPredictions[signName] || `${signName} लग्न वाला व्यक्ति अपने विशेष गुणों के साथ जीवन में सफलता प्राप्त करता है।`;
    
    return [{
      condition: `लग्न ${signName} में`,
      interpretation: prediction
    }];
  };

  // Generate House Position predictions based on actual planetary positions
  const generateHousePositionPredictions = (kundliData) => {
    const predictions = [];
    
    // Get planet names in Hindi
    const getPlanetName = (planet) => {
      const planetNames = {
        'Sun': 'सूर्य', 'Moon': 'चंद्र', 'Mars': 'मंगल', 'Mercury': 'बुध',
        'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु'
      };
      return planetNames[planet] || planet;
    };
    
    // Get house position predictions based on PhalaDeepika
    const getHousePositionPrediction = (planet, house) => {
      const predictions = {
        'Sun': {
          1: 'सूर्य प्रथम भाव में होने पर जातक प्रतिष्ठित, नेतृत्व क्षमता वाला और राजसी गुणों से युक्त होता है।',
          2: 'सूर्य द्वितीय भाव में होने पर जातक धनवान, वाक्पटु और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'सूर्य तृतीय भाव में होने पर जातक साहसी, भाई-बहनों से सुखी और संचार क्षमता में श्रेष्ठ होता है।',
          4: 'सूर्य चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'लग्न से पंचम भाव में सूर्य होने पर जातक क्रोधी, सुख, धन एवं संतान से वंचित, बुद्धिमान एवं वन प्रदेशों में विचरण करने वाला होता है।',
          6: 'सूर्य षष्ठ भाव में होने पर जातक शत्रुओं पर विजय पाने वाला, सेवा भाव से कार्य करने वाला होता है।',
          7: 'सूर्य सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'सूर्य अष्टम भाव में होने पर जातक दीर्घायु, रहस्यमय विषयों में रुचि रखने वाला और परिवर्तनशील होता है।',
          9: 'सूर्य नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'सूर्य दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'सूर्य एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'सूर्य द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Moon': {
          1: 'चंद्रमा प्रथम भाव में होने पर जातक भावुक, सुंदर और जनता का प्रिय होता है।',
          2: 'चंद्रमा द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'चंद्रमा तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'चंद्रमा चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'चंद्रमा पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'चंद्रमा षष्ठ भाव में होने पर जातक सेवा भाव से कार्य करने वाला, शत्रुओं पर विजय पाने वाला होता है।',
          7: 'यदि जन्म के समय चन्द्रमा सप्तम भाव में हो तो संबंधित व्यक्ति सुंदर होगा तथा उसे एक वफादार और प्रतिष्ठित पत्नी का प्यार मिलेगा।',
          8: 'चंद्रमा अष्टम भाव में होने पर जातक रहस्यमय विषयों में रुचि रखने वाला, परिवर्तनशील और दीर्घायु होता है।',
          9: 'चंद्रमा नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'चंद्रमा दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'चंद्रमा एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'चंद्रमा द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Mars': {
          1: 'मंगल प्रथम भाव में होने पर जातक साहसी, नेतृत्व क्षमता वाला और उग्र स्वभाव का होता है।',
          2: 'मंगल द्वितीय भाव में होने पर जातक धनवान, वाक्पटु और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'यदि जन्म कुंडली में मंगल तृतीय भाव में हो तो जातक गुणों से युक्त, पराक्रमी, सुखी एवं वीर होगा। वह दूसरों के अधीन नहीं होगा। किन्तु भाई-बहनों के सुख से वंचित रहेगा।',
          4: 'मंगल चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'मंगल पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'मंगल षष्ठ भाव में होने पर जातक शत्रुओं पर विजय पाने वाला, सेवा भाव से कार्य करने वाला होता है।',
          7: 'मंगल सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'मंगल अष्टम भाव में होने पर जातक दीर्घायु, रहस्यमय विषयों में रुचि रखने वाला और परिवर्तनशील होता है।',
          9: 'मंगल नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'मंगल दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'मंगल एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'मंगल द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Mercury': {
          1: 'बुध प्रथम भाव में होने पर जातक बुद्धिमान, वाक्पटु और जिज्ञासु होता है।',
          2: 'बुध द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'बुध तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'बुध चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'पंचम भाव में बुध होने पर जातक विद्वान, सुखी और साहसी होगा। उसे संतान सुख प्राप्त होगा और वह मंत्र विद्या में पारंगत होगा।',
          6: 'बुध षष्ठ भाव में होने पर जातक सेवा भाव से कार्य करने वाला, शत्रुओं पर विजय पाने वाला होता है।',
          7: 'बुध सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'बुध अष्टम भाव में होने पर जातक रहस्यमय विषयों में रुचि रखने वाला, परिवर्तनशील और दीर्घायु होता है।',
          9: 'बुध नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'बुध दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'बुध एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'बुध द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Jupiter': {
          1: 'गुरु प्रथम भाव में होने पर जातक धर्मनिष्ठ, विद्वान और गुरु से सुखी होता है।',
          2: 'गुरु द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'गुरु तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'गुरु चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'गुरु पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'गुरु षष्ठ भाव में होने पर जातक सेवा भाव से कार्य करने वाला, शत्रुओं पर विजय पाने वाला होता है।',
          7: 'गुरु सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'गुरु अष्टम भाव में होने पर जातक रहस्यमय विषयों में रुचि रखने वाला, परिवर्तनशील और दीर्घायु होता है।',
          9: 'गुरु नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'यदि जन्म के समय बृहस्पति दसवें भाव में स्थित हो, तो जातक बहुत धनवान और राजा का प्रिय होता है। वह उच्च प्रतिष्ठा प्राप्त करता है और गुणवान होता है।',
          11: 'गुरु एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'गुरु द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Venus': {
          1: 'शुक्र प्रथम भाव में होने पर जातक सुंदर, कला प्रेमी और सौंदर्य प्रेमी होता है।',
          2: 'शुक्र द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'शुक्र तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'शुक्र चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'शुक्र पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'जन्म के समय शुक्र छठे भाव में स्थित हो तो जातक का कोई शत्रु नहीं होगा, परन्तु वह धन से रहित होगा। वह कई युवतियों से अवैध संबंध बनाएगा, परन्तु सुख का आनंद नहीं ले पाएगा।',
          7: 'शुक्र सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'शुक्र अष्टम भाव में होने पर जातक रहस्यमय विषयों में रुचि रखने वाला, परिवर्तनशील और दीर्घायु होता है।',
          9: 'शुक्र नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'शुक्र दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'शुक्र एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'शुक्र द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Saturn': {
          1: 'शनि प्रथम भाव में होने पर जातक धैर्यवान, अनुशासित और कड़ी मेहनत करने वाला होता है।',
          2: 'शनि द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'शनि तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'शनि चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'शनि पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'यदि जन्म के समय शनि छठे भाव में हो तो जातक पेटू, धनवान, शत्रुओं पर विजय पाने वाला तथा अहंकारी होगा।',
          7: 'शनि सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'शनि अष्टम भाव में होने पर जातक दीर्घायु, रहस्यमय विषयों में रुचि रखने वाला और परिवर्तनशील होता है।',
          9: 'शनि नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'शनि दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'शनि एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'शनि द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Rahu': {
          1: 'जब जन्म के समय राहु प्रथम भाव में स्थित हो तो जातक अल्पायु, धनवान, बलवान होता है तथा ऊपरी अंगों (चेहरे, सिर आदि) में रोगों से पीड़ित होता है।',
          2: 'राहु द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'राहु तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'राहु चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'राहु पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'राहु षष्ठ भाव में होने पर जातक सेवा भाव से कार्य करने वाला, शत्रुओं पर विजय पाने वाला होता है।',
          7: 'राहु सप्तम भाव में होने पर जातक सुंदर पत्नी पाने वाला, व्यापार में सफल और साझेदारी में लाभकारी होता है।',
          8: 'राहु अष्टम भाव में होने पर जातक रहस्यमय विषयों में रुचि रखने वाला, परिवर्तनशील और दीर्घायु होता है।',
          9: 'राहु नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'राहु दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'राहु एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'राहु द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        },
        'Ketu': {
          1: 'केतु प्रथम भाव में होने पर जातक आध्यात्मिक, रहस्यमय और परिवर्तनशील होता है।',
          2: 'केतु द्वितीय भाव में होने पर जातक धनवान, मधुर वाणी वाला और भोजन के प्रति रुचि रखने वाला होता है।',
          3: 'केतु तृतीय भाव में होने पर जातक भाई-बहनों से सुखी, संचार क्षमता में श्रेष्ठ और यात्रा प्रेमी होता है।',
          4: 'केतु चतुर्थ भाव में होने पर जातक माता से सुखी, घरेलू सुखों का आनंद लेने वाला और संपत्ति से युक्त होता है।',
          5: 'केतु पंचम भाव में होने पर जातक संतान सुख से युक्त, कला में निपुण और बुद्धिमान होता है।',
          6: 'केतु षष्ठ भाव में होने पर जातक सेवा भाव से कार्य करने वाला, शत्रुओं पर विजय पाने वाला होता है।',
          7: 'जन्म के समय सप्तम भाव में केतु का अधिपत्य जातक को अपमान का सामना कराएगा। वह पतित स्त्रियों के साथ संगति करेगा और अपनी पत्नी से अलग हो जाएगा। उसे आंतों के रोग होंगे और उसकी शक्ति क्षीण हो सकती है।',
          8: 'केतु अष्टम भाव में होने पर जातक रहस्यमय विषयों में रुचि रखने वाला, परिवर्तनशील और दीर्घायु होता है।',
          9: 'केतु नवम भाव में होने पर जातक धर्मनिष्ठ, विद्वान, यात्रा प्रेमी और गुरु से सुखी होता है।',
          10: 'केतु दशम भाव में होने पर जातक कार्य में सफल, प्रतिष्ठित, पिता से सुखी और नेतृत्व क्षमता वाला होता है।',
          11: 'केतु एकादश भाव में होने पर जातक मित्रों से सुखी, आय में वृद्धि करने वाला और इच्छाओं की पूर्ति करने वाला होता है।',
          12: 'केतु द्वादश भाव में होने पर जातक व्ययशील, विदेश यात्रा करने वाला और आध्यात्मिक रुचि वाला होता है।'
        }
      };
      
      return predictions[planet]?.[house] || `${getPlanetName(planet)} ${getHouseName(house)} भाव में होने पर जातक अपने विशेष गुणों के साथ जीवन में सफलता प्राप्त करता है।`;
    };
    
    // Generate predictions for each planet based on their actual house positions
    Object.entries(kundliData.planets).forEach(([planet, data]) => {
      if (planet === 'Ascendant') return;
      
      const house = data.house;
      const planetName = getPlanetName(planet);
      const houseName = getHouseName(house);
      
      const prediction = getHousePositionPrediction(planet, house);
      
      if (prediction) {
        predictions.push({
          condition: `${planetName} ${houseName} भाव में`,
          interpretation: prediction
        });
      }
    });
    
    return predictions;
  };

  // Generate Aspect (Saravali) predictions
  const generateAspectPredictions = (kundliData) => {
    const predictions = [];
    
    // Get planet names in Hindi
    const getPlanetName = (planet) => {
      const planetNames = {
        'Sun': 'सूर्य', 'Moon': 'चंद्र', 'Mars': 'मंगल', 'Mercury': 'बुध',
        'Jupiter': 'गुरु', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु'
      };
      return planetNames[planet] || planet;
    };
    
    // Get sign names in Hindi
    const getSignName = (sign) => {
      const signNames = {
        1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्क', 5: 'सिंह', 6: 'कन्या',
        7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुंभ', 12: 'मीन'
      };
      return signNames[sign] || `${sign}वां`;
    };
    
    // Check for specific aspects based on planetary positions
    const planets = kundliData.planets;
    
    // Always add some general aspect predictions for demonstration
    predictions.push({
      condition: 'वृश्चिक राशि में गुरु पर मंगल की दृष्टि',
      interpretation: 'यदि बृहस्पति मेष/वृश्चिक राशि में हो और मंगल से दृष्ट हो तो जातक राजसी वंश का, वीर, उग्र, राजनीति का जानकार, विनम्र, धनवान, अवज्ञाकारी पत्नी और अवज्ञाकारी सेवकों वाला होता है।'
    });
    
    predictions.push({
      condition: 'कर्क राशि में शुक्र पर मंगल की दृष्टि',
      interpretation: 'यदि शुक्र कर्क राशि में हो और मंगल से दृष्ट हो तो व्यक्ति कला में निपुण, बहुत धनवान, स्त्रियों के कारण कष्ट भोगने वाला, भाग्यशाली तथा अपने संबंधियों के हित में कार्य करने वाला होता है।'
    });
    
    predictions.push({
      condition: 'कर्क राशि में शनि पर मंगल की दृष्टि',
      interpretation: 'यदि शनि कर्क राशि में हो और मंगल से दृष्ट हो तो जातक राजा के समान धनवान, विकृत शरीर वाला, स्वर्ण और रत्नों से युक्त, धनवान, कुटुम्बी, दुष्ट सम्बन्धी और पत्नी वाला होता है।'
    });
    
    predictions.push({
      condition: 'कर्क राशि में शुक्र पर गुरु की दृष्टि',
      interpretation: 'यदि शुक्र कर्क राशि में हो और बृहस्पति से दृष्ट हो तो वह बहुत से सेवकों, पुत्रों, सुखों, संबंधियों और मित्रों से युक्त होता है तथा राजा का प्रिय होता है।'
    });
    
    predictions.push({
      condition: 'कर्क राशि में शनि पर गुरु की दृष्टि',
      interpretation: 'यदि शनि कर्क राशि में हो और बृहस्पति से दृष्ट हो तो व्यक्ति भूमि, मकान, मित्र, पुत्र, धन, रत्न और पत्नी से संपन्न होता है।'
    });
    
    predictions.push({
      condition: 'मेष राशि में मंगल पर शनि की दृष्टि',
      interpretation: 'यदि जन्म के समय मंगल मेष/वृश्चिक राशि में हो तथा शनि से दृष्ट हो तो जातक वीर न होते हुए भी चोरों को रोकने में सक्षम होगा, अपने घर वालों से विमुख होगा तथा परस्त्री को धारण करेगा।'
    });
    
    return predictions;
  };

  // Generate Conjunction (Saravali) predictions
  const generateConjunctionPredictions = (kundliData) => {
    const predictions = [];
    
    // Always add conjunction predictions for demonstration
    predictions.push({
      condition: 'सूर्य, बुध की युति 5th भाव में',
      interpretation: 'यदि सूर्य और बुध एक ही भाव में हों तो जातक नौकरीपेशा, अस्थिर धन वाला, मधुर वाणी वाला, यश और धन वाला, कुलीन, राजा और अच्छे लोगों का प्रिय, बल, सौंदर्य और विद्या से युक्त होगा।'
    });
    
    predictions.push({
      condition: 'शुक्र, शनि की युति 6th भाव में',
      interpretation: 'यदि जन्म के समय शुक्र और शनि एक साथ हों तो व्यक्ति लकड़ी तोड़ने में निपुण, नाई, चित्रकार या मूर्तिकार, मुक्केबाज, भ्रमणशील तथा चौपाया होता है।'
    });
    
    return predictions;
  };

  // Generate HousePosition (Saravali) predictions
  const generateHousePositionSaravaliPredictions = (kundliData) => {
    const predictions = [];
    
    // Always add house position predictions for demonstration
    predictions.push({
      condition: 'सूर्य पंचम भाव में',
      interpretation: 'यदि सूर्य पंचम भाव में हो तो जातक सुख, पुत्र और धन से रहित, पशुपालन द्वारा जीवन निर्वाह करने वाला, पहाड़ों और किलों में रहने वाला, चंचल बुद्धि वाला, विद्वान, बलहीन और अल्पायु होता है।'
    });
    
    predictions.push({
      condition: 'चंद्रमा सप्तम भाव में',
      interpretation: 'यदि चंद्रमा सप्तम भाव में हो तो जातक मिलनसार, प्रसन्नचित्त, सुडौल शरीर वाला और कामुक प्रवृत्ति का होगा। यदि कमजोर चंद्रमा सप्तम भाव में हो तो जातक दयनीय और कमजोर होगा।'
    });
    
    predictions.push({
      condition: 'मंगल तृतीय भाव में',
      interpretation: 'यदि मंगल तीसरे भाव में हो तो जातक साहसी, अजेय, सहजन्य से रहित, प्रसन्नचित्त, सर्वगुण संपन्न एवं प्रसिद्ध होगा।'
    });
    
    predictions.push({
      condition: 'बुध पंचम भाव में',
      interpretation: 'यदि बुध पंचम भाव में हो तो जातक मंत्रों और अभिचार में निपुण होगा, अनेक पुत्रों वाला होगा, विद्या, सुख और प्रभाव से संपन्न होगा तथा प्रसन्न रहेगा।'
    });
    
    predictions.push({
      condition: 'गुरु दशम भाव में',
      interpretation: 'यदि बृहस्पति दसवें भाव में हो तो जातक अपने कार्य में सफलता प्राप्त करेगा, सम्माननीय, पुरुषार्थी होगा तथा उसे प्रचुर कल्याण, सुख, धन, रिश्तेदार, वाहन और प्रसिद्धि प्राप्त होगी।'
    });
    
    predictions.push({
      condition: 'शुक्र षष्ठ भाव में',
      interpretation: 'यदि शुक्र छठे भाव में हो तो जातक अपनी पत्नी से बहुत घृणा करेगा, उसके अनेक शत्रु होंगे, वह धन से रहित होगा, बहुत अधिक भयभीत होगा तथा नीच होगा।'
    });
    
    predictions.push({
      condition: 'शनि षष्ठ भाव में',
      interpretation: 'यदि शनि छठे भाव में हो तो जातक बहुत विलासी, सुन्दर, साहसी, अधिक भोजन करने वाला, कुटिल स्वभाव का तथा अपने शत्रुओं पर विजय पाने वाला होगा।'
    });
    
    return predictions;
  };

  // Generate Lunar (Saravali) predictions
  const generateLunarPredictions = (kundliData) => {
    const predictions = [];
    
    // Always add lunar predictions for demonstration
    predictions.push({
      condition: 'अनाफा: चंद्रमा से 12वें भाव में स्थित एक ग्रह (सूर्य को छोड़कर)',
      interpretation: 'अनफा योग में जन्म लेने वाला व्यक्ति वाकपटु, उदार, गुणवान, भोजन, पेय, पुष्प, वस्त्र और स्त्रियों का भोग करने वाला, प्रसिद्ध, शांत स्वभाव वाला, प्रसन्न, प्रसन्न और सुंदर शरीर वाला होता है।'
    });
    
    predictions.push({
      condition: 'शुक्र के कारण अनफा योग',
      interpretation: 'इस योग का कारण बनने वाला शुक्र जातक को स्त्रियों के प्रति अत्यधिक आकर्षण प्रदान करता है। जातक राजा का प्रिय और सुख-सुविधाओं का आनंद लेने वाला होता है। वह वैभवशाली, प्रसिद्ध और प्रचुर स्वर्ण से युक्त होता है।'
    });
    
    predictions.push({
      condition: 'शनि के कारण अनफा योग',
      interpretation: 'यदि शनि इस योग का कारण बनता है, तो व्यक्ति चौड़े कंधों वाला, नेता होगा, अपनी प्रतिबद्धताओं को बनाए रखने के लिए प्रेरित होगा, चौपायों से समृद्ध होगा, बदनाम महिला के प्रति समर्पित होगा और गुणी होगा।'
    });
    
    return predictions;
  };

  // Generate Nabhasa (Saravali) predictions
  const generateNabhasaPredictions = (kundliData) => {
    const predictions = [];
    
    // Check for Damini Yoga (all planets in 6 signs)
    const planets = kundliData.planets;
    const signs = new Set();
    
    Object.entries(planets).forEach(([planet, data]) => {
      if (planet !== 'Ascendant') {
        signs.add(data.rasi);
      }
    });
    
    if (signs.size === 6) {
      predictions.push({
        condition: 'सांख्य/दामिनी: सभी ग्रह 6 राशियों में',
        interpretation: 'दामिनी योग। इस योग में जन्म लेने वाला व्यक्ति सहायक, पशु वाला, धन का स्वामी, मूर्ख, अनेक पुत्रों और रत्नों वाला, साहसी और विद्वान होता है।'
      });
    }
    
    return predictions;
  };

  // Generate RasiPosition (Saravali) predictions
  const generateRasiPositionPredictions = (kundliData) => {
    const predictions = [];
    
    // Always add rasi position predictions for demonstration
    predictions.push({
      condition: 'सूर्य मिथुन राशि में',
      interpretation: 'मिथुन राशि में सूर्य होने पर व्यक्ति विद्वान, मधुर वाणी वाला, स्नेही (विशेषकर संतान से) होता है, उसका आचरण अच्छा होता है, वह शास्त्रों में निपुण होता है, वह अत्यधिक धनवान, उदार, कुशल, ज्योतिषी, साधारण दिखने वाला, दो माताओं वाला, भाग्यशाली और विनम्र होता है।'
    });
    
    predictions.push({
      condition: 'चंद्र सिंह राशि में',
      interpretation: 'यदि चन्द्रमा सिंह राशि में हो तो व्यक्ति मजबूत हड्डियों वाला, विरल बाल वाला, चौड़ा चेहरा वाला, छोटी और पीली आंखें वाला, स्त्रियों से घृणा करने वाला, भूख और प्यास से पीड़ित, पेट के रोग और दांतों में सड़न वाला, मांस खाने वाला, दानशील, कठोर, कम पुत्र वाला, जंगलों और पहाड़ों में यौन संबंध बनाने वाला, अपनी मां के प्रति आदरभाव रखने वाला, चौड़ी छाती वाला, वीर, कर्तव्यपरायण और राजसी रूप वाला होगा।'
    });
    
    predictions.push({
      condition: 'मंगल मेष राशि में',
      interpretation: 'यदि जन्म के समय मंगल मेष राशि में हो तो जातक तेजस्वी, सत्यवादी, पराक्रमी, राजा, युद्ध प्रिय, साहसिक कार्यों में रुचि रखने वाला, सेनापति, ग्राम या दल का मुखिया, प्रसन्नचित्त, दानशील, अनेक गाय, बकरी आदि तथा अन्न से संपन्न, उग्र स्वभाव वाला तथा अनेक स्त्रियों से युक्त होगा।'
    });
    
    predictions.push({
      condition: 'बुध मिथुन राशि में',
      interpretation: 'जन्म के समय बुध मिथुन राशि में हो तो जातक शुभ स्वरूप वाला, मधुरभाषी, धनवान, कुशल वक्ता, सम्माननीय, सुख त्यागने वाला, कम सहवास करने वाला, दो पत्नियां वाला, तर्क-वितर्क में रुचि रखने वाला, वेद, शास्त्र आदि का ज्ञाता, कवि, स्वतंत्र, प्रिय, दानशील, कार्यकुशल, बहुत पुत्र और मित्रों वाला होता है।'
    });
    
    predictions.push({
      condition: 'गुरु वृश्चिक राशि में',
      interpretation: 'यदि जन्म के समय बृहस्पति वृश्चिक राशि में हो तो वह शास्त्रों का ज्ञाता, राजा, अनेक भाष्यों का भाष्यकार, कुशल, मंदिर और नगर बनवाने वाला, अनेक पत्नियां रखने वाला, किन्तु पुत्र कम होने वाला, रोगों से ग्रस्त, अनेक कष्टों से गुजरने वाला, अत्यन्त उग्र, दिखावटी, गुणवान, तथा घृणित कार्यों में लिप्त रहने वाला होगा।'
    });
    
    predictions.push({
      condition: 'शुक्र कर्क राशि में',
      interpretation: 'यदि किसी के जन्म के समय शुक्र कर्क राशि में हो तो वह बुद्धिमान, गुणवान, विद्वान, बलवान, कोमल, पुरुषों में श्रेष्ठ, इच्छित सुख और धन से युक्त, सुन्दर, न्यायप्रिय, स्त्री और मद्य के कारण बहुत परेशान और पारिवारिक क्लेशों से दुखी होगा।'
    });
    
    predictions.push({
      condition: 'शनि कर्क राशि में',
      interpretation: 'यदि शनि कर्क राशि में हो तो जातक प्रिय पत्नी वाला, बाल्यकाल में धनहीन, अनेक रोगों से ग्रस्त, विद्वान, मातृहीन, मृदुभाषी, कर्मों में श्रेष्ठ, सदैव रोगों से ग्रस्त, दूसरों को कष्ट देने वाला, स्वजनों से शत्रुता रखने वाला, कुटिल, मध्य जीवन में राजसी तथा सुखों का भोग करने वाला होता है।'
    });
    
    return predictions;
  };

  // Generate Vimsottari Dasha predictions
  const generateVimsottariDashaPredictions = (kundliData) => {
    const sections = [];
    
    // Dasha Period Information
    sections.push({
      title: 'Dasha Period Information',
      predictions: [
        {
          condition: 'Maha Dasa',
          interpretation: 'Dasa Lord: Rahu | Start Date: 2024-07-04T11:47:15.853+05:30 | End Date: 2042-07-04T20:24:49.651+05:30'
        }
      ]
    });
    
    // BPHS Analysis
    sections.push({
      title: 'BPHS - राहु दास प्रभाव',
      predictions: [
        {
          condition: 'BPHS विश्लेषण',
          interpretation: 'राहु के दास के प्रभावों को स्पष्ट करने के लिए मैं सबसे पहले राहु और केतु के उत्थान और दुर्बलता राशियों का उल्लेख करूंगा। राहु का उत्कर्ष रासी वृषभ है। केतु का उत्कर्ष रासी वृश्चिक है। राहु और केतु के बहुकोण मिथुन और धनु हैं। राहु और केतु के स्वयं के राशी कुंभ और वृश्चिक हैं। कुछ ऋषियों ने यह विचार व्यक्त किया है कि कन्या राहु की स्वयं की रासी है और मीन केतु की स्वयं की रासी है। क्या राहु को अपने उत्थान रासी आदि में होना चाहिए, राहु के दास के दौरान धन, कृषि उत्पादों आदि के अधिग्रहण से बहुत खुशी होगी, मित्रों और सरकार की मदद से संप्रेषण का अधिग्रहण होगा, एक नया घर का निर्माण होगा, बेटों (बच्चों) का जन्म होगा, धार्मिक झुकाव होगा, विदेशों की सरकार से मान्यता होगी और धन, कपड़े आदि का लाभ होगा। यदि राहु लाभार्थियों से जुड़ा हुआ है, या दृष्टि प्राप्त करता है, तो लाभकारी राशी में हो और तनु, बंधु, युवति, कर्म, लाभ, या सहज में हो, उसके दास के दौरान सरकार के उपकार, विदेशी सरकार के माध्यम से धन का अधिग्रहण, या घर पर संप्रभुता और प्रसन्नता से सभी प्रकार की सुविधाएं होंगी। यदि राहु रणध्रा, या व्यय भाव में है, तो उसके दास के दौरान सभी प्रकार की परेशानियां और संकट होंगे। यदि राहु किसी दुष्ट, या मरक ग्रह से जुड़ा हुआ है, या उसकी दुर्बलता रासी में है, तो स्थिति का नुकसान होगा, उसके आवासीय घर का विनाश होगा, मानसिक पीड़ा होगी, पत्नी और बच्चों के लिए परेशानी और खराब भोजन पाने का दुर्भाग्य। दास के आरंभ में धन की हानि होगी, अपने ही देश में कुछ राहत और धन की प्राप्ति होगी और दास के अंतिम भाग के दौरान संकट और चिंताओं का सामना करना पड़ेगा।'
        }
      ]
    });
    
    // JatakaParijata Analysis
    sections.push({
      title: 'JatakaParijata - राहु दास विश्लेषण',
      predictions: [
        {
          condition: 'JatakaParijata श्लोक विश्लेषण',
          interpretation: 'श्लोक 96. आराम, खुशी, सुख और सांसारिक स्थिति जैसी चीजों का नुकसान, पत्नी, बच्चों और रिश्तेदारों के साथ बिदाई का दर्द, चरम में बीमारी, एक अजीब भूमि में निवास, और झगड़ा करने का स्वभाव राहु लाता है। श्लोक 106. ज्योतिषियों का कहना है कि कर्क, वृषभ या मेष राशि पर कब्जा करने वाला राहु, अपने दास धन और मक्का के पकने, उन्नयन और मनोरंजन, संप्रभु, पत्नियों से सम्मान के दौरान संबंधित व्यक्ति को सुरक्षित करेगा, नौकर और आश्रित खुश और खुश हैं। श्लोक 107. ज्योतिषियों का कहना है कि कन्या, मीना, या धनु में राहु अपनी दासा पत्नी और बच्चों, भूमि के आधिपत्य और पुरुषों द्वारा खींची गई गाड़ी के दौरान संबंधित व्यक्ति को देता है। ये सभी दास के समापन पर खो जाने के लिए उत्तरदायी हैं। श्लोक 108. जब राहु सिंह, कन्या या कर्क राशि में होता है, तो कोई व्यक्ति अपने दासा के पकने के दौरान राजा या राजा का सहकर्मी बन जाता है; वह हाथियों और घोड़ों से बनी सेना को आदेश देगा, अत्यधिक लाभकारी होगा, अत्यधिक धनवान, आनंद के लिए समर्पित और अपनी पत्नी और बच्चों से बहुत जुड़ा हुआ। श्लोक 109. राहुदास की शुरुआत में, एक व्यक्ति संकट से पीड़ित होता है; इसके बीच में, वह बहुत आनंद ले सकता है; लेकिन अंत में, वह अपने माता - पिता से शोकित हो सकता है और यहां तक कि अपनी स्थिति भी खो सकता है।'
        }
      ]
    });
    
    // General Dasha Effects
    sections.push({
      title: 'राहु दास सामान्य प्रभाव',
      predictions: [
        {
          condition: 'सामान्य प्रभाव',
          interpretation: 'राहु दास के दौरान व्यक्ति को विदेशी संबंधों, तकनीकी क्षेत्रों, और गुप्त कार्यों में सफलता मिल सकती है। इस अवधि में व्यक्ति की मानसिक स्थिति में उतार-चढ़ाव हो सकता है। राहु के प्रभाव से व्यक्ति को अप्रत्याशित लाभ और हानि दोनों का सामना करना पड़ सकता है। इस दास में व्यक्ति को अपने कार्यों में सावधानी बरतनी चाहिए और धर्म-कर्म पर विशेष ध्यान देना चाहिए।'
        }
      ]
    });
    
    return sections;
  };

  // Generate Antar Dasha predictions
  const generateAntarDashaPredictions = (kundliData) => {
    const sections = [];
    
    // Antar Dasha Period Information
    sections.push({
      title: 'Antar Dasha Period Information',
      predictions: [
        {
          condition: 'Antar Dasha',
          interpretation: 'Dasa Lord: Rahu | Start Date: 2024-07-04T11:47:15.853+05:30 | End Date: 2027-03-17T15:28:53.922+05:30'
        }
      ]
    });
    
    // PhalaDeepika Analysis
    sections.push({
      title: 'PhalaDeepika - राहु अंतरदशा प्रभाव',
      predictions: [
        {
          condition: 'PhalaDeepika विश्लेषण',
          interpretation: 'जल और विष के कारण बीमारी, सर्प दंश, दूसरे पुरुष की पत्नी के साथ सहवास, अपने प्रियजनों से वियोग या हानि, कठोर वाणी बोलना, तथा दुष्ट लोगों के कारण मानसिक पीड़ा, राहु की दशा में अंतरदशा के लक्षण होंगे।'
        }
      ]
    });
    
    // BPHS Analysis for Antar Dasha
    sections.push({
      title: 'BPHS - राहु अंतरदशा विश्लेषण',
      predictions: [
        {
          condition: 'BPHS अंतरदशा प्रभाव',
          interpretation: 'यदि राहु कर्क, वृश्चिक, कन्या या धनु राशि में हो और सहज, अरि, कर्म या लाभ में हो, या अपनी उच्च राशि में योगकारक ग्रह से युति हो, तो राहु की दशा में राहु की अंतर्दशा में राज्य प्राप्ति, उत्साह, राजा से मधुर संबंध, पत्नी और संतान से सुख और संपत्ति में वृद्धि जैसे प्रभाव प्राप्त होंगे। यदि राहु रंध्र या व्यय में हो, या पाप ग्रहों से युक्त हो, तो चोरों से भय, घावों से कष्ट, सरकारी अधिकारियों से विरोध, स्वजनों का नाश, पत्नी और संतान को कष्ट होगा। यदि राहु धन या युवती का स्वामी हो, या धन या युवती में हो, तो कष्ट और रोग होंगे। उपरोक्त बुरे प्रभावों से राहत पाने के लिए राहु की पूजा (उनके मंत्रों के जाप द्वारा) और राहु से संबंधित या उसके द्वारा शासित वस्तुओं का दान करना चाहिए।'
        }
      ]
    });
    
    // JatakaParijata Analysis for Antar Dasha
    sections.push({
      title: 'JatakaParijata - राहु अंतरदशा विश्लेषण',
      predictions: [
        {
          condition: 'JatakaParijata श्लोक 97',
          interpretation: 'श्लोक 97. राहु की दशा में पत्नी की बीमारी, विवाद, बुद्धि की विफलता, धन की बर्बादी, दूर देश में भटकना और संकट राहु की भुक्ति के लक्षण होंगे।'
        }
      ]
    });
    
    // General Antar Dasha Effects
    sections.push({
      title: 'राहु अंतरदशा सामान्य प्रभाव',
      predictions: [
        {
          condition: 'अंतरदशा सामान्य प्रभाव',
          interpretation: 'राहु की अंतरदशा के दौरान व्यक्ति को मानसिक उतार-चढ़ाव, अप्रत्याशित घटनाएं, और तकनीकी क्षेत्रों में सफलता मिल सकती है। इस अवधि में व्यक्ति को अपने कार्यों में सावधानी बरतनी चाहिए और धर्म-कर्म पर विशेष ध्यान देना चाहिए। राहु के प्रभाव से व्यक्ति को विदेशी संबंधों और गुप्त कार्यों में सफलता मिल सकती है।'
        }
      ]
    });
    
    return sections;
  };

  if (loading) {
    return (
      <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white">Generating Comprehensive Kundli...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
        <div className="text-red-400 text-center">
          <p className="text-lg font-semibold mb-2">❌ Error</p>
          <p>{error}</p>
          <button
            onClick={generateKundli}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!kundliData) {
    return (
      <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
        <div className="text-center">
          <p className="text-white mb-4">
            {swissephLoaded ? 'Ready to generate your Comprehensive Kundli' : 'Loading astronomical engine...'}
          </p>
          {swissephLoaded && (
            <button
              onClick={generateKundli}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Generate Comprehensive Kundli
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-xl p-6 shadow-2xl border border-purple-500/20 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {kundliData.name}'s Comprehensive Vedic Kundli
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${currentTheme.colors.hover} transition-all duration-200`}
          >
            <svg className="w-5 h-5 text-white/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
        {[
          { id: 'details', label: 'Birth Details & Planetary Positions' },
          { id: 'kundali', label: 'Kundali' },
          { id: 'other', label: 'Other Kundali' },
          { id: 'panchanga', label: 'Panchanga' },
          { id: 'predictions', label: 'Detailed Predictions' },
          { id: 'dasha', label: 'Vimsottari Dasha' },
          { id: 'antar', label: 'Antar Dasha' },
          { id: 'upagrahas', label: 'Upagrahas & Kalavelas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-purple-200 hover:text-white hover:bg-purple-500/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Birth Details & Planetary Positions
          </h3>
          
          {/* Birth Details Section */}
          <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
            <h4 className="text-lg font-semibold text-purple-300 mb-4">Birth Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-purple-300">Name</p>
                <p className="text-white font-medium">{kundliData.name}</p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Date & Time</p>
                <p className="text-white font-medium">
                  {new Date(kundliData.birthData.datetime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Location</p>
                <p className="text-white font-medium">
                  {kundliData.birthData.latitude}°N, {kundliData.birthData.longitude}°E
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-300">Generated</p>
                <p className="text-white font-medium">
                  {new Date(kundliData.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Planetary Positions Section */}
          <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
            <h4 className="text-lg font-semibold text-purple-300 mb-4">Information Chart</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-purple-500/30">
                <thead>
                  <tr className="bg-slate-800/60 backdrop-blur-sm">
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Planets</th>
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Positions</th>
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Degrees</th>
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Rasi</th>
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Rasi Lord</th>
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Nakshatra</th>
                    <th className="border border-purple-500/30 px-4 py-2 text-left text-purple-200 font-semibold">Nakshatra Lord</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(kundliData.planets).map(([planet, data]) => {
                    const getRasiName = (rasiNum) => {
                      const rasiNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                      return rasiNames[rasiNum - 1] || `Rasi ${rasiNum}`;
                    };
                    
                    const getNakshatraName = (nakshatraNum) => {
                      const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
                                            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'PurvaPhalguni', 'UttaraPhalguni',
                                            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
                                            'Mula', 'PurvaAshadha', 'UttaraAshadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
                                            'PurvaBhadra', 'UttaraBhadra', 'Revati'];
                      return nakshatraNames[nakshatraNum - 1] || `Nakshatra ${nakshatraNum}`;
                    };
                    
                    const getRasiLord = (rasiNum) => {
                      const rasiLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
                                       'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
                      return rasiLords[rasiNum - 1] || 'Unknown';
                    };
                    
                    const getNakshatraLord = (nakshatraNum) => {
                      const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
                                           'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
                                           'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
                                           'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
                                           'Jupiter', 'Saturn', 'Mercury'];
                      return nakshatraLords[nakshatraNum - 1] || 'Unknown';
                    };
                    
                    const formatDegrees = (degrees) => {
                      const deg = Math.floor(degrees);
                      const min = Math.floor((degrees - deg) * 60);
                      const sec = Math.floor(((degrees - deg) * 60 - min) * 60);
                      return `${deg}° ${min}′ ${sec}″`;
                    };
                    
                    return (
                      <tr key={planet} className="hover:bg-purple-500/10 transition-colors">
                        <td className="border border-purple-500/30 px-4 py-2 font-semibold text-white">{planet}</td>
                        <td className="border border-purple-500/30 px-4 py-2 text-purple-100">{formatDegrees(data.longitude)}</td>
                        <td className="border border-purple-500/30 px-4 py-2 text-purple-100">{formatDegrees(data.degrees)}</td>
                        <td className="border border-purple-500/30 px-4 py-2 text-purple-100">{getRasiName(data.rasi)}</td>
                        <td className="border border-purple-500/30 px-4 py-2 text-purple-100">{getRasiLord(data.rasi)}</td>
                        <td className="border border-purple-500/30 px-4 py-2 text-purple-100">{getNakshatraName(data.nakshatra)}</td>
                        <td className="border border-purple-500/30 px-4 py-2 text-purple-100">{getNakshatraLord(data.nakshatra)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'panchanga' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Panchanga (Calculated using Swiss Ephemeris)
          </h3>
          
          {kundliData.panchanga && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tithi */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Tithi (Lunar Day)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Number:</span>
                    <span className="text-white">{kundliData.panchanga.tithi.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Name:</span>
                    <span className="text-white">{kundliData.panchanga.tithi.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Paksha:</span>
                    <span className="text-white">{kundliData.panchanga.tithi.paksha}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Degrees:</span>
                    <span className="text-white">{kundliData.panchanga.tithi.degrees.toFixed(2)}°</span>
                  </div>
                </div>
              </div>

              {/* Nakshatra */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Nakshatra (Lunar Mansion)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Number:</span>
                    <span className="text-white">{kundliData.panchanga.nakshatra.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Name:</span>
                    <span className="text-white">{kundliData.panchanga.nakshatra.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Lord:</span>
                    <span className="text-white">{kundliData.panchanga.nakshatra.lord}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Pada:</span>
                    <span className="text-white">{kundliData.panchanga.nakshatra.pada}</span>
                  </div>
                </div>
              </div>

              {/* Yoga */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Yoga (Sun + Moon)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Number:</span>
                    <span className="text-white">{kundliData.panchanga.yoga.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Name:</span>
                    <span className="text-white">{kundliData.panchanga.yoga.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Degrees:</span>
                    <span className="text-white">{kundliData.panchanga.yoga.degrees.toFixed(2)}°</span>
                  </div>
                </div>
              </div>

              {/* Karana */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Karana (Half Tithi)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Number:</span>
                    <span className="text-white">{kundliData.panchanga.karana.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Name:</span>
                    <span className="text-white">{kundliData.panchanga.karana.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Type:</span>
                    <span className="text-white">{kundliData.panchanga.karana.isFixed ? 'Fixed' : 'Movable'}</span>
                  </div>
                </div>
              </div>

              {/* Vara */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Vara (Weekday)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Number:</span>
                    <span className="text-white">{kundliData.panchanga.vara.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Name:</span>
                    <span className="text-white">{kundliData.panchanga.vara.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Lord:</span>
                    <span className="text-white">{kundliData.panchanga.vara.lord}</span>
                  </div>
                </div>
              </div>

              {/* Rise/Set Times */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Rise/Set Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Sun Rise:</span>
                    <span className="text-white">{kundliData.panchanga.riseSetTimes.sun.rise}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Sun Set:</span>
                    <span className="text-white">{kundliData.panchanga.riseSetTimes.sun.set}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Moon Rise:</span>
                    <span className="text-white">{kundliData.panchanga.riseSetTimes.moon.rise}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Moon Set:</span>
                    <span className="text-white">{kundliData.panchanga.riseSetTimes.moon.set}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'kundali' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Kundali Charts
          </h3>
          
          {/* Birth Chart (D1) and Navamsa Chart (D9) side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Birth Chart (D1) */}
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                Birth Chart (D1)
              </h4>
              <div className="text-center">
                <svg 
                  id="kundali-svg"
                  width="400" 
                  height="400" 
                  viewBox="0 0 500 500"
                  className="mx-auto"
                  style={{ maxWidth: '400px', maxHeight: '400px' }}
                >
                  {/* The Birth Chart will be rendered here by KundaliSVG */}
                  {!kundaliChart && (
                    <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                      Loading Birth Chart...
                    </text>
                  )}
                </svg>
              </div>
            </div>

            {/* Navamsa Chart (D9) */}
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                Navamsa Chart (D9)
              </h4>
              <div className="text-center">
                <svg 
                  id="kundali-d9-svg"
                  width="400" 
                  height="400" 
                  viewBox="0 0 500 500"
                  className="mx-auto"
                  style={{ maxWidth: '400px', maxHeight: '400px' }}
                >
                  {/* The Navamsa Chart will be rendered here by KundaliSVG */}
                  {!d9Chart && (
                    <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                      Loading Navamsa Chart...
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'other' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Other Kundali Charts
          </h3>
          
          {/* All remaining charts in a grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hora Chart (D2) */}
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                Hora Chart (D2)
              </h4>
              <div className="text-center">
                <svg 
                  id="kundali-d2-svg"
                  width="350" 
                  height="350" 
                  viewBox="0 0 500 500"
                  className="mx-auto"
                  style={{ maxWidth: '350px', maxHeight: '350px' }}
                >
                  {/* The D2 chart will be rendered here by KundaliSVG */}
                  {!d2Chart && (
                    <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                      Loading D2 Chart...
                    </text>
                  )}
                </svg>
              </div>
            </div>

            {/* Shashthamsa Chart (D6) */}
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                Shashthamsa Chart (D6)
              </h4>
              <div className="text-center">
                <svg 
                  id="kundali-d6-svg"
                  width="350" 
                  height="350" 
                  viewBox="0 0 500 500"
                  className="mx-auto"
                  style={{ maxWidth: '350px', maxHeight: '350px' }}
                >
                  {/* The D6 chart will be rendered here by KundaliSVG */}
                  {!d6Chart && (
                    <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                      Loading D6 Chart...
                    </text>
                  )}
                </svg>
              </div>
            </div>

            {/* Ashthamsa Chart (D8) */}
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                Ashthamsa Chart (D8)
              </h4>
              <div className="text-center">
                <svg 
                  id="kundali-d8-svg"
                  width="350" 
                  height="350" 
                  viewBox="0 0 500 500"
                  className="mx-auto"
                  style={{ maxWidth: '350px', maxHeight: '350px' }}
                >
                  {/* The D8 chart will be rendered here by KundaliSVG */}
                  {!d8Chart && (
                    <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                      Loading D8 Chart...
                    </text>
                  )}
                </svg>
              </div>
            </div>

            {/* Dwadashamsa Chart (D12) */}
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-300 mb-4 text-center">
                Dwadashamsa Chart (D12)
              </h4>
              <div className="text-center">
                <svg 
                  id="kundali-d12-svg"
                  width="350" 
                  height="350" 
                  viewBox="0 0 500 500"
                  className="mx-auto"
                  style={{ maxWidth: '350px', maxHeight: '350px' }}
                >
                  {/* The D12 chart will be rendered here by KundaliSVG */}
                  {!d12Chart && (
                    <text x="250" y="250" textAnchor="middle" fill="#666" fontSize="16">
                      Loading D12 Chart...
                    </text>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Detailed Astrological Predictions
          </h3>
          <div className="space-y-4">
            {kundliData && generateDetailedPredictions(kundliData).map((section, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">{section.title}</h4>
                <div className="space-y-2">
                  {section.predictions.map((prediction, predIndex) => (
                    <div key={predIndex} className="text-sm text-gray-300 leading-relaxed">
                      <span className="text-purple-400 font-medium">{prediction.condition}</span>
                      <span className="text-white"> ➡ </span>
                      <span className="text-gray-200">{prediction.interpretation}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'dasha' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Vimsottari Dasha Analysis
          </h3>
          <div className="space-y-4">
            {kundliData && generateVimsottariDashaPredictions(kundliData).map((section, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">{section.title}</h4>
                <div className="space-y-2">
                  {section.predictions.map((prediction, predIndex) => (
                    <div key={predIndex} className="text-sm text-gray-300 leading-relaxed">
                      <span className="text-purple-400 font-medium">{prediction.condition}</span>
                      <span className="text-white"> ➡ </span>
                      <span className="text-gray-200">{prediction.interpretation}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'antar' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Antar Dasha Analysis
          </h3>
          <div className="space-y-4">
            {kundliData && generateAntarDashaPredictions(kundliData).map((section, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">{section.title}</h4>
                <div className="space-y-2">
                  {section.predictions.map((prediction, predIndex) => (
                    <div key={predIndex} className="text-sm text-gray-300 leading-relaxed">
                      <span className="text-purple-400 font-medium">{prediction.condition}</span>
                      <span className="text-white"> ➡ </span>
                      <span className="text-gray-200">{prediction.interpretation}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Print Kundli
        </button>
        <button
          onClick={() => {
            const dataStr = JSON.stringify(kundliData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${kundliData.name}-comprehensive-kundli.json`;
            link.click();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Download Data
        </button>
      </div>

      {activeTab === 'upagrahas' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">
            Upagrahas & Kalavelas (Calculated using Swiss Ephemeris)
          </h3>
          
          {kundliData.upagrahasAndKalavelas && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upagrahas */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-4">Upagrahas</h4>
                <div className="space-y-3">
                  {Object.entries(kundliData.upagrahasAndKalavelas.upagrahas).map(([name, data]) => (
                    <div key={name} className="bg-slate-700/30 rounded-lg p-3">
                      <h5 className="text-md font-semibold text-purple-200 mb-2">{name}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Longitude:</span>
                          <span className="text-white">{data.longitude.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Rasi:</span>
                          <span className="text-white">{data.rasi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">House:</span>
                          <span className="text-white">{data.house}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Nakshatra:</span>
                          <span className="text-white">{data.nakshatra}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kalavelas */}
              <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-purple-300 mb-4">Kalavelas</h4>
                <div className="space-y-3">
                  {Object.entries(kundliData.upagrahasAndKalavelas.kalavelas).map(([name, data]) => (
                    <div key={name} className="bg-slate-700/30 rounded-lg p-3">
                      <h5 className="text-md font-semibold text-purple-200 mb-2">{name}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Longitude:</span>
                          <span className="text-white">{data.longitude.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Rasi:</span>
                          <span className="text-white">{data.rasi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">House:</span>
                          <span className="text-white">{data.house}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Nakshatra:</span>
                          <span className="text-white">{data.nakshatra}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
