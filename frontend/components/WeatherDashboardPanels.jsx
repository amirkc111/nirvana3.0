"use client";

import React from "react";
import { useTheme } from '../contexts/ThemeContext';

// Simple icons for pollen
const pollenIcons = {
  tree: "🌳",
  weed: "🌿",
  grass: "🌾",
};

const pollutantLabels = [
  { key: "pm10", label: "PM10", unit: "µg/m³" },
  { key: "pm25", label: "PM2.5", unit: "µg/m³" },
  { key: "no2", label: "NO₂", unit: "µg/m³" },
  { key: "so2", label: "SO₂", unit: "µg/m³" },
  { key: "co", label: "CO", unit: "µg/m³" },
  { key: "o3", label: "O₃", unit: "µg/m³" },
];

function getAQIBarColor(aqi) {
  if (aqi == null) return "bg-gray-300";
  if (aqi < 50) return "bg-green-400";
  if (aqi < 100) return "bg-yellow-400";
  if (aqi < 150) return "bg-orange-400";
  if (aqi < 200) return "bg-red-400";
  if (aqi < 300) return "bg-red-600";
  return "bg-red-800";
}

const WeatherDashboardPanels = ({ currentData, city }) => {
  const { currentTheme } = useTheme();

  // Debug logging
  console.log('🌡️ WeatherDashboardPanels received data:', {
    aqi: currentData.aqi,
    aqi_desc: currentData.aqi_desc,
    pm10: currentData.pm10,
    pm25: currentData.pm25,
    no2: currentData.no2,
    so2: currentData.so2,
    co: currentData.co,
    o3: currentData.o3,
    pollen_tree: currentData.pollen_tree,
    pollen_weed: currentData.pollen_weed,
    pollen_grass: currentData.pollen_grass,
    fire_risk: currentData.fire_risk
  });

  // Ensure we have fallback data
  const safeData = {
    aqi: currentData.aqi ?? 25,
    aqi_desc: currentData.aqi_desc ?? "Good",
    pm10: currentData.pm10 ?? 15.2,
    pm25: currentData.pm25 ?? 8.7,
    no2: currentData.no2 ?? 12.3,
    so2: currentData.so2 ?? 2.1,
    co: currentData.co ?? 0.8,
    o3: currentData.o3 ?? 45.6,
    pollen_tree: currentData.pollen_tree ?? 0,
    pollen_weed: currentData.pollen_weed ?? 0,
    pollen_grass: currentData.pollen_grass ?? 0,
    fire_risk: currentData.fire_risk ?? 15,
    ...currentData // Override with actual data if available
  };

  console.log('🌡️ Safe data being used:', safeData);

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* Air Quality + Pollen */}
      <div className={`${currentTheme.colors.surface} border-l-8 border-red-500 rounded-md md:rounded-xl shadow p-2 md:p-6 flex flex-col w-full max-w-[90vw] md:max-w-sm mx-auto`}>
        {/* Air Quality Bar */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-xs md:text-lg ${currentTheme.colors.text}`}>Air quality</span>
            <span className={`text-xs ${currentTheme.colors.textSecondary}`}>{safeData.aqi_desc || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 md:h-3 rounded-full bg-gray-300 overflow-hidden">
              <div
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${getAQIBarColor(safeData.aqi)}`}
                style={{ width: `${safeData.aqi ? Math.min(safeData.aqi, 500) / 5 : 0}%` }}
              />
            </div>
            <span className={`text-xs ${currentTheme.colors.textSecondary} ml-2`}>{safeData.aqi ?? "-"}</span>
          </div>
          <div className={`flex justify-between text-xs ${currentTheme.colors.textSecondary} mt-1`}>
            <span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span>
          </div>
        </div>
        {/* Pollen */}
        <div>
          <div className={`font-bold ${currentTheme.colors.text} mb-2 text-xs md:text-lg`}>Pollen</div>
          {["tree", "weed", "grass"].map((type) => (
            <div key={type} className="mb-2 md:mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold ${currentTheme.colors.text} w-12 md:w-16 capitalize text-xs md:text-base`}>
                  {type}
                </span>
                <span className="text-base md:text-xl">{pollenIcons[type]}</span>
                <span className={`text-xs ${currentTheme.colors.textSecondary}`}>{safeData[`pollen_${type}`] ?? 0}/5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 md:h-2 rounded-full bg-gray-300 overflow-hidden">
                  <div
                    className="h-1.5 md:h-2 rounded-full bg-red-400"
                    style={{ width: `${(safeData[`pollen_${type}`] ?? 0) * 20}%` }}
                  />
                </div>
                <span className={`text-xs ${currentTheme.colors.textSecondary}`}>5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pollutants */}
      <div className={`${currentTheme.colors.surface} border-l-8 border-red-500 rounded-md md:rounded-xl shadow p-2 md:p-6 flex flex-col w-full max-w-[90vw] md:max-w-sm mx-auto`}>
        <div className={`font-bold ${currentTheme.colors.text} mb-4 text-xs md:text-lg`}>Pollutants</div>
        <div className="grid grid-cols-2 gap-4 flex-1">
          {pollutantLabels.map(({ key, label, unit }) => (
            <div key={key} className={`flex flex-col items-center ${currentTheme.colors.surface} rounded-lg p-4`}>
              <div className={`w-12 h-12 rounded-full ${currentTheme.colors.surface} flex items-center justify-center mb-2`}>
                <span className={`text-lg ${currentTheme.colors.text} font-bold`}>
                  {safeData[key] != null ? safeData[key] : "-"}
                </span>
              </div>
              <span className={`text-xs ${currentTheme.colors.text} font-bold mb-1`}>{unit}</span>
              <span className={`font-semibold ${currentTheme.colors.text}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fire Risk */}
      <div className={`${currentTheme.colors.surface} border-l-8 border-red-500 rounded-md md:rounded-xl shadow p-2 md:p-6 flex flex-col items-center justify-center w-full max-w-[90vw] md:max-w-sm mx-auto`}>
        <div className="flex items-center justify-between w-full mb-4">
          <div className={`text-xs md:text-xl ${currentTheme.colors.text} font-bold`}>{city || "Current Location"}</div>
          <div className={`${currentTheme.colors.text} text-sm`}>Temp: {currentData.temp}°C</div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">🌲</span>
          <span className={`${currentTheme.colors.text} text-lg font-semibold`}>Fire Risk Index</span>
        </div>
        <div className={`text-5xl font-bold ${currentTheme.colors.text} mb-2`}>{safeData.fire_risk != null ? Math.round(safeData.fire_risk) : "-"}</div>
        <div className="w-full flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 rounded-full bg-gray-300 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-red-400 via-red-500 to-red-700"
              style={{ width: `${safeData.fire_risk != null ? Math.min(safeData.fire_risk, 100) : 0}%` }}
            />
          </div>
          <span className={`text-xs ${currentTheme.colors.textSecondary}`}>100</span>
        </div>
        {/* Extra Data: 3-column grid, stacked, centered */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-4 w-full mb-2 mt-2">
          {/* Humidity */}
          <div className={`flex flex-col items-center ${currentTheme.colors.text} text-sm`}>
            <span className="text-lg">💧</span>
            <span className="opacity-80">Humidity</span>
            <span className={`font-bold text-lg mt-1 ${currentTheme.colors.text}`}>{currentData.humidity ?? "-"}%</span>
          </div>
          {/* Precipitation */}
          <div className={`flex flex-col items-center ${currentTheme.colors.text} text-sm`}>
            <span className="text-lg">🌧️</span>
            <span className="opacity-80">Precip</span>
            <span className={`font-bold text-lg mt-1 ${currentTheme.colors.text}`}>{currentData.precipitation ?? "-"} mm</span>
          </div>
          {/* Pressure */}
          <div className={`flex flex-col items-center ${currentTheme.colors.text} text-sm`}>
            <span className="text-lg">🌡️</span>
            <span className="opacity-80">Pressure</span>
            <span className={`font-bold text-lg mt-1 ${currentTheme.colors.text}`}>{currentData.pressure ?? "-"} hPa</span>
          </div>
          {/* UV Index */}
          <div className={`flex flex-col items-center ${currentTheme.colors.text} text-sm`}>
            <span className="text-lg">☀️</span>
            <span className="opacity-80">UV Index</span>
            <span className={`font-bold text-lg mt-1 ${currentTheme.colors.text}`}>{currentData.uv_index ?? "-"}</span>
          </div>
          {/* Sunrise */}
          <div className={`flex flex-col items-center ${currentTheme.colors.text} text-sm`}>
            <span className="text-lg">🌅</span>
            <span className="opacity-80">Sunrise</span>
            <span className={`font-bold text-lg mt-1 ${currentTheme.colors.text}`}>{currentData.sunrise ? new Date(currentData.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
          </div>
          {/* Sunset */}
          <div className={`flex flex-col items-center ${currentTheme.colors.text} text-sm`}>
            <span className="text-lg">🌇</span>
            <span className="opacity-80">Sunset</span>
            <span className={`font-bold text-lg mt-1 ${currentTheme.colors.text}`}>{currentData.sunset ? new Date(currentData.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className={`${currentTheme.colors.text} text-sm`}>Wind: {currentData.wind_speed} km/h</span>
          <span className={`${currentTheme.colors.text} text-sm`}>Dir: {currentData.wind_dir}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboardPanels;
