"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "./Footer";
import { localizeDigits } from "../utils/localization";

// Hindu time calculation based on VedicJyotish
function calcHinduTime(sunriseDecimal) {
  const now = new Date();
  let t = now.getHours() / 24 +
    now.getMinutes() / (24 * 60) +
    (now.getSeconds() + now.getMilliseconds() / 1000) / (24 * 3600) -
    sunriseDecimal;
  if (t < 0) t += 1;

  const ghati = Math.floor(t * 60);
  const pal = Math.floor((t * 60 - ghati) * 60);
  const vipal = Math.floor((t * 3600 - ghati * 60 - pal) * 60);
  return { ghati, pal, vipal };
}

// Simplified sunrise/sunset calculation
function calcRiseSet(lat, lon, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const declination = 23.45 * Math.sin((284 + dayOfYear) * Math.PI / 180);
  const hourAngle = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(declination * Math.PI / 180));
  const sunriseHour = 12 - (hourAngle * 180 / Math.PI) / 15;
  const sunsetHour = 12 + (hourAngle * 180 / Math.PI) / 15;

  return {
    sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(),
      Math.floor(sunriseHour), (sunriseHour % 1) * 60),
    sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(),
      Math.floor(sunsetHour), (sunsetHour % 1) * 60)
  };
}

export default function AstroClock() {
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hinduTime, setHinduTime] = useState({ ghati: 0, pal: 0, vipal: 0 });
  const [sunrise, setSunrise] = useState(new Date());
  const [sunset, setSunset] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHinduPeriods, setShowHinduPeriods] = useState(true);
  const [showDayNight, setShowDayNight] = useState(true);
  const [showDigitalTime, setShowDigitalTime] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('Ujjain, India');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  // Default to Ujjain coordinates (traditional Hindu astrology center)
  const [lat, setLat] = useState(23.1793);
  const [lon, setLon] = useState(75.784912);

  // Get user's location using accurate IP-based geolocation
  useEffect(() => {
    const getUserLocation = async () => {
      setIsLoadingLocation(true);

      const services = [
        { url: 'https://ipapi.co/json/', type: 'ipapi' },
        { url: 'https://ipwho.is/', type: 'ipwhois' },
        { url: 'https://freeipapi.com/api/json', type: 'freeipapi' }
      ];

      for (const service of services) {
        try {
          console.log(`Fetching location from ${service.type}...`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

          const response = await fetch(service.url, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error('Network response was not ok');

          const data = await response.json();
          let lat, lon, name;

          if (service.type === 'ipapi' && data.latitude && data.longitude) {
            lat = data.latitude;
            lon = data.longitude;
            name = data.city ? `${data.city}, ${data.country_name}` : data.country_name;
          } else if (service.type === 'ipwhois' && data.latitude && data.longitude) {
            lat = data.latitude;
            lon = data.longitude;
            name = `${data.city}, ${data.country}`;
          } else if (service.type === 'freeipapi' && data.latitude && data.longitude) {
            lat = data.latitude;
            lon = data.longitude;
            name = `${data.cityName}, ${data.countryName}`;
          }

          if (lat && lon) {
            console.log('✅ Location obtained:', { lat, lon, name });
            setUserLocation({ lat, lon });
            setLat(lat);
            setLon(lon);
            setLocationName(name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
            setIsLoadingLocation(false);
            return; // Success, exit
          }
        } catch (error) {
          console.warn(`${service.type} failed:`, error);
          // Continue to next service
        }
      }

      // If all failed
      console.log('All location services failed, falling back to default.');
      setLocationName('Ujjain, India (Default)');
      setIsLoadingLocation(false);
    };

    getUserLocation();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Hindu time periods and sunrise/sunset
  useEffect(() => {
    const calculateHinduTime = () => {
      const now = new Date();

      // Calculate sunrise and sunset
      const riseSet = calcRiseSet(lat, lon, now);
      setSunrise(riseSet.sunrise);
      setSunset(riseSet.sunset);

      // Calculate Hindu time based on sunrise
      const sunriseDecimal = riseSet.sunrise.getHours() / 24 +
        riseSet.sunrise.getMinutes() / (24 * 60) +
        riseSet.sunrise.getSeconds() / (24 * 3600);

      const hinduTimeData = calcHinduTime(sunriseDecimal);
      setHinduTime(hinduTimeData);

      // Determine current Hindu period based on Ghati
      const ghati = hinduTimeData.ghati;
      const periods = [
        { name: t('ushaa'), start: 55, end: 60 },
        { name: t('purvaanha'), start: 0, end: 7.5 },
        { name: t('madhyaanha'), start: 7.5, end: 15 },
        { name: t('aparaahnha'), start: 15, end: 22.5 },
        { name: t('saayankala'), start: 22.5, end: 30 },
        { name: t('pradosha'), start: 30, end: 37.5 },
        { name: t('nishitha'), start: 37.5, end: 45 },
        { name: t('triyaama'), start: 45, end: 52.5 }
      ];

      const currentPeriodObj = periods.find(p => ghati >= p.start && ghati < p.end);
      setCurrentPeriod(currentPeriodObj ? currentPeriodObj.name : 'Unknown');
    };

    calculateHinduTime();
  }, [currentTime]);

  // SVG Clock Component
  const HinduTimeClock = () => {
    const settings = { size: 400 };
    const padding = settings.size * 0.01;
    const outerRadius = settings.size * 0.5;
    const innerRadius = settings.size * 0.475;
    const center = settings.size / 2;

    // Calculate day/night arc
    const dayDuration = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60 * 24);
    const startAngle = 2 * Math.PI * dayDuration - Math.PI / 2;
    const endAngle = 2 * Math.PI - Math.PI / 2;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={settings.size}
        height={settings.size}
        viewBox={`${-padding} ${-padding} ${settings.size + padding * 2} ${settings.size + padding * 2}`}
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        imageRendering="optimizeQuality"
        fillRule="evenodd"
        clipRule="evenodd"
        className="mx-auto"
      >
        {/* Time Period Labels (8 parts of the day) */}
        {showHinduPeriods && (
          <g id="time_period_labels">
            {[
              t('ushaa'),
              t('purvaanha'),
              t('madhyaanha'),
              t('aparaahnha'),
              t('saayankala'),
              t('pradosha'),
              t('nishitha'),
              t('triyaama'),
            ].map((period_name, i) => {
              const angle = ((2 * i - 1) * Math.PI) / 8;
              const x = Math.round((center + innerRadius * 0.75 * Math.sin(angle)) * 100) / 100;
              const y = Math.round((center - innerRadius * 0.75 * Math.cos(angle)) * 100) / 100;
              return (
                <text
                  key={period_name}
                  x={x}
                  y={y}
                  fill={isDarkMode ? "#ffffff" : "#000000"}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={10}
                  fontWeight="bold"
                >
                  {period_name}
                </text>
              );
            })}
          </g>
        )}

        {/* Outer Circle */}
        <circle
          id="outer_circle"
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke={isDarkMode ? "#4a5568" : "#2D3748"}
          strokeWidth={2}
        />

        {/* Inner circle */}
        <circle
          id="inner_circle"
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={isDarkMode ? "#ffffff" : "#000000"}
          strokeWidth={1}
        />

        {/* Numbers (60 Ghati format) */}
        <g id="numbers">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 + 180) % 360;
            const r = innerRadius * 0.9;
            const x = Math.round((center + r * Math.sin((angle * Math.PI) / 180)) * 100) / 100;
            const y = Math.round((center + r * Math.cos((angle * Math.PI) / 180)) * 100) / 100;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={12}
                fontWeight="bold"
                fill={isDarkMode ? "#ffffff" : "#000000"}
              >
                {localizeDigits(String(60 - i * 5), language)}
              </text>
            );
          })}
        </g>

        {/* Tick Marks (60 ticks for Ghati/Pal) */}
        <g id="ticks">
          {Array.from({ length: 60 }, (_, i) => {
            const isMajor = i % 5 === 0;
            const length = innerRadius * (1 - (isMajor ? 0.05 : 0.035));
            const angle = (i * Math.PI) / 30;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            const x1 = Math.round((center + innerRadius * sin) * 100) / 100;
            const y1 = Math.round((center - innerRadius * cos) * 100) / 100;
            const x2 = Math.round((center + length * sin) * 100) / 100;
            const y2 = Math.round((center - length * cos) * 100) / 100;

            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isDarkMode ? "#4a5568" : "#2D3748"}
                strokeWidth={isMajor ? 1.5 : 0.75}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Day/Night Arc (Night time shaded) */}
        {showDayNight && (
          <path
            d={
              `M ${center},${center} ` +
              `L ${Math.round((center + innerRadius * Math.cos(startAngle)) * 100) / 100},${Math.round((center + innerRadius * Math.sin(startAngle)) * 100) / 100} ` +
              `A ${innerRadius},${innerRadius} ` +
              `0 ${((endAngle - startAngle) > Math.PI) ? 1 : 0} 1 ` +
              `${Math.round((center + innerRadius * Math.cos(endAngle)) * 100) / 100} ${Math.round((center + innerRadius * Math.sin(endAngle)) * 100) / 100} ` +
              `Z`
            }
            fill={isDarkMode ? "#33333333" : "#e8e8e8"}
            stroke={isDarkMode ? "#ffffff" : "#000000"}
            strokeWidth={2}
          />
        )}

        {/* Ghati Hand */}
        <line
          x1={center}
          y1={center}
          x2={Math.round((center + innerRadius * 0.7 * Math.sin((hinduTime.ghati * 6 * Math.PI) / 180)) * 100) / 100}
          y2={Math.round((center - innerRadius * 0.7 * Math.cos((hinduTime.ghati * 6 * Math.PI) / 180)) * 100) / 100}
          stroke="#2D3748"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Pal Hand */}
        <line
          x1={center}
          y1={center}
          x2={Math.round((center + innerRadius * 0.8 * Math.sin((hinduTime.pal * 6 * Math.PI) / 180)) * 100) / 100}
          y2={Math.round((center - innerRadius * 0.8 * Math.cos((hinduTime.pal * 6 * Math.PI) / 180)) * 100) / 100}
          stroke="#2D3748"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Vipal Hand */}
        <line
          x1={center}
          y1={center}
          x2={Math.round((center + innerRadius * 0.9 * Math.sin((hinduTime.vipal * Math.PI) / 180)) * 100) / 100}
          y2={Math.round((center - innerRadius * 0.9 * Math.cos((hinduTime.vipal * Math.PI) / 180)) * 100) / 100}
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Center Cap */}
        <circle
          cx={center}
          cy={center}
          r="6"
          fill={isDarkMode ? "#1a202c" : "#fff"}
          stroke={isDarkMode ? "#ffffff" : "#2D3748"}
          strokeWidth="2"
        />
      </svg>
    );
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleHinduPeriods = () => setShowHinduPeriods(!showHinduPeriods);
  const toggleDayNight = () => setShowDayNight(!showDayNight);
  const toggleDigitalTime = () => setShowDigitalTime(!showDigitalTime);
  const toggleLocationInput = () => setShowLocationInput(!showLocationInput);

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;

    try {
      // Use geocoding to get coordinates from location name
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(manualLocation)}&localityLanguage=en`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLat = result.latitude;
        const newLon = result.longitude;

        setLat(newLat);
        setLon(newLon);
        setLocationName(manualLocation);
        setUserLocation({ lat: newLat, lon: newLon });
        setShowLocationInput(false);
        setManualLocation('');
      } else {
        alert('Location not found. Please try a different location name.');
      }
    } catch (error) {
      console.log('Geocoding failed:', error);
      alert('Failed to find location. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20">

      {/* Clock Display */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${currentTheme.colors.text} mb-4`}>{t('currentAstrologicalTime')}</h2>
              <p className={`${currentTheme.colors.textSecondary} text-lg`}>{t('realTimePlanetaryPositions')}</p>
              {isLoadingLocation ? (
                <div className="mt-4">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    {t('detectingLocation')}
                  </div>
                </div>
              ) : null}
            </div>

            {/* SVG Clock Container */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="border-2 border-white/20 rounded-2xl shadow-2xl ${currentTheme.colors.surface} backdrop-blur p-4">
                  <HinduTimeClock />
                </div>
                {/* Overlay for additional info */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-lg p-3 ${currentTheme.colors.text} text-sm">
                  <div className="font-bold">{t('hinduTimeLabel')}: {localizeDigits(String(hinduTime.ghati).padStart(2, "0"), language)}:{localizeDigits(String(hinduTime.pal).padStart(2, "0"), language)}:{localizeDigits(String(hinduTime.vipal).padStart(2, "0"), language)}</div>
                  <div className="text-xs opacity-75">{t('ghatiPalVipal')}</div>
                </div>
              </div>
            </div>

            {/* Hindu Time Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <button
                onClick={toggleDarkMode}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 ${currentTheme.colors.text} shadow-lg'
                  : '${currentTheme.colors.surface} ${currentTheme.colors.text} hover:bg-white/20 border border-white/20'
                  }`}
              >
                🌙 {t('darkMode')}
              </button>

              <button
                onClick={toggleHinduPeriods}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${showHinduPeriods
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 ${currentTheme.colors.text} shadow-lg'
                  : '${currentTheme.colors.surface} ${currentTheme.colors.text} hover:bg-white/20 border border-white/20'
                  }`}
              >
                🕉️ {t('hinduPeriods')}
              </button>

              <button
                onClick={toggleDayNight}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${showDayNight
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 ${currentTheme.colors.text} shadow-lg'
                  : '${currentTheme.colors.surface} ${currentTheme.colors.text} hover:bg-white/20 border border-white/20'
                  }`}
              >
                🌅 {t('dayNight')}
              </button>

              <button
                onClick={toggleDigitalTime}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${showDigitalTime
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 ${currentTheme.colors.text} shadow-lg'
                  : '${currentTheme.colors.surface} ${currentTheme.colors.text} hover:bg-white/20 border border-white/20'
                  }`}
              >
                ⏰ {t('digitalTime')}
              </button>
            </div>

            {/* Hindu Time Information - Only show when Digital Time is enabled */}
            {showDigitalTime && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${currentTheme.colors.surface} rounded-lg p-4 border ${currentTheme.colors.border} text-center`}>
                  <div className="text-2xl font-bold ${currentTheme.colors.text} mb-2">
                    {localizeDigits(String(hinduTime.ghati).padStart(2, "0"), language)}:
                    {localizeDigits(String(hinduTime.pal).padStart(2, "0"), language)}:
                    {localizeDigits(String(hinduTime.vipal).padStart(2, "0"), language)}
                  </div>
                  <div className={`${currentTheme.colors.text}/70 text-sm`}>{t('ghatiPalVipal')}</div>
                </div>
                <div className="${currentTheme.colors.surface} rounded-lg p-4 border ${currentTheme.colors.border} text-center">
                  <div className="text-2xl font-bold ${currentTheme.colors.text} mb-2">{currentPeriod}</div>
                  <div className="${currentTheme.colors.text}/70 text-sm">{t('currentPeriod')}</div>
                </div>
                <div className={`${currentTheme.colors.surface} rounded-lg p-4 border ${currentTheme.colors.border} text-center`}>
                  <div className="text-2xl font-bold ${currentTheme.colors.text} mb-2">
                    {localizeDigits(sunrise.getHours().toString().padStart(2, '0'), language)}:
                    {localizeDigits(sunrise.getMinutes().toString().padStart(2, '0'), language)}
                  </div>
                  <div className={`${currentTheme.colors.text}/70 text-sm`}>{t('sunrise')} in {locationName}</div>
                </div>
              </div>
            )}

            {/* Hindu Time Periods Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-red-400 text-sm font-bold mb-1">{t('ushaa')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('dawn')} ({localizeDigits('55', language)}-{localizeDigits('60', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-cyan-400 text-sm font-bold mb-1">{t('purvaanha')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('morning')} ({localizeDigits('0', language)}-{localizeDigits('5', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-blue-400 text-sm font-bold mb-1">{t('madhyaanha')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('midday')} ({localizeDigits('10', language)}-{localizeDigits('15', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-green-400 text-sm font-bold mb-1">{t('aparaahnha')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('afternoon')} ({localizeDigits('15', language)}-{localizeDigits('20', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-yellow-400 text-sm font-bold mb-1">{t('saayankala')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('evening')} ({localizeDigits('25', language)}-{localizeDigits('30', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-purple-400 text-sm font-bold mb-1">{t('pradosha')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('dusk')} ({localizeDigits('30', language)}-{localizeDigits('35', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-teal-400 text-sm font-bold mb-1">{t('nishitha')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('midnight')} ({localizeDigits('40', language)}-{localizeDigits('45', language)})</div>
              </div>
              <div className="${currentTheme.colors.surface} rounded-lg p-3 border ${currentTheme.colors.border}">
                <div className="text-yellow-300 text-sm font-bold mb-1">{t('triyaama')}</div>
                <div className="${currentTheme.colors.text}/70 text-xs">{t('lateNight')} ({localizeDigits('45', language)}-{localizeDigits('50', language)})</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}


      <Footer />
    </div>
  );
}
