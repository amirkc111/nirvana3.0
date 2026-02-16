'use client';

import { useState, useEffect } from 'react';
import realKundliService from '../lib/vedicjyotish/realKundliService';

const RealKundliForm = ({ onClose, onSubmit }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        date: '',
        time: '',
        city: '',
        lat: '',
        lon: '',
        tznm: 'Asia/Kathmandu',
        tz: 5.75,
        fatherName: '',
        motherName: '',
        gotra: '',
        nawranName: ''
    });

    const [cityList, setCityList] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [timezoneMap, setTimezoneMap] = useState({
        "Asia/Kathmandu": 5.75,
        "Asia/Kolkata": 5.5,
        "Asia/Dhaka": 6.0,
        "Asia/Karachi": 5.0,
        "Asia/Colombo": 5.5
    });

    // Approximate coordinates for Nepal districts
    const getApproximateLatitude = (districtName) => {
        const coordinates = {
            'KATHMANDU': 27.7172, 'LALITPUR': 27.6710, 'BHAKTAPUR': 27.6710,
            'KAVREPALANCHOK': 27.6333, 'NUWAKOT': 27.9167, 'DHADING': 28.0000,
            'SINDHUPALCHOWK': 27.9167, 'RASUWA': 28.2500, 'DOLAKHA': 27.7500,
            'RAMECHHAP': 27.3333, 'SINDHULI': 27.2500, 'MAKWANPUR': 27.4167,
            'CHITWAN': 27.5000, 'GORKHA': 28.0000, 'MANANG': 28.6667,
            'MUSTANG': 28.8333, 'MYAGDI': 28.3333, 'KASKI': 28.2000,
            'LAMJUNG': 28.2500, 'TANAHU': 27.9167, 'SYANGJA': 28.0833,
            'PARBAT': 28.2500, 'BAGLUNG': 28.2500, 'POKHARA': 28.2000,
            'DOTI': 29.2500, 'ACHHAM': 29.1667, 'BAITADI': 29.5000,
            'DADELDHURA': 29.3333, 'BAJHANG': 29.6667, 'BAJURA': 29.5000,
            'DARCHULA': 29.6667, 'KANCHANPUR': 28.8333, 'KAILALI': 28.6667,
            'DANG': 28.0000, 'BANKE': 28.0833, 'BARDIYA': 28.2500,
            'RUPANDEHI': 27.5000, 'KAPILVASTU': 27.5000, 'NAWALPARASI': 27.6667,
            'PALPA': 27.8333, 'ARGHAKHANCHI': 27.9167, 'GULMI': 28.0833,
            'PYUTHAN': 28.0833, 'ROLPA': 28.2500, 'RUKUM': 28.5000,
            'SALYAN': 28.3333, 'SURKHET': 28.5833, 'DAILEKH': 28.7500,
            'KALIKOT': 29.0000, 'JUMLA': 29.2500, 'HUMLA': 29.7500,
            'MUGU': 29.5000, 'DOLPA': 29.0000, 'JAJARKOT': 28.7500
        };
        return coordinates[districtName.toUpperCase()] || 27.7172;
    };

    const getApproximateLongitude = (districtName) => {
        const coordinates = {
            'KATHMANDU': 85.3240, 'LALITPUR': 85.3240, 'BHAKTAPUR': 85.3240,
            'KAVREPALANCHOK': 85.5000, 'NUWAKOT': 85.2500, 'DHADING': 84.9167,
            'SINDHUPALCHOWK': 85.7500, 'RASUWA': 85.3333, 'DOLAKHA': 86.1667,
            'RAMECHHAP': 86.2500, 'SINDHULI': 85.9167, 'MAKWANPUR': 85.0833,
            'CHITWAN': 84.4167, 'GORKHA': 84.6667, 'MANANG': 84.0000,
            'MUSTANG': 83.8333, 'MYAGDI': 83.6667, 'KASKI': 83.9167,
            'LAMJUNG': 84.3333, 'TANAHU': 84.2500, 'SYANGJA': 83.8333,
            'PARBAT': 83.7500, 'BAGLUNG': 83.5833, 'POKHARA': 83.9167,
            'DOTI': 80.5833, 'ACHHAM': 81.0833, 'BAITADI': 80.4167,
            'DADELDHURA': 80.5833, 'BAJHANG': 81.2500, 'BAJURA': 81.5000,
            'DARCHULA': 80.6667, 'KANCHANPUR': 80.1667, 'KAILALI': 80.5833,
            'DANG': 82.5000, 'BANKE': 81.6667, 'BARDIYA': 81.4167,
            'RUPANDEHI': 83.4167, 'KAPILVASTU': 83.0000, 'NAWALPARASI': 84.0000,
            'PALPA': 83.5833, 'ARGHAKHANCHI': 83.2500, 'GULMI': 83.2500,
            'PYUTHAN': 82.8333, 'ROLPA': 82.5000, 'RUKUM': 82.5000,
            'SALYAN': 82.0833, 'SURKHET': 81.6667, 'DAILEKH': 81.7500,
            'KALIKOT': 81.7500, 'JUMLA': 82.1667, 'HUMLA': 81.8333,
            'MUGU': 82.0833, 'DOLPA': 82.9167, 'JAJARKOT': 82.1667
        };
        return coordinates[districtName.toUpperCase()] || 85.3240;
    };

    // Load city data
    useEffect(() => {
        const loadCityData = async () => {
            try {
                // Load Nepal locations
                const response = await fetch('/nepal_location.json');
                const nepalData = await response.json();
                const nepalCitiesFormatted = [];

                if (nepalData.provinceList) {
                    nepalData.provinceList.forEach(province => {
                        province.districtList.forEach(district => {
                            district.municipalityList.forEach(municipality => {
                                nepalCitiesFormatted.push([
                                    `${municipality.name}, ${district.name}, Nepal`,
                                    municipality.latitude || getApproximateLatitude(district.name),
                                    municipality.longitude || getApproximateLongitude(district.name),
                                    'Asia/Kathmandu'
                                ]);
                            });
                        });
                    });
                }
                setCityList(nepalCitiesFormatted.length > 0 ? nepalCitiesFormatted : fallbackCities);
            } catch (error) {
                console.log('Using fallback city data');
                // Fallback data
                const fallbackCities = [
                    ['Kathmandu, Bagmati Province, Nepal', 27.7172, 85.3240, 'Asia/Kathmandu'],
                    ['Pokhara, Gandaki Province, Nepal', 28.2096, 83.9856, 'Asia/Kathmandu'],
                    ['Lalitpur, Bagmati Province, Nepal', 27.6667, 85.3333, 'Asia/Kathmandu'],
                    ['Bharatpur, Bagmati Province, Nepal', 27.6777, 84.4356, 'Asia/Kathmandu'],
                    ['Biratnagar, Province No. 1, Nepal', 26.4521, 87.2718, 'Asia/Kathmandu'],
                    ['Birgunj, Province No. 2, Nepal', 27.0000, 84.8667, 'Asia/Kathmandu'],
                    ['Dharan, Province No. 1, Nepal', 26.8167, 87.2833, 'Asia/Kathmandu'],
                    ['Butwal, Lumbini Province, Nepal', 27.7000, 83.4500, 'Asia/Kathmandu'],
                    ['Hetauda, Bagmati Province, Nepal', 27.4167, 85.0333, 'Asia/Kathmandu'],
                    ['Nepalgunj, Lumbini Province, Nepal', 28.0500, 81.6167, 'Asia/Kathmandu']
                ];
                setCityList(fallbackCities);
            }
        };

        loadCityData();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCityChange = (val) => {
        handleInputChange('city', val);
        if (val.trim() && Array.isArray(cityList)) {
            const matches = cityList.filter(([name]) =>
                name.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredCities(matches.slice(0, 10));
        } else {
            setFilteredCities([]);
        }
    };

    const handleCitySelect = (cityData) => {
        const [city, lat, lon, tznm] = cityData.split('|');
        setFormData(prev => ({
            ...prev,
            city,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            tznm,
            tz: timezoneMap[tznm] || 5.75
        }));
        setFilteredCities([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name || !formData.date || !formData.time || !formData.city) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            // Prepare birth data for VedicJyotish system
            const birthData = {
                name: formData.name,
                gender: formData.gender,
                birthYear: parseInt(formData.date.split('-')[0]),
                birthMonth: parseInt(formData.date.split('-')[1]),
                birthDay: parseInt(formData.date.split('-')[2]),
                birthHour: parseInt(formData.time.split(':')[0]),
                birthMinute: parseInt(formData.time.split(':')[1]),
                latitude: formData.lat,
                longitude: formData.lon,
                timezone: formData.tz,
                timezoneName: formData.tznm,
                city: formData.city,
                // Advanced details
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                gotra: formData.gotra,
                nawranName: formData.nawranName
            };

            console.log('🔮 Calculating Kundli with VedicJyotish system...');
            console.log('📊 Birth Data:', birthData);

            // Use the real VedicJyotish service
            const kundliData = await realKundliService.calculateKundli(birthData);

            console.log('✅ Kundli calculated successfully:', kundliData);

            // Call the onSubmit callback with the real Kundli data
            if (onSubmit) {
                onSubmit(kundliData);
            }

        } catch (error) {
            console.error('❌ Error calculating Kundli:', error);
            alert('Failed to generate Kundli. Please check your birth details and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            gender: 'Male',
            date: '',
            time: '',
            city: '',
            lat: '',
            lon: '',
            tznm: 'Asia/Kathmandu',
            tz: 5.75,
            fatherName: '',
            motherName: '',
            gotra: '',
            nawranName: ''
        });
        setFilteredCities([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="rounded-xl bg-white p-8 shadow-lg">
                    <div className="mb-6 flex items-center">
                        <button
                            onClick={onClose}
                            className="mr-4 text-purple-600 transition-colors hover:text-purple-800">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Create Kundli
                            </h2>
                            <p className="text-sm text-purple-600 font-medium">
                                Powered by VedicJyotish System
                            </p>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="mb-4 rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4 text-base font-medium text-gray-700">
                            <span className="block">Enter Birthdata</span>
                            <span className="text-sm text-gray-600">
                                कुंडली के लिए जन्म विवरण
                            </span>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Gender
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-300 p-3 pr-10 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                    />
                                    <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Time of Birth
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className="w-full rounded-lg border border-gray-300 p-3 pr-10 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                        value={formData.time}
                                        onChange={(e) => handleInputChange('time', e.target.value)}
                                        required
                                    />
                                    <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Place of Birth */}
                        <div className="relative">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Place of Birth
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-lg border border-gray-300 p-3 pr-10 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                    type="search"
                                    value={formData.city}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    placeholder="Enter City, State, Country Name"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="none"
                                    spellCheck="false"
                                    required
                                />
                                <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>

                            {filteredCities.length > 0 && (
                                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                                    {filteredCities.map(([city, lat, lon, tz], idx) => (
                                        <div
                                            key={idx}
                                            className="cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-purple-50"
                                            onClick={() => handleCitySelect(`${city}|${lat}|${lon}|${tz}`)}
                                        >
                                            {city}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-gray-600">
                                <p className="mb-1">
                                    <svg className="inline mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <strong>Tip:</strong> Type your city in <strong>English</strong> and choose from the list.
                                </p>
                                <p className="mb-1">
                                    <svg className="inline mr-1 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    If not found, pick the nearest major city instead.
                                </p>
                                <p>
                                    <svg className="inline mr-1 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Select the correct city from the list to <strong>auto-fill the timezone and latitude/longitude</strong>
                                </p>
                            </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="border-t pt-6">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="advanced_options_switch"
                                    checked={showAdvanced}
                                    onChange={(e) => setShowAdvanced(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-purple-600 focus:ring-2 focus:ring-purple-500"
                                />
                                <label htmlFor="advanced_options_switch" className="cursor-pointer text-sm font-medium text-gray-700">
                                    Advanced Options
                                </label>
                            </div>

                            {showAdvanced && (
                                <div className="mt-6 space-y-6 rounded-lg bg-gray-50 p-4">
                                    {/* Advanced Personal Details */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Father's Name (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter father's name"
                                                value={formData.fatherName}
                                                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Mother's Name (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter mother's name"
                                                value={formData.motherName}
                                                onChange={(e) => handleInputChange('motherName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Gotra (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter gotra"
                                                value={formData.gotra}
                                                onChange={(e) => handleInputChange('gotra', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Nawran/Birth Name (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter nawran name"
                                                value={formData.nawranName}
                                                onChange={(e) => handleInputChange('nawranName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            TimeZone
                                        </label>
                                        <select
                                            className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            value={formData.tznm}
                                            onChange={(e) => handleInputChange('tznm', e.target.value)}
                                        >
                                            {Object.entries(timezoneMap).map(([tznm, tz_offset]) => (
                                                <option key={tznm} value={tznm}>
                                                    {tznm} [{tz_offset > 0 ? '+' : ''}{tz_offset}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Latitude
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                placeholder="26.0685"
                                                value={formData.lat}
                                                onChange={(e) => handleInputChange('lat', parseFloat(e.target.value))}
                                                min="-90"
                                                max="90"
                                                step="0.00000001"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Longitude
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border border-gray-300 p-3 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                                placeholder="83.0108"
                                                value={formData.lon}
                                                onChange={(e) => handleInputChange('lon', parseFloat(e.target.value))}
                                                min="-180"
                                                max="180"
                                                step="0.00000001"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit and Reset Buttons */}
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Calculating...
                                    </div>
                                ) : (
                                    'Generate Kundli'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RealKundliForm;