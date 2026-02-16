'use client';

import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
// Using inline SVG icons instead of react-icons

const KundliForm = ({ onClose, onSubmit, initialData = null }) => {
    const { t } = useLanguage();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        date: '',
        time: '',
        city: '',
        lat: '',
        lon: '',
        tznm: 'Asia/Kathmandu',
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
        // Load from your existing city data
        const loadCityData = async () => {
            try {
                // Load Nepal locations
                const nepalResponse = await fetch('/nepal_location.json');
                const nepalData = await nepalResponse.json();
                const nepalCitiesFormatted = [];

                if (nepalData.provinceList) {
                    nepalData.provinceList.forEach(province => {
                        province.districtList.forEach(district => {
                            district.municipalityList.forEach(municipality => {
                                // Nepal typically uses Asia/Kathmandu (UTC+5:45 = 5.75)
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

                // Load Finland locations
                const finlandResponse = await fetch('/finland_location.json');
                const finlandData = await finlandResponse.json();
                const finlandCitiesFormatted = [];

                if (finlandData.regionList) {
                    finlandData.regionList.forEach(region => {
                        region.municipalityList.forEach(muni => {
                            finlandCitiesFormatted.push([
                                `${muni.name}, ${region.name}, Finland`,
                                muni.latitude,
                                muni.longitude,
                                'Europe/Helsinki'
                            ]);
                        });
                    });
                }

                // Combine both datasets
                const combinedCities = [...nepalCitiesFormatted, ...finlandCitiesFormatted];
                setCityList(combinedCities.length > 0 ? combinedCities : fallbackCities);
            } catch (error) {
                console.log('Using fallback city data');
                // Fallback data with Nepal and Finland cities
                const fallbackCities = [
                    // Nepal Cities
                    ['Kathmandu, Bagmati Province, Nepal', 27.7172, 85.3240, 'Asia/Kathmandu'],
                    ['Pokhara, Gandaki Province, Nepal', 28.2096, 83.9856, 'Asia/Kathmandu'],
                    ['Lalitpur, Bagmati Province, Nepal', 27.6667, 85.3333, 'Asia/Kathmandu'],
                    ['Bharatpur, Bagmati Province, Nepal', 27.6777, 84.4356, 'Asia/Kathmandu'],
                    ['Biratnagar, Province No. 1, Nepal', 26.4521, 87.2718, 'Asia/Kathmandu'],
                    ['Birgunj, Province No. 2, Nepal', 27.0000, 84.8667, 'Asia/Kathmandu'],
                    ['Dharan, Province No. 1, Nepal', 26.8167, 87.2833, 'Asia/Kathmandu'],
                    ['Butwal, Lumbini Province, Nepal', 27.7000, 83.4500, 'Asia/Kathmandu'],
                    ['Hetauda, Bagmati Province, Nepal', 27.4167, 85.0333, 'Asia/Kathmandu'],
                    ['Nepalgunj, Lumbini Province, Nepal', 28.0500, 81.6167, 'Asia/Kathmandu'],
                    ['Janakpur, Province No. 2, Nepal', 26.7288, 85.9254, 'Asia/Kathmandu'],
                    ['Bhairahawa, Lumbini Province, Nepal', 27.5000, 83.4500, 'Asia/Kathmandu'],
                    ['Dhangadhi, Sudurpashchim Province, Nepal', 28.6869, 80.6219, 'Asia/Kathmandu'],
                    ['Tansen, Lumbini Province, Nepal', 27.8667, 83.5500, 'Asia/Kathmandu'],
                    ['Ilam, Province No. 1, Nepal', 26.9094, 87.9281, 'Asia/Kathmandu'],

                    // Finland Cities
                    ['Helsinki, Uusimaa, Finland', 60.1699, 24.9384, 'Europe/Helsinki'],
                    ['Espoo, Uusimaa, Finland', 60.2052, 24.6522, 'Europe/Helsinki'],
                    ['Tampere, Pirkanmaa, Finland', 61.4991, 23.7871, 'Europe/Helsinki'],
                    ['Vantaa, Uusimaa, Finland', 60.2941, 25.0406, 'Europe/Helsinki'],
                    ['Oulu, North Ostrobothnia, Finland', 65.0121, 25.4651, 'Europe/Helsinki'],
                    ['Turku, Southwest Finland, Finland', 60.4518, 22.2666, 'Europe/Helsinki'],
                    ['Jyväskylä, Central Finland, Finland', 62.2415, 25.7209, 'Europe/Helsinki'],
                    ['Lahti, Päijät-Häme, Finland', 60.9827, 25.6612, 'Europe/Helsinki'],
                    ['Kuopio, North Savo, Finland', 62.8924, 27.6770, 'Europe/Helsinki'],
                    ['Pori, Satakunta, Finland', 61.4851, 21.7978, 'Europe/Helsinki'],
                    ['Kouvola, Kymenlaakso, Finland', 60.8681, 26.7046, 'Europe/Helsinki'],
                    ['Joensuu, North Karelia, Finland', 62.6012, 29.7636, 'Europe/Helsinki'],
                    ['Lappeenranta, South Karelia, Finland', 61.0587, 28.1887, 'Europe/Helsinki'],
                    ['Hämeenlinna, Kanta-Häme, Finland', 61.0030, 24.4648, 'Europe/Helsinki'],
                    ['Vaasa, Ostrobothnia, Finland', 63.0960, 21.6158, 'Europe/Helsinki'],
                    ['Seinäjoki, South Ostrobothnia, Finland', 62.7889, 22.8283, 'Europe/Helsinki'],
                    ['Rovaniemi, Lapland, Finland', 66.5039, 25.7294, 'Europe/Helsinki'],
                    ['Mikkeli, South Savo, Finland', 61.6886, 27.2723, 'Europe/Helsinki'],
                    ['Kotka, Kymenlaakso, Finland', 60.4664, 26.9458, 'Europe/Helsinki'],
                    ['Salo, Southwest Finland, Finland', 60.3831, 23.1331, 'Europe/Helsinki']
                ];
                setCityList(fallbackCities);
            }
        };

        loadCityData();
        loadCityData();
    }, []);

    // Populate form if initialData is provided
    useEffect(() => {
        if (initialData) {
            // Convert time back to 24h format for input
            let hour = initialData.birth_hour;
            if (initialData.time_system === 'PM' && hour !== 12) hour += 12;
            if (initialData.time_system === 'AM' && hour === 12) hour = 0;
            const timeStr = `${hour.toString().padStart(2, '0')}:${initialData.birth_minute.toString().padStart(2, '0')}`;

            // Format Date
            const dateStr = `${initialData.birth_year}-${initialData.birth_month.toString().padStart(2, '0')}-${initialData.birth_day.toString().padStart(2, '0')}`;

            setFormData({
                name: initialData.name || '',
                gender: initialData.gender || 'Male',
                date: dateStr,
                time: timeStr,
                city: initialData.birth_place || '',
                lat: initialData.birth_latitude || '',
                lon: initialData.birth_longitude || '',
                tznm: initialData.timezone_name || 'Asia/Kathmandu',
                tznm: initialData.timezone_name || 'Asia/Kathmandu',
                tz: initialData.timezone || 5.75,
                fatherName: initialData.father_name || '',
                motherName: initialData.mother_name || '',
                gotra: initialData.gotra || '',
                nawranName: initialData.nawran_name || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCityChange = (val) => {
        handleInputChange('city', val);
        if (val.trim()) {
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
            setAlertMessage('Please fill in all required fields');
            setShowAlert(true);
            return;
        }

        setIsLoading(true);

        try {
            // Get current user with better error handling
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            console.log('🔍 Authentication check:', { user, userError });

            if (userError) {
                console.error('❌ Authentication error:', userError);
                setAlertMessage(`Authentication error: ${userError.message}. Please log in again.`);
                setShowAlert(true);
                setIsLoading(false);
                return;
            }

            if (!user) {
                console.log('❌ No user found');
                setAlertMessage('You must be logged in to save your Kundli. Please log in and try again.');
                setShowAlert(true);
                setIsLoading(false);
                return;
            }

            if (!user.id) {
                console.log('❌ User ID is missing');
                setAlertMessage('Invalid user session. Please log in again.');
                setShowAlert(true);
                setIsLoading(false);
                return;
            }

            console.log('✅ User authenticated:', { id: user.id, email: user.email });

            // Prepare birth data for database (with updated schema)
            const birthHour = parseInt(formData.time.split(':')[0]);
            const birthMinute = parseInt(formData.time.split(':')[1]);

            // Determine time system based on hour (12-hour format)
            const timeSystem = birthHour >= 12 ? 'PM' : 'AM';
            const displayHour = birthHour > 12 ? birthHour - 12 : (birthHour === 0 ? 12 : birthHour);

            const birthData = {
                user_id: user.id,
                name: formData.name,
                gender: formData.gender,
                birth_year: parseInt(formData.date.split('-')[0]),
                birth_month: parseInt(formData.date.split('-')[1]),
                birth_day: parseInt(formData.date.split('-')[2]),
                birth_hour: displayHour, // Convert to 12-hour format
                birth_minute: birthMinute,
                birth_second: 0,
                birth_place: formData.city,
                birth_latitude: parseFloat(formData.lat),
                birth_longitude: parseFloat(formData.lon),
                timezone: formData.tz,
                timezone_name: formData.tznm,
                date_system: 'AD',
                time_system: timeSystem,
                relation: 'Self'
            };

            console.log('Saving Kundli data (birthData):', birthData);

            // Create payload for DB
            const dbPayload = {
                ...birthData,
                father_name: formData.fatherName,
                mother_name: formData.motherName,
                gotra: formData.gotra,
                nawran_name: formData.nawranName
            };

            // Remove only fields that are explicitly known to cause schema issues
            // gender is definitely supported in the latest schema
            delete dbPayload.timezone;
            delete dbPayload.timezone_name;

            console.log('Final DB Payload:', dbPayload);

            console.log('Final DB Payload:', dbPayload);

            let resultData;
            let resultError;

            if (initialData?.id) {
                // UPDATE existing record
                const res = await supabase
                    .from('kundli_data')
                    .update(dbPayload)
                    .eq('id', initialData.id)
                    .select();
                resultData = res.data;
                resultError = res.error;
            } else {
                // INSERT new record
                const res = await supabase
                    .from('kundli_data')
                    .insert([dbPayload])
                    .select();
                resultData = res.data;
                resultError = res.error;
            }

            if (resultError) {
                console.error('Error saving Kundli:', resultError);
                setAlertMessage(`Failed to save Kundli: ${resultError.message}`);
                setShowAlert(true);
                setIsLoading(false);
                return;
            }

            console.log('Kundli saved successfully:', resultData);

            // SYNC TO JSON FILE
            try {
                console.log('🔄 Syncing to JSON file with email:', user.email);
                console.log('📝 Advanced Details to sync:', {
                    father: formData.fatherName,
                    mother: formData.motherName,
                    gotra: formData.gotra,
                    nawran: formData.nawranName
                });

                const syncResponse = await fetch('/api/sync-json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...birthData,
                        email: user.email, // Required for filename
                        fatherName: formData.fatherName,
                        motherName: formData.motherName,
                        gotra: formData.gotra,
                        nawranName: formData.nawranName,
                        // Add other fields you want in the JSON
                        lat: formData.lat,
                        lon: formData.lon,
                        city: formData.city,
                        date: formData.date,
                        time: formData.time,
                        tznm: formData.tznm,
                        tz: formData.tz
                    }),
                });

                if (!syncResponse.ok) {
                    const errText = await syncResponse.text();
                    console.error('❌ Failed to sync JSON file:', errText);
                    setAlertMessage(`Database saved, but file sync failed: ${errText}`);
                    setShowAlert(true);
                } else {
                    console.log('✅ JSON file synced successfully');
                }
            } catch (syncError) {
                console.error('❌ Error calling sync-json:', syncError);
                setAlertMessage(`Database saved, but file sync error: ${syncError.message}`);
                setShowAlert(true);
            }

            // Call the onSubmit callback with the birth data if provided
            if (onSubmit) {
                onSubmit(birthData);
            }

            // Close the form immediately without showing success message
            if (onClose) {
                onClose();
            }

        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setAlertMessage(`An error occurred while saving your Kundli: ${error.message}`);
            setShowAlert(true);
        } finally {
            setIsLoading(false);
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
        <Fragment>
            <div className="w-full max-w-2xl mx-auto">
                <div className="rounded-lg bg-white p-6 shadow-lg border border-gray-200">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={onClose}
                                className="mr-3 text-gray-600 transition-colors hover:text-gray-800">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">
                                {initialData ? t('editKundali') : t('createKundali')}
                            </h2>
                        </div>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>

                        {/* Full Name */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {t('fullName')}
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                placeholder={t('enterFullName')}
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {t('gender')}
                            </label>
                            <select
                                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                            >
                                <option value="Male">{t('male')}</option>
                                <option value="Female">{t('female')}</option>
                            </select>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('dateOfBirth')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full rounded-md border border-gray-300 p-2 pr-8 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                    />
                                    <svg className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('timeOfBirth')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        className="w-full rounded-md border border-gray-300 p-2 pr-8 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        value={formData.time}
                                        onChange={(e) => handleInputChange('time', e.target.value)}
                                        required
                                    />
                                    <svg className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Place of Birth */}
                        <div className="relative">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {t('placeOfBirth')}
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-md border border-gray-300 p-2 pr-8 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    type="search"
                                    value={formData.city}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    placeholder={t('enterCityState')}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="none"
                                    spellCheck="false"
                                    required
                                />
                                <svg className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>

                            {filteredCities.length > 0 && (
                                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                                    {filteredCities.map(([city, lat, lon, tz], idx) => (
                                        <div
                                            key={idx}
                                            className="cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-purple-50 text-gray-900"
                                            onClick={() => handleCitySelect(`${city}|${lat}|${lon}|${tz}`)}
                                        >
                                            {city}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-2 rounded-md bg-blue-50 p-2.5 text-xs text-gray-600">
                                <p className="mb-1">
                                    <svg className="inline mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <strong>{t('tips')}:</strong> {t('tipCityEnglish')}
                                </p>
                                <p className="mb-1">
                                    <svg className="inline mr-1 h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {t('tipNearestCity')}
                                </p>
                                <p>
                                    <svg className="inline mr-1 h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t('tipCorrectCity')}
                                </p>
                            </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="border-t pt-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="advanced_options_switch"
                                    checked={showAdvanced}
                                    onChange={(e) => setShowAdvanced(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-purple-600 focus:ring-2 focus:ring-purple-500"
                                />
                                <label htmlFor="advanced_options_switch" className="cursor-pointer text-sm font-medium text-gray-700">
                                    {t('advancedOptions')}
                                </label>
                            </div>

                            {showAdvanced && (
                                <div className="mt-4 space-y-4 rounded-lg bg-gray-50 p-4">
                                    {/* Advanced Personal Details */}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                {t('fatherName')} ({t('optional')})
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                placeholder="Enter father's name"
                                                value={formData.fatherName}
                                                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                {t('motherName')} ({t('optional')})
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                placeholder="Enter mother's name"
                                                value={formData.motherName}
                                                onChange={(e) => handleInputChange('motherName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                {t('gotra')} ({t('optional')})
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                placeholder="Enter gotra"
                                                value={formData.gotra}
                                                onChange={(e) => handleInputChange('gotra', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                {t('nawranName')} ({t('optional')})
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                placeholder="Enter nawran name"
                                                value={formData.nawranName}
                                                onChange={(e) => handleInputChange('nawranName', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit and Reset Buttons */}
                        <div className="flex space-x-3 pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors focus:ring-1 focus:ring-purple-500 focus:ring-offset-1 ${isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                            >
                                {isLoading ? t('saving') : (initialData ? t('edit') : t('generateKundli'))}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-1 focus:ring-gray-500 focus:ring-offset-1"
                            >
                                {t('reset')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Custom Alert Modal */}
            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t('notice')}
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {alertMessage}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAlert(false)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {t('ok')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default KundliForm;