"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const WeatherContext = createContext();

export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
};

export const WeatherProvider = ({ children }) => {
    const [location, setLocation] = useState({
        lat: 27.7172,
        lon: 85.3240,
        city: 'Kathmandu',
        method: 'default'
    });
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reverseGeocode = async (lat, lon) => {
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
        } catch (err) {
            console.warn("WeatherContext: Geocoding failed", err);
            return null;
        }
    };

    const fetchWeather = async (lat, lon, city = null) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
            const data = await res.json();

            if (data.current_weather) {
                setWeather({
                    temp: Math.round(data.current_weather.temperature),
                    condition: data.current_weather.weathercode,
                    min: data.daily?.temperature_2m_min?.[0],
                    max: data.daily?.temperature_2m_max?.[0],
                    wind: data.current_weather.windspeed,
                    city: city || location.city
                });
            }
        } catch (err) {
            console.error("WeatherContext: Fetch failed", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const initializeLocation = async () => {
        // 1. Try Browser Geolocation first
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const cityName = await reverseGeocode(latitude, longitude) || 'Your Location';
                    setLocation({ lat: latitude, lon: longitude, city: cityName, method: 'browser' });
                    await fetchWeather(latitude, longitude, cityName);
                },
                async (err) => {
                    console.warn("WeatherContext: Browser location denied/failed, falling back to IP", err.message);
                    await fallbackToIP();
                },
                { timeout: 10000 }
            );
        } else {
            await fallbackToIP();
        }
    };

    const fallbackToIP = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.latitude && data.longitude) {
                setLocation({
                    lat: data.latitude,
                    lon: data.longitude,
                    city: data.city || 'Unknown City',
                    method: 'ip'
                });
                await fetchWeather(data.latitude, data.longitude, data.city);
            } else {
                throw new Error('IP service returned no coordinates');
            }
        } catch (err) {
            console.error("WeatherContext: IP fallback failed", err.message);
            // Stay with default Kathmandu
            await fetchWeather(location.lat, location.lon, location.city);
        }
    };

    useEffect(() => {
        initializeLocation();

        // Refresh weather every 10 minutes
        const interval = setInterval(() => {
            fetchWeather(location.lat, location.lon);
        }, 600000);

        return () => clearInterval(interval);
    }, []);

    return (
        <WeatherContext.Provider value={{ location, weather, loading, error, refreshWeather: () => fetchWeather(location.lat, location.lon) }}>
            {children}
        </WeatherContext.Provider>
    );
};
