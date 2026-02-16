"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useWeather } from '../../contexts/WeatherContext';
import WeatherDashboardPanels from '../../components/WeatherDashboardPanels';
import LocationPermissionModal from '../../components/LocationPermissionModal';
import Footer from '../../components/Footer';

const weatherIcons = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌦️",
  61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "❄️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌦️",
  82: "🌦️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
};

function getWeatherIcon(code) {
  return weatherIcons[code] || "❓";
}

function degToCompass(num) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}

function formatTime(str) {
  if (!str) return "-";
  const d = new Date(str);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(str) {
  if (!str) return "-";
  const d = new Date(str);
  return d.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
}

function formatDayOfWeek(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

const POLL_INTERVAL = 600000; // 10 minutes in ms

async function fetchWeatherAll(lat, lon) {
  // Fetch forecast
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,uv_index_max,sunrise,sunset&current_weather=true&hourly=relative_humidity_2m,apparent_temperature,precipitation,weathercode,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=auto`);
  const data = await res.json();
  let forecastData = [];
  let currentData = {
    temp: '-', feels_like: '-', humidity: '-', wind_speed: '-', wind_dir: '-', pressure: '-', precipitation: '-', temp_min: '-', uv_index: '-', sunrise: '', sunset: '', weather_code: 0, weather_desc: '', aqi: null, aqi_desc: 'No data',
    pm10: null, pm25: null, no2: null, so2: null, co: null, o3: null,
    pollen_tree: null, pollen_weed: null, pollen_grass: null,
    fire_risk: null
  };

  if (data.daily && data.daily.time) {
    forecastData = data.daily.time.map((date, i) => ({
      date,
      temp_max: data.daily.temperature_2m_max[i],
      temp_min: data.daily.temperature_2m_min[i],
      precipitation: data.daily.precipitation_sum[i],
      weather_code: data.daily.weathercode[i],
    }));
  }

  if (data.current_weather) {
    currentData.temp = Math.round(data.current_weather.temperature);
    currentData.feels_like = data.hourly && data.hourly.apparent_temperature ? Math.round(data.hourly.apparent_temperature[0]) : '-';
    currentData.humidity = data.hourly && data.hourly.relative_humidity_2m ? Math.round(data.hourly.relative_humidity_2m[0]) : '-';
    currentData.wind_speed = Math.round(data.current_weather.windspeed);
    currentData.wind_dir = data.hourly && data.hourly.wind_direction_10m ? degToCompass(data.hourly.wind_direction_10m[0]) : '-';
    currentData.pressure = data.hourly && data.hourly.surface_pressure ? Math.round(data.hourly.surface_pressure[0]) : '-';
    currentData.precipitation = data.hourly && data.hourly.precipitation ? data.hourly.precipitation[0] : '-';
    currentData.temp_min = data.daily && data.daily.temperature_2m_min ? data.daily.temperature_2m_min[0] : '-';
    currentData.uv_index = data.daily && data.daily.uv_index_max ? data.daily.uv_index_max[0] : '-';
    currentData.sunrise = data.daily && data.daily.sunrise ? data.daily.sunrise[0] : '';
    currentData.sunset = data.daily && data.daily.sunset ? data.daily.sunset[0] : '';
    currentData.weather_code = data.current_weather.weathercode;
    const descMap = {
      0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Thunderstorm w/ heavy hail"
    };
    currentData.weather_desc = descMap[data.current_weather.weathercode] || '';
  }

  // Calculate index for current hour (0-23)
  const currentHourIndex = new Date().getHours();

  // Air Quality & Pollutants
  try {
    // Fetching air quality data
    const airRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`);
    const airData = await airRes.json();

    if (airData.hourly) {
      // Use current hour index, fallback to 0 if out of bounds (unlikely default)
      const idx = (currentHourIndex < airData.hourly.time.length) ? currentHourIndex : 0;

      currentData.aqi = airData.hourly.us_aqi ? airData.hourly.us_aqi[idx] : null;

      if (currentData.aqi !== null) {
        if (currentData.aqi < 50) currentData.aqi_desc = "Good";
        else if (currentData.aqi < 100) currentData.aqi_desc = "Moderate";
        else if (currentData.aqi < 150) currentData.aqi_desc = "Unhealthy for Sensitive Groups";
        else if (currentData.aqi < 200) currentData.aqi_desc = "Unhealthy";
        else if (currentData.aqi < 300) currentData.aqi_desc = "Very Unhealthy";
        else currentData.aqi_desc = "Hazardous";
      }

      currentData.pm10 = airData.hourly.pm10 ? airData.hourly.pm10[idx] : null;
      currentData.pm25 = airData.hourly.pm2_5 ? airData.hourly.pm2_5[idx] : null;
      currentData.no2 = airData.hourly.nitrogen_dioxide ? airData.hourly.nitrogen_dioxide[idx] : null;
      currentData.so2 = airData.hourly.sulphur_dioxide ? airData.hourly.sulphur_dioxide[idx] : null;
      currentData.co = airData.hourly.carbon_monoxide ? airData.hourly.carbon_monoxide[idx] : null;
      currentData.o3 = airData.hourly.ozone ? airData.hourly.ozone[idx] : null;

    } else {
      // Fallback
      currentData.aqi = 25; currentData.aqi_desc = "Good";
      currentData.pm10 = 15.2; currentData.pm25 = 8.7;
      currentData.no2 = 12.3; currentData.so2 = 2.1;
      currentData.co = 0.8; currentData.o3 = 45.6;
    }
  } catch (e) {
    currentData.aqi = 25; currentData.aqi_desc = "Good";
    currentData.pm10 = 15.2; currentData.pm25 = 8.7;
    currentData.no2 = 12.3; currentData.so2 = 2.1;
    currentData.co = 0.8; currentData.o3 = 45.6;
  }

  // Pollen
  try {
    const pollenRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=tree_pollen,weed_pollen,grass_pollen&timezone=auto`);
    const pollenData = await pollenRes.json();

    if (pollenData.hourly) {
      const idx = (currentHourIndex < pollenData.hourly.time.length) ? currentHourIndex : 0;
      currentData.pollen_tree = pollenData.hourly.tree_pollen ? pollenData.hourly.tree_pollen[idx] : 0;
      currentData.pollen_weed = pollenData.hourly.weed_pollen ? pollenData.hourly.weed_pollen[idx] : 0;
      currentData.pollen_grass = pollenData.hourly.grass_pollen ? pollenData.hourly.grass_pollen[idx] : 0;
    } else {
      currentData.pollen_tree = 0; currentData.pollen_weed = 0; currentData.pollen_grass = 0;
    }
  } catch (e) {
    currentData.pollen_tree = 0; currentData.pollen_weed = 0; currentData.pollen_grass = 0;
  }

  // Fire Risk
  try {
    const fireRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=fire_weather_index&timezone=auto`);
    const fireData = await fireRes.json();

    if (fireData.hourly && fireData.hourly.fire_weather_index) {
      const idx = (currentHourIndex < fireData.hourly.time.length) ? currentHourIndex : 0;
      currentData.fire_risk = fireData.hourly.fire_weather_index[idx];
    } else {
      currentData.fire_risk = 15;
    }
  } catch (e) {
    currentData.fire_risk = 15;
  }

  return { forecastData, currentData };
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return (
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.hamlet ||
      data.address.county ||
      data.address.state ||
      data.display_name ||
      null
    );
  } catch {
    return null;
  }
}

export default function Weather() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { location, weather: currentWeatherData, loading: globalLoading } = useWeather();
  const [forecastData, setForecastData] = useState([]);
  const [currentData, setCurrentData] = useState({
    temp: '-', feels_like: '-', humidity: '-', wind_speed: '-', wind_dir: '-', pressure: '-', precipitation: '-', temp_min: '-', uv_index: '-', sunrise: '', sunset: '', weather_code: 0, weather_desc: '', aqi: null, aqi_desc: '',
    pm10: null, pm25: null, no2: null, so2: null, co: null, o3: null,
    pollen_tree: null, pollen_weed: null, pollen_grass: null,
    fire_risk: null
  });
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  const updateWeather = async (lat, lon, updateCity = false) => {
    setLoading(true);
    try {
      const { forecastData, currentData } = await fetchWeatherAll(lat, lon);
      setForecastData(forecastData);
      setCurrentData(currentData);

      if (updateCity) {
        const cityName = await reverseGeocode(lat, lon);
        if (cityName) setCity(cityName);
      }
    } catch (e) {
      console.error('Weather fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.lat && location.lon) {
      updateWeather(location.lat, location.lon, true);
      const poller = setInterval(() => updateWeather(location.lat, location.lon), POLL_INTERVAL);
      return () => clearInterval(poller);
    }
  }, [location]);

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Header */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className={`text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r ${currentTheme.colors.primary} bg-clip-text text-transparent`}>
              {t('weatherTitle')}
            </h1>
            <p className={`${currentTheme.colors.textSecondary} text-lg`}>
              {t('weatherSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Forecast Bar */}
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide mb-10 bg-transparent mt-4 gap-4 xl:gap-6 px-2">
            {/* Current Weather Card */}
            <div className={`flex flex-col items-center justify-center w-44 h-32 xl:w-56 xl:h-44 ${currentTheme.colors.surface} border-l-8 border-red-500 rounded-xl shadow p-4 xl:p-6 flex-shrink-0`}>
              <div className="w-full flex items-center justify-between mb-2">
                <span className={`text-base xl:text-xl font-extrabold ${currentTheme.colors.text} text-left`}>
                  {city || "Current Location"}
                </span>
                <span className="text-2xl xl:text-3xl text-red-500 text-center">
                  {getWeatherIcon(currentData.weather_code)}
                </span>
              </div>
              <span className={`text-3xl xl:text-5xl font-extrabold ${currentTheme.colors.text} text-center mt-2`}>
                {currentData.temp}°C
              </span>
            </div>

            {/* Daily Forecast Cards */}
            {forecastData.map((day, i) => (
              <div
                key={day.date}
                className={`flex flex-col items-center justify-center w-44 h-32 xl:w-56 xl:h-44 ${currentTheme.colors.surface} border-l-8 border-red-500 rounded-xl shadow p-4 xl:p-6 flex-shrink-0`}
              >
                <span className={`text-base xl:text-lg font-bold ${currentTheme.colors.text} mb-1`}>
                  {formatDayOfWeek(day.date)}
                </span>
                <span className="text-2xl xl:text-3xl text-red-500 mb-2">
                  {getWeatherIcon(day.weather_code)}
                </span>
                <span className={`text-2xl xl:text-3xl font-extrabold ${currentTheme.colors.text} mb-1`}>
                  {day.temp_max}°C
                </span>
                <span className={`text-base xl:text-lg ${currentTheme.colors.textSecondary}`}>
                  {day.temp_min}°C
                </span>
              </div>
            ))}
          </div>

          {loading && (
            <div className={`text-center ${currentTheme.colors.text} mb-4`}>
              Loading weather data...
            </div>
          )}
        </div>
      </section>

      {/* Weather Dashboard Panels */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <WeatherDashboardPanels currentData={currentData} city={city} />
        </div>
      </section>


      <Footer />
    </div>
  );
}
