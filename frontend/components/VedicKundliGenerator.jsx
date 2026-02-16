"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function VedicKundliGenerator({ birthData, onClose }) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Swiss Ephemeris WebAssembly
  useEffect(() => {
    const initializeSwissEphemeris = async () => {
      try {
        // Load Swiss Ephemeris WebAssembly
        const swisseph = await import('sweph-wasm');
        window.swe = swisseph;
        console.log('✅ Swiss Ephemeris loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load Swiss Ephemeris:', err);
        setError('Failed to load astronomical calculation engine');
      }
    };

    initializeSwissEphemeris();
  }, []);

  // Generate Kundli using VedicJyotish
  const generateKundli = async () => {
    if (!window.swe) {
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

      // Calculate Kundli using VedicJyotish algorithm
      const kundliResult = await calculateVedicKundli({
        datetime: birthDateTime,
        longitude: parseFloat(birthData.longitude),
        latitude: parseFloat(birthData.latitude),
        altitude: 0
      });

      setKundliData(kundliResult);
    } catch (err) {
      console.error('❌ Kundli generation failed:', err);
      setError('Failed to generate Kundli. Please check your birth details.');
    } finally {
      setLoading(false);
    }
  };

  // VedicJyotish Kundli calculation
  const calculateVedicKundli = async (params) => {
    const { datetime, longitude, latitude, altitude } = params;
    
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

    // Calculate houses
    const { ascmc } = window.swe.swe_houses(
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

    for (const [name, id] of Object.entries(planetIds)) {
      const result = window.swe.swe_calc_ut(tjd_ut, id, window.swe.SEFLG_SWIEPH | window.swe.SEFLG_SPEED | window.swe.SEFLG_SIDEREAL);
      planets[name] = {
        longitude: result[0],
        latitude: result[1],
        distance: result[2],
        speed: result[3]
      };
    }

    // Calculate Ascendant
    planets['Ascendant'] = {
      longitude: ascmc[0],
      latitude: 0,
      distance: 0,
      speed: 0
    };

    // Calculate Rasi (Zodiac signs)
    const rasiPositions = {};
    for (const [name, data] of Object.entries(planets)) {
      rasiPositions[name] = Math.floor(data.longitude / 30) + 1;
    }

    // Calculate Nakshatra
    const nakshatraPositions = {};
    for (const [name, data] of Object.entries(planets)) {
      nakshatraPositions[name] = Math.floor(data.longitude / 13.333333) + 1;
    }

    return {
      planets,
      rasiPositions,
      nakshatraPositions,
      houses: ascmc,
      birthData: params,
      generatedAt: new Date().toISOString()
    };
  };

  // Auto-generate Kundli when component mounts
  useEffect(() => {
    if (birthData && window.swe) {
      generateKundli();
    }
  }, [birthData, window.swe]);

  if (loading) {
    return (
      <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white">Generating Kundli...</span>
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
          <p className="text-white mb-4">Ready to generate your Kundli</p>
          <button
            onClick={generateKundli}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Generate Kundli
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.colors.surface} rounded-lg p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${currentTheme.colors.text}`}>
          Your Vedic Kundli
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

      {/* Planetary Positions */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${currentTheme.colors.text} mb-4`}>
          Planetary Positions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(kundliData.planets).map(([planet, data]) => (
            <div key={planet} className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
              <h4 className={`font-semibold ${currentTheme.colors.text} mb-2`}>{planet}</h4>
              <div className={`text-sm ${currentTheme.colors.textSecondary} space-y-1`}>
                <p>Longitude: {data.longitude.toFixed(2)}°</p>
                <p>Rasi: {kundliData.rasiPositions[planet]}</p>
                <p>Nakshatra: {kundliData.nakshatraPositions[planet]}</p>
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
            link.download = 'kundli-data.json';
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
