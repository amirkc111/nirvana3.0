'use client';

import { useState, useEffect } from 'react';

const VedicJyotishEmbed = ({ birthData, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize VedicJyotish system
        initializeVedicJyotish();
    }, []);

    const initializeVedicJyotish = async () => {
        try {
            setLoading(true);
            
            // Create URL parameters for VedicJyotish
            const params = new URLSearchParams({
                name: birthData.name,
                date: formatDateForVedicJyotish(birthData),
                time: formatTimeForVedicJyotish(birthData),
                lat: birthData.birth_latitude || birthData.lat,
                lon: birthData.birth_longitude || birthData.lon,
                tznm: getTimezoneForVedicJyotish(birthData),
                city: birthData.birth_place || birthData.city
            });

            // Create iframe URL (Next.js route with save button) with cache busting
            const timestamp = Date.now();
            const vedicJyotishUrl = `/vedicjyotish?${params.toString()}&t=${timestamp}`;
            
            console.log('🔮 VedicJyotish URL:', vedicJyotishUrl);
            setLoading(false);
        } catch (error) {
            console.error('❌ Error initializing VedicJyotish:', error);
            setError('Failed to initialize VedicJyotish system');
            setLoading(false);
        }
    };

    const formatDateForVedicJyotish = (birthData) => {
        let year = birthData.birth_year;
        let month = birthData.birth_month;
        let day = birthData.birth_day;

        if (birthData.date_system === 'BS') {
            year = year - 57; // Convert BS to AD
        }

        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };

    const formatTimeForVedicJyotish = (birthData) => {
        let hour = birthData.birth_hour;
        let minute = birthData.birth_minute;
        let second = birthData.birth_second || 0;

        if (birthData.time_system === 'PM' && hour !== 12) {
            hour = hour + 12;
        } else if (birthData.time_system === 'AM' && hour === 12) {
            hour = 0;
        }

        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    };

    const getTimezoneForVedicJyotish = (birthData) => {
        if (birthData.timezone) {
            return birthData.timezone;
        }

        const lat = birthData.birth_latitude || birthData.lat;
        const lon = birthData.birth_longitude || birthData.lon;

        if (lat >= 26 && lat <= 30 && lon >= 80 && lon <= 88) {
            return 'Asia/Kathmandu';
        } else if (lat >= 6 && lat <= 37 && lon >= 68 && lon <= 97) {
            return 'Asia/Kolkata';
        } else {
            return 'Asia/Kathmandu';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-8 max-w-md mx-4">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg font-medium">Loading VedicJyotish System...</span>
                    </div>
                    <p className="text-gray-600 mt-2">Initializing astrological calculations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-8 max-w-md mx-4">
                    <div className="text-red-600 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold mb-2">Error</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Create URL parameters
    const params = new URLSearchParams({
        name: birthData.name,
        date: formatDateForVedicJyotish(birthData),
        time: formatTimeForVedicJyotish(birthData),
        lat: birthData.birth_latitude || birthData.lat,
        lon: birthData.birth_longitude || birthData.lon,
        tznm: getTimezoneForVedicJyotish(birthData),
        city: birthData.birth_place || birthData.city
    });

    const timestamp = Date.now();
    const vedicJyotishUrl = `/vedicjyotish?${params.toString()}&t=${timestamp}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full h-full max-w-7xl mx-4 bg-white rounded-lg overflow-hidden">
                {/* Header - Hidden */}
                {/* <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            VedicJyotish Kundli - {birthData.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Powered by Swiss Ephemeris & VedicJyotish System
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div> */}

                {/* VedicJyotish iframe */}
                <div className="h-full">
                    <iframe
                        src={vedicJyotishUrl}
                        className="w-full h-full border-0"
                        title="VedicJyotish Kundli"
                        onLoad={() => {
                            console.log('✅ VedicJyotish iframe loaded successfully');
                        }}
                        onError={() => {
                            console.error('❌ Failed to load VedicJyotish iframe');
                            setError('Failed to load VedicJyotish system');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VedicJyotishEmbed;
