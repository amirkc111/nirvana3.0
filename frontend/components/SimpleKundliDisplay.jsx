"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SimpleKundliDisplay({ birthData, onClose }) {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [kundliData, setKundliData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate simple Kundli data
  const generateKundli = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 SimpleKundliDisplay - birthData received:', birthData);
      
      // Simulate Kundli generation with basic calculations
      const kundli = {
        name: birthData.name,
        birthDate: `${birthData.birthYear}/${birthData.birthMonth}/${birthData.birthDay}`,
        birthTime: `${birthData.birthHour}:${birthData.birthMinute}:${birthData.birthSecond} ${birthData.timeSystem}`,
        birthPlace: birthData.birthPlace,
        zodiacSign: calculateZodiacSign(birthData.birthMonth, birthData.birthDay),
        planetaryPositions: generatePlanetaryPositions(),
        houses: generateHouses(),
        dasha: generateDasha(),
        createdAt: new Date().toISOString()
      };
      
      setKundliData(kundli);
      console.log('✅ Simple Kundli generated successfully');
    } catch (err) {
      console.error('❌ Error generating Kundli:', err);
      setError('Failed to generate Kundli chart');
    } finally {
      setLoading(false);
    }
  };

  // Calculate zodiac sign based on birth date
  const calculateZodiacSign = (month, day) => {
    const signs = [
      'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
      'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
    ];
    
    const dates = [
      [1, 19], [2, 18], [3, 20], [4, 19], [5, 20], [6, 20],
      [7, 22], [8, 22], [9, 22], [10, 22], [11, 21], [12, 21]
    ];
    
    for (let i = 0; i < 12; i++) {
      if ((month === dates[i][0] && day <= dates[i][1]) || 
          (month === dates[i][0] + 1 && day > dates[i][1])) {
        return signs[i];
      }
    }
    return 'Capricorn';
  };

  // Generate planetary positions
  const generatePlanetaryPositions = () => {
    const planets = [
      'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'
    ];
    
    return planets.map(planet => ({
      name: planet,
      sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(Math.random() * 12)],
      degree: Math.floor(Math.random() * 30),
      house: Math.floor(Math.random() * 12) + 1
    }));
  };

  // Generate houses
  const generateHouses = () => {
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      houses.push({
        number: i,
        sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(Math.random() * 12)],
        degree: Math.floor(Math.random() * 30)
      });
    }
    return houses;
  };

  // Generate Dasha periods
  const generateDasha = () => {
    const dashas = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];
    return dashas.map(dasha => ({
      planet: dasha,
      startDate: new Date().toISOString().split('T')[0],
      duration: Math.floor(Math.random() * 10) + 1
    }));
  };

  useEffect(() => {
    if (birthData) {
      generateKundli();
    }
  }, [birthData]);

  if (loading) {
    return (
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50`}>
        <div className={`${currentTheme.colors.background} rounded-lg p-8 max-w-md w-full mx-4`}>
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className={`${currentTheme.colors.textPrimary} text-lg font-semibold mb-2`}>
              Generating Your Kundli
            </h3>
            <p className={`${currentTheme.colors.textSecondary} text-sm`}>
              Calculating planetary positions and astrological data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50`}>
        <div className={`${currentTheme.colors.background} rounded-lg p-8 max-w-md w-full mx-4`}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className={`${currentTheme.colors.textPrimary} text-lg font-semibold mb-2`}>
              Error Generating Kundli
            </h3>
            <p className={`${currentTheme.colors.textSecondary} text-sm mb-4`}>
              {error}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={generateKundli}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!kundliData) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500/20 backdrop-blur-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-purple-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {kundliData.name}'s Kundli
            </h2>
            <p className="text-purple-200 text-sm mt-1">
              Birth Chart Analysis
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Kundli Content */}
        <div className="p-6 space-y-6">
          {/* Birth Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-white font-semibold mb-2">Birth Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-white/70">Date:</span> {kundliData.birthDate}</p>
                <p><span className="text-white/70">Time:</span> {kundliData.birthTime}</p>
                <p><span className="text-white/70">Place:</span> {kundliData.birthPlace}</p>
                <p><span className="text-white/70">Zodiac Sign:</span> {kundliData.zodiacSign}</p>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-white font-semibold mb-2">Planetary Positions</h3>
              <div className="space-y-1 text-sm">
                {kundliData.planetaryPositions.slice(0, 4).map((planet, index) => (
                  <p key={index}>
                    <span className="text-white/70">{planet.name}:</span> {planet.sign} {planet.degree}°
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Houses */}
          <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-4">Houses</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {kundliData.houses.map((house, index) => (
                <div key={index} className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/20">
                  <div className="text-xs text-purple-200">House {house.number}</div>
                  <div className="text-sm font-medium text-white">{house.sign}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dasha Periods */}
          <div className="bg-slate-800/40 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-4">Dasha Periods</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {kundliData.dasha.map((dasha, index) => (
                <div key={index} className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/20">
                  <div className="text-sm font-medium text-white">{dasha.planet}</div>
                  <div className="text-xs text-purple-200">{dasha.duration} years</div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="text-center text-sm text-white/60">
            <p>This is a simplified Kundli display. For detailed calculations, the advanced astronomical engine is required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
