"use client";

import { useState, useEffect, useRef } from 'react';

export default function FinlandLocationSearch({ 
  value, 
  onChange, 
  placeholder = "Search for your birth place in Finland...",
  className = ""
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load Finland locations from JSON
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadFinlandLocations();
  }, []);

  const loadFinlandLocations = async () => {
    try {
      const response = await fetch('/finland_location.json');
      const data = await response.json();
      
      // Flatten the hierarchical structure
      const flattenedLocations = [];
      
      data.regionList.forEach(region => {
        region.municipalityList.forEach(municipality => {
          flattenedLocations.push({
            id: municipality.id,
            name: municipality.name,
            region: region.name,
            fullName: `${municipality.name}, ${region.name}`,
            latitude: municipality.latitude,
            longitude: municipality.longitude
          });
        });
      });
      
      setLocations(flattenedLocations);
    } catch (error) {
      console.error('Error loading Finland locations:', error);
    }
  };

  const searchLocations = (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    const filtered = locations
      .filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.name.toLowerCase() === searchQuery.toLowerCase();
        const bExact = b.name.toLowerCase() === searchQuery.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then by name length (shorter names first)
        return a.name.length - b.name.length;
      })
      .slice(0, 10); // Limit to 10 suggestions

    setSuggestions(filtered);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchLocations(newQuery);
    setIsOpen(true);
  };

  const handleSuggestionClick = (location) => {
    const fullLocation = location.fullName;
    setQuery(fullLocation);
    onChange(fullLocation, location.latitude, location.longitude);
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
              {suggestions.map((location, index) => (
                <button
                  key={`${location.id}-${index}`}
                  onClick={() => handleSuggestionClick(location)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-white/70">
                      {location.region}
                    </div>
                    <div className="text-xs text-white/50">
                      Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-white/70">
              No locations found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
