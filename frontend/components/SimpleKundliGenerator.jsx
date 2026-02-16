"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SimpleKundliGenerator({ birthData, onClose }) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate Kundli using simplified calculations
  const generateKundli = async () => {
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

      // Calculate basic Kundli data
      const kundliResult = await calculateBasicKundli({
        datetime: birthDateTime,
        longitude: parseFloat(birthData.longitude),
        latitude: parseFloat(birthData.latitude),
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

  // Basic Kundli calculation (simplified version)
  const calculateBasicKundli = async (params) => {
    const { datetime, longitude, latitude, name } = params;
    
    // Calculate basic planetary positions using simplified formulas
    const planets = {};
    
    // Get birth time in Julian Day
    const jd = getJulianDay(datetime);
    
    // Calculate Sun position (simplified)
    const sunLongitude = calculateSunLongitude(jd);
    planets['Sun'] = {
      longitude: sunLongitude,
      rasi: Math.floor(sunLongitude / 30) + 1,
      nakshatra: Math.floor(sunLongitude / 13.333333) + 1
    };

    // Calculate Moon position (simplified)
    const moonLongitude = calculateMoonLongitude(jd);
    planets['Moon'] = {
      longitude: moonLongitude,
      rasi: Math.floor(moonLongitude / 30) + 1,
      nakshatra: Math.floor(moonLongitude / 13.333333) + 1
    };

    // Calculate Ascendant (simplified)
    const ascendant = calculateAscendant(datetime, longitude, latitude);
    planets['Ascendant'] = {
      longitude: ascendant,
      rasi: Math.floor(ascendant / 30) + 1,
      nakshatra: Math.floor(ascendant / 13.333333) + 1
    };

    // Calculate other planets (simplified)
    const planetPositions = {
      'Mars': calculatePlanetPosition(jd, 4), // Mars
      'Mercury': calculatePlanetPosition(jd, 2), // Mercury
      'Jupiter': calculatePlanetPosition(jd, 5), // Jupiter
      'Venus': calculatePlanetPosition(jd, 3), // Venus
      'Saturn': calculatePlanetPosition(jd, 6), // Saturn
      'Rahu': calculatePlanetPosition(jd, 8), // Rahu
      'Ketu': calculatePlanetPosition(jd, 8) + 180 // Ketu (opposite to Rahu)
    };

    for (const [name, longitude] of Object.entries(planetPositions)) {
      planets[name] = {
        longitude: longitude % 360,
        rasi: Math.floor((longitude % 360) / 30) + 1,
        nakshatra: Math.floor((longitude % 360) / 13.333333) + 1
      };
    }

    // Calculate houses
    const houses = calculateHouses(ascendant);

    return {
      name,
      planets,
      houses,
      birthData: params,
      generatedAt: new Date().toISOString()
    };
  };

  // Helper functions for calculations
  const getJulianDay = (date) => {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  };

  const calculateSunLongitude = (jd) => {
    // Simplified Sun longitude calculation
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = (357.528 + 0.9856003 * n) * Math.PI / 180;
    const lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    return lambda % 360;
  };

  const calculateMoonLongitude = (jd) => {
    // Simplified Moon longitude calculation
    const n = jd - 2451545.0;
    const L = (218.316 + 13.176396 * n) % 360;
    const M = (134.963 + 13.064993 * n) * Math.PI / 180;
    const F = (93.272 + 13.229350 * n) * Math.PI / 180;
    const lambda = L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * F - M);
    return lambda % 360;
  };

  const calculateAscendant = (datetime, longitude, latitude) => {
    // Simplified Ascendant calculation
    const hour = datetime.getHours() + datetime.getMinutes() / 60;
    const ascendant = (hour * 15 + longitude) % 360;
    return ascendant;
  };

  const calculatePlanetPosition = (jd, planetId) => {
    // Simplified planetary position calculation
    const n = jd - 2451545.0;
    const baseLongitude = planetId * 51.4; // Simplified base positions
    const motion = n * (0.1 + planetId * 0.05); // Simplified motion
    return (baseLongitude + motion) % 360;
  };

  const calculateHouses = (ascendant) => {
    // Calculate 12 houses starting from Ascendant
    const houses = [];
    for (let i = 0; i < 12; i++) {
      houses.push((ascendant + i * 30) % 360);
    }
    return houses;
  };

  // Auto-generate Kundli when component mounts
  useEffect(() => {
    if (birthData) {
      generateKundli();
    }
  }, [birthData]);

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
          {kundliData.name}'s Vedic Kundli
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
                <p>Rasi: {data.rasi}</p>
                <p>Nakshatra: {data.nakshatra}</p>
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
            link.download = `${kundliData.name}-kundli.json`;
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
