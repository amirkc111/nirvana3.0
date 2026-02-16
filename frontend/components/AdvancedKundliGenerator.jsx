"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function AdvancedKundliGenerator({ birthData, onClose, onError }) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swissephLoaded, setSwissephLoaded] = useState(false);

  // Initialize Swiss Ephemeris WebAssembly
  useEffect(() => {
    const initializeSwissEphemeris = async () => {
      try {
        console.log('🔄 Initializing Swiss Ephemeris...');
        
        // Initialize Swiss Ephemeris with correct paths
        const swisseph = await import('sweph-wasm');
        
        await swisseph.default({
          locateFile: (path) => {
            console.log('📍 Locating file:', path);
            if (path.endsWith('.wasm')) {
              return '/swisseph/assets/swisseph.wasm';
            }
            if (path.endsWith('.se1')) {
              return `/swisseph/assets/ephe/${path}`;
            }
            return path;
          }
        });
        
        window.swe = swisseph;
        setSwissephLoaded(true);
        console.log('✅ Swiss Ephemeris loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load Swiss Ephemeris:', err);
        setError(`Failed to load astronomical calculation engine: ${err.message}`);
        if (onError) {
          onError();
        }
      }
    };

    initializeSwissEphemeris();
  }, []);

  // Generate Kundli using advanced VedicJyotish calculations
  const generateKundli = async () => {
    if (!swissephLoaded || !window.swe) {
      setError('Swiss Ephemeris not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert birth data to required format
      const birthDateTime = new Date(
        birthData.birthYear,
        birthData.birthMonth - 1,
        birthData.birthDay,
        birthData.birthHour,
        birthData.birthMinute,
        birthData.birthSecond
      );

      // Calculate Kundli using advanced VedicJyotish algorithm
      const kundliResult = await calculateAdvancedKundli({
        datetime: birthDateTime,
        longitude: parseFloat(birthData.longitude),
        latitude: parseFloat(birthData.latitude),
        altitude: 0,
        name: birthData.name
      });

      setKundliData(kundliResult);
    } catch (err) {
      console.error('❌ Kundli generation failed:', err);
      setError('Failed to generate Kundli. Please check your birth details.');
    } finally {
      setLoading(false);
    }
  };

  // Advanced VedicJyotish Kundli calculation
  const calculateAdvancedKundli = async (params) => {
    const { datetime, longitude, latitude, altitude, name } = params;
    
    // Set sidereal mode (Lahiri Ayanamsa)
    window.swe.swe_set_sid_mode(window.swe.SE_SIDM_LAHIRI, 0, 0);
    
    // Set topocentric coordinates
    window.swe.swe_set_topo(longitude, latitude, altitude);
    
    // Convert to Julian Day
    const utc_dt = new Date(datetime);
    const tjd_ut = window.swe.swe_utc_to_jd(
      utc_dt.getUTCFullYear(),
      utc_dt.getUTCMonth() + 1,
      utc_dt.getUTCDate(),
      utc_dt.getUTCHours(),
      utc_dt.getUTCMinutes(),
      utc_dt.getUTCSeconds(),
      window.swe.SE_GREG_CAL
    )[1];

    // Calculate houses using Placidus system
    const { ascmc, cusps } = window.swe.swe_houses(
      tjd_ut,
      latitude,
      longitude,
      "P" // Placidus house system
    );

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

    for (const [name, id] of Object.entries(planetIds)) {
      const result = window.swe.swe_calc_ut(tjd_ut, id, IFLAGS);
      planets[name] = {
        longitude: result[0],
        latitude: result[1],
        distance: result[2],
        speed: result[3],
        rasi: Math.floor(result[0] / 30) + 1,
        nakshatra: Math.floor(result[0] / 13.333333) + 1
      };
    }

    // Calculate Ascendant
    planets['Ascendant'] = {
      longitude: ascmc[0],
      latitude: 0,
      distance: 0,
      speed: 0,
      rasi: Math.floor(ascmc[0] / 30) + 1,
      nakshatra: Math.floor(ascmc[0] / 13.333333) + 1
    };

    // Calculate house positions for each planet
    const planetHouses = {};
    for (const [name, data] of Object.entries(planets)) {
      planetHouses[name] = calculateHousePosition(data.longitude, cusps);
    }

    // Calculate Dasha periods (Vimsottari Dasa)
    const dasaData = calculateVimsottariDasa(tjd_ut, planets.Moon.longitude);

    return {
      name,
      planets,
      houses: cusps,
      planetHouses,
      dasaData,
      birthData: params,
      generatedAt: new Date().toISOString()
    };
  };

  // Calculate which house a planet is in
  const calculateHousePosition = (planetLongitude, cusps) => {
    for (let i = 0; i < 12; i++) {
      const nextHouse = (i + 1) % 12;
      const currentCusp = cusps[i];
      const nextCusp = cusps[nextHouse];
      
      // Handle the 12th house (crosses 0°)
      if (nextHouse === 0) {
        if (planetLongitude >= currentCusp || planetLongitude < nextCusp) {
          return i + 1;
        }
      } else {
        if (planetLongitude >= currentCusp && planetLongitude < nextCusp) {
          return i + 1;
        }
      }
    }
    return 1; // Default to 1st house
  };

  // Calculate Vimsottari Dasa
  const calculateVimsottariDasa = (tjd_ut, moonLongitude) => {
    // Simplified Vimsottari Dasa calculation
    const dasaPeriods = {
      'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7,
      'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17
    };
    
    const dasaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    
    // Calculate current dasa
    const totalDasaYears = 120; // Total Vimsottari Dasa period
    const currentAge = (tjd_ut - 2451545.0) / 365.25; // Simplified age calculation
    const dasaProgress = (currentAge % totalDasaYears) / totalDasaYears;
    
    let cumulativeYears = 0;
    let currentDasa = 'Ketu';
    let currentDasaYears = 0;
    
    for (const dasa of dasaOrder) {
      const dasaYears = dasaPeriods[dasa];
      if (cumulativeYears + dasaYears > dasaProgress * totalDasaYears) {
        currentDasa = dasa;
        currentDasaYears = dasaYears;
        break;
      }
      cumulativeYears += dasaYears;
    }
    
    return {
      currentDasa,
      currentDasaYears,
      dasaProgress: (dasaProgress * totalDasaYears - cumulativeYears) / currentDasaYears
    };
  };

  // Auto-generate Kundli when component mounts
  useEffect(() => {
    if (birthData && swissephLoaded) {
      generateKundli();
    }
  }, [birthData, swissephLoaded]);

  if (loading) {
    return (
      <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white">Generating Advanced Kundli...</span>
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
            {swissephLoaded ? 'Ready to generate your Advanced Kundli' : 'Loading astronomical engine...'}
          </p>
          {swissephLoaded && (
            <button
              onClick={generateKundli}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Generate Advanced Kundli
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${currentTheme.colors.text}`}>
          {kundliData.name}'s Advanced Vedic Kundli
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

      {/* Dasha Information */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${currentTheme.colors.text} mb-4`}>
          Current Dasha Period
        </h3>
        <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Current Dasha</p>
              <p className={`text-lg font-semibold ${currentTheme.colors.text}`}>
                {kundliData.dasaData.currentDasa}
              </p>
            </div>
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Dasha Duration</p>
              <p className={`${currentTheme.colors.text}`}>
                {kundliData.dasaData.currentDasaYears} years
              </p>
            </div>
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Progress</p>
              <p className={`${currentTheme.colors.text}`}>
                {(kundliData.dasaData.dasaProgress * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Planetary Positions */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${currentTheme.colors.text} mb-4`}>
          Planetary Positions & Houses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(kundliData.planets).map(([planet, data]) => (
            <div key={planet} className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${currentTheme.colors.text} mb-2`}>{planet}</h4>
              <div className={`text-sm ${currentTheme.colors.textSecondary} space-y-1`}>
                <p>Longitude: {data.longitude.toFixed(2)}°</p>
                <p>Rasi: {data.rasi}</p>
                <p>Nakshatra: {data.nakshatra}</p>
                <p>House: {kundliData.planetHouses[planet]}</p>
                <p>Speed: {data.speed.toFixed(2)}°/day</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Birth Details */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${currentTheme.colors.text} mb-4`}>
          Birth Details
        </h3>
        <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Name</p>
              <p className={`${currentTheme.colors.text}`}>{kundliData.name}</p>
            </div>
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Date & Time</p>
              <p className={`${currentTheme.colors.text}`}>
                {new Date(kundliData.birthData.datetime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Location</p>
              <p className={`${currentTheme.colors.text}`}>
                {kundliData.birthData.latitude}°N, {kundliData.birthData.longitude}°E
              </p>
            </div>
            <div>
              <p className={`text-sm ${currentTheme.colors.textSecondary}`}>Generated</p>
              <p className={`${currentTheme.colors.text}`}>
                {new Date(kundliData.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
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
            link.download = `${kundliData.name}-advanced-kundli.json`;
            link.click();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Download Data
        </button>
      </div>
    </div>
  );
}
