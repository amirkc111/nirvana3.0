"use client";

import { useState, useEffect, useRef } from 'react';

export default function CitySearch({ 
  value, 
  onChange, 
  placeholder = "Search for your birth place...",
  className = ""
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load cities from CSV
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await fetch('/worldcities.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const cityData = lines.slice(1).map(line => {
        const [city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id] = line.split(',');
        return {
          city: city?.replace(/"/g, ''),
          city_ascii: city_ascii?.replace(/"/g, ''),
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          country: country?.replace(/"/g, ''),
          iso2: iso2?.replace(/"/g, ''),
          iso3: iso3?.replace(/"/g, ''),
          admin_name: admin_name?.replace(/"/g, ''),
          capital: capital?.replace(/"/g, ''),
          population: parseInt(population) || 0,
          id: id?.replace(/"/g, '')
        };
      }).filter(city => city.city && city.country);
      
      setCities(cityData);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const searchCities = (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    const filtered = cities
      .filter(city => 
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.city_ascii.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.admin_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize exact matches and capitals
        const aExact = a.city.toLowerCase() === searchQuery.toLowerCase();
        const bExact = b.city.toLowerCase() === searchQuery.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then by population (larger cities first)
        return b.population - a.population;
      })
      .slice(0, 10); // Limit to 10 suggestions

    setSuggestions(filtered);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchCities(newQuery);
    setIsOpen(true);
  };

  const handleSuggestionClick = (city) => {
    const fullLocation = `${city.city}, ${city.country}`;
    setQuery(fullLocation);
    onChange(fullLocation);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black/95 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-white/70">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((city, index) => (
                <button
                  key={`${city.id}-${index}`}
                  onClick={() => handleSuggestionClick(city)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{city.city}</div>
                    <div className="text-sm text-white/70">
                      {city.admin_name && `${city.admin_name}, `}
                      {city.country}
                      {city.capital && (
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-500/30 text-purple-300 rounded">
                          {city.capital}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-white/50">
                    {city.population > 0 && `${(city.population / 1000000).toFixed(1)}M`}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-white/70">
              No cities found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
