"use client";

import { useState, useEffect, useRef } from 'react';

export default function NepalLocationSearch({ 
  value, 
  onChange, 
  placeholder = "Search for your birth place in Nepal...",
  className = ""
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load Nepal locations from JSON
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadNepalLocations();
  }, []);

  const loadNepalLocations = async () => {
    try {
      const response = await fetch('/nepal_location.json');
      const data = await response.json();
      
      // Flatten the hierarchical structure
      const flattenedLocations = [];
      
      data.provinceList.forEach(province => {
        province.districtList.forEach(district => {
          district.municipalityList.forEach(municipality => {
            flattenedLocations.push({
              id: municipality.id,
              name: municipality.name,
              district: district.name,
              province: province.name,
              fullName: `${municipality.name}, ${district.name}, ${province.name}`,
              // Add approximate coordinates based on district
              latitude: getApproximateLatitude(district.name),
              longitude: getApproximateLongitude(district.name)
            });
          });
        });
      });
      
      setLocations(flattenedLocations);
    } catch (error) {
      console.error('Error loading Nepal locations:', error);
    }
  };

  // Approximate coordinates for major districts
  const getApproximateLatitude = (districtName) => {
    const coordinates = {
      'KATHMANDU': 27.7172,
      'LALITPUR': 27.6710,
      'BHAKTAPUR': 27.6710,
      'KAVREPALANCHOK': 27.6333,
      'NUWAKOT': 27.9167,
      'DHADING': 28.0000,
      'SINDHUPALCHOWK': 27.9167,
      'RASUWA': 28.2500,
      'DOLAKHA': 27.7500,
      'RAMECHHAP': 27.3333,
      'SINDHULI': 27.2500,
      'MAKWANPUR': 27.4167,
      'CHITWAN': 27.5000,
      'GORKHA': 28.0000,
      'MANANG': 28.6667,
      'MUSTANG': 28.8333,
      'MYAGDI': 28.3333,
      'KASKI': 28.2000,
      'LAMJUNG': 28.2500,
      'TANAHU': 27.9167,
      'SYANGJA': 28.0833,
      'PARBAT': 28.2500,
      'BAGLUNG': 28.2500,
      'POKHARA': 28.2000,
      'DOTI': 29.2500,
      'ACHHAM': 29.1667,
      'BAITADI': 29.5000,
      'DADELDHURA': 29.3333,
      'BAJHANG': 29.6667,
      'BAJURA': 29.5000,
      'DARCHULA': 29.6667,
      'KANCHANPUR': 28.8333,
      'KAILALI': 28.6667,
      'DANG': 28.0000,
      'BANKE': 28.0833,
      'BARDIYA': 28.2500,
      'RUPANDEHI': 27.5000,
      'KAPILVASTU': 27.5000,
      'NAWALPARASI': 27.6667,
      'PALPA': 27.8333,
      'ARGHAKHANCHI': 27.9167,
      'GULMI': 28.0833,
      'PYUTHAN': 28.0833,
      'ROLPA': 28.2500,
      'RUKUM': 28.5000,
      'SALYAN': 28.3333,
      'SURKHET': 28.5833,
      'DAILEKH': 28.7500,
      'KALIKOT': 29.0000,
      'JUMLA': 29.2500,
      'HUMLA': 29.7500,
      'MUGU': 29.5000,
      'DOLPA': 29.0000,
      'JAJARKOT': 28.7500,
      'RUKUM': 28.5000,
      'SALYAN': 28.3333,
      'SURKHET': 28.5833,
      'DAILEKH': 28.7500,
      'KALIKOT': 29.0000,
      'JUMLA': 29.2500,
      'HUMLA': 29.7500,
      'MUGU': 29.5000,
      'DOLPA': 29.0000,
      'JAJARKOT': 28.7500
    };
    
    return coordinates[districtName] || 27.7172; // Default to Kathmandu
  };

  const getApproximateLongitude = (districtName) => {
    const coordinates = {
      'KATHMANDU': 85.3240,
      'LALITPUR': 85.3240,
      'BHAKTAPUR': 85.3240,
      'KAVREPALANCHOK': 85.5000,
      'NUWAKOT': 85.2500,
      'DHADING': 84.9167,
      'SINDHUPALCHOWK': 85.7500,
      'RASUWA': 85.3333,
      'DOLAKHA': 86.1667,
      'RAMECHHAP': 86.2500,
      'SINDHULI': 85.9167,
      'MAKWANPUR': 85.0833,
      'CHITWAN': 84.4167,
      'GORKHA': 84.6667,
      'MANANG': 84.0000,
      'MUSTANG': 83.8333,
      'MYAGDI': 83.6667,
      'KASKI': 83.9167,
      'LAMJUNG': 84.3333,
      'TANAHU': 84.2500,
      'SYANGJA': 83.8333,
      'PARBAT': 83.7500,
      'BAGLUNG': 83.5833,
      'POKHARA': 83.9167,
      'DOTI': 80.5833,
      'ACHHAM': 81.0833,
      'BAITADI': 80.4167,
      'DADELDHURA': 80.5833,
      'BAJHANG': 81.2500,
      'BAJURA': 81.5000,
      'DARCHULA': 80.6667,
      'KANCHANPUR': 80.1667,
      'KAILALI': 80.5833,
      'DANG': 82.5000,
      'BANKE': 81.6667,
      'BARDIYA': 81.4167,
      'RUPANDEHI': 83.4167,
      'KAPILVASTU': 83.0000,
      'NAWALPARASI': 84.0000,
      'PALPA': 83.5833,
      'ARGHAKHANCHI': 83.2500,
      'GULMI': 83.2500,
      'PYUTHAN': 82.8333,
      'ROLPA': 82.5000,
      'RUKUM': 82.5000,
      'SALYAN': 82.0833,
      'SURKHET': 81.6667,
      'DAILEKH': 81.7500,
      'KALIKOT': 81.7500,
      'JUMLA': 82.1667,
      'HUMLA': 81.8333,
      'MUGU': 82.0833,
      'DOLPA': 82.9167,
      'JAJARKOT': 82.1667
    };
    
    return coordinates[districtName] || 85.3240; // Default to Kathmandu
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
        location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                      {location.district}, {location.province}
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
