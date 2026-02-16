'use client';

import { useState, useEffect, useRef } from 'react';
import DynamicKundliChart from './DynamicKundliChart';

export default function VedicKundliDisplay({ birthData, kundli, onClose, onBackToForm }) {
    const [storedKundli, setStoredKundli] = useState(kundli);
    const [kundliData, setKundliData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refs for chart containers
    const d1ChartRef = useRef(null);
    const d2ChartRef = useRef(null);
    const d6ChartRef = useRef(null);
    const d8ChartRef = useRef(null);
    const d9ChartRef = useRef(null);

    useEffect(() => {
        const fetchStoredData = async () => {
            if (kundli && kundli.name) {
                try {
                    const emailParam = kundli.email || birthData?.email || 'test@example.com';
                    const url = `/api/kundli-storage?name=${encodeURIComponent(kundli.name)}&email=${encodeURIComponent(emailParam)}`;
                    console.log('Fetching stored kundli data from:', url);

                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.analysis) {
                            console.log('✅ Loaded stored Kundli data (with Analysis/Dasha)');
                            setStoredKundli(data);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching stored kundli:', err);
                }
            }
        };
        fetchStoredData();
    }, [kundli, birthData]);

    useEffect(() => {
        const calculateKundli = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🔍 VedicJyotish-style Kundli calculation:', {
                    name: birthData.name,
                    birthYear: birthData.birthYear,
                    birthMonth: birthData.birthMonth,
                    birthDay: birthData.birthDay,
                    birthHour: birthData.birthHour,
                    birthMinute: birthData.birthMinute,
                    latitude: birthData.latitude,
                    longitude: birthData.longitude
                });

                // Use real VedicJyotish system with Swiss Ephemeris
                console.log('🔮 Using real VedicJyotish system with Swiss Ephemeris');

                // Import and use the real VedicJyotish calculation
                const { calculateKundli } = await import('../lib/vedicjyotish/simpleKundli.js');

                // Calculate real planetary positions using Swiss Ephemeris
                const kundli = await calculateKundli(birthData);

                console.log('✅ Real VedicJyotish calculation completed:', kundli);

                console.log('✅ VedicJyotish-style Kundli calculated successfully:', kundli);
                setKundliData(kundli);
            } catch (err) {
                console.error('❌ Error calculating VedicJyotish-style Kundli:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (birthData) {
            calculateKundli();
        }
    }, [birthData]);


    // Load KundaliSVG script
    useEffect(() => {
        const loadKundaliScript = () => {
            // Check if script is already loaded or loading
            if (window.KundaliSVG) {
                console.log('✅ KundaliSVG already available');
                return;
            }

            // Check if script is already in DOM
            const existingScript = document.querySelector('script[src="/kundali.js"]');
            if (existingScript) {
                console.log('✅ KundaliSVG script already exists in DOM');
                return;
            }

            console.log('🔄 Loading KundaliSVG script...');
            const script = document.createElement('script');
            script.src = '/kundali.js';
            script.onload = () => {
                console.log('✅ KundaliSVG script loaded successfully');
            };
            script.onerror = () => {
                console.error('❌ Failed to load KundaliSVG script');
            };
            document.head.appendChild(script);
        };
        loadKundaliScript();
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Calculating Vedic Kundli</h3>
                        <p className="text-gray-600">Using Original VedicJyotish System</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
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

    if (!kundliData) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-gray-500 text-6xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data</h3>
                        <p className="text-gray-600 mb-4">Unable to generate Kundli data</p>
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vedic Kundli</h1>
                        <p className="text-gray-600">Based on Original VedicJyotish System</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {onBackToForm && (
                            <button
                                onClick={onBackToForm}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                                Back to Form
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Birth Details Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Birth Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Name</h3>
                                <p className="text-gray-800 font-medium">{birthData.name}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Date of Birth</h3>
                                <p className="text-gray-800 font-medium">{birthData.birthYear}-{birthData.birthMonth.toString().padStart(2, '0')}-{birthData.birthDay.toString().padStart(2, '0')}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Time of Birth</h3>
                                <p className="text-gray-800 font-medium">{birthData.birthHour.toString().padStart(2, '0')}:{birthData.birthMinute.toString().padStart(2, '0')}:{(birthData.birthSecond || 0).toString().padStart(2, '0')}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Place of Birth</h3>
                                <p className="text-gray-800 font-medium">{birthData.birthPlace}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Latitude</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.latitude.toFixed(2)}°</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Longitude</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.longitude.toFixed(2)}°</p>
                            </div>
                        </div>
                    </div>

                    {/* Panchanga Details */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Panchanga Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Tithi</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.tithi.name.hindi}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Nakshatra</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.nakshatra.name.hindi}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Yoga</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.yoga.name.hindi}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Karana</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.karana.name.hindi}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Vara</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.vara.name.hindi}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Sunrise</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.sunrise.dt.toFormat('HH:mm:ss')}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Sunset</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.sunset.dt.toFormat('HH:mm:ss')}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-green-600 mb-1">Ayanamsa</h3>
                                <p className="text-gray-800 font-medium">{kundliData.panchanga.ayanamsa.toFixed(2)}°</p>
                            </div>
                        </div>
                    </div>

                    {/* Planetary Information Table */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Planetary Information</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-gray-800">
                                <thead>
                                    <tr className="border-b border-blue-200">
                                        <th className="text-left py-3 px-4 font-semibold">Planet</th>
                                        <th className="text-left py-3 px-4 font-semibold">Rasi</th>
                                        <th className="text-left py-3 px-4 font-semibold">Degree</th>
                                        <th className="text-left py-3 px-4 font-semibold">House</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(kundliData.planets).map(([planet, data]) => (
                                        <tr key={planet} className="border-b border-blue-100">
                                            <td className="py-3 px-4 font-medium text-blue-700">{planet}</td>
                                            <td className="py-3 px-4">{data.rasi.rasi_num}</td>
                                            <td className="py-3 px-4">{data.rasi.degree.toFixed(2)}°</td>
                                            <td className="py-3 px-4">{data.rasi.rasi_num}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Birth Charts Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Birth Charts</h2>

                        <div className="space-y-8">
                            {/* Ascendant Chart */}
                            <div>
                                <h3 className="text-lg font-semibold text-orange-600 mb-4">Ascendant Chart (D1)</h3>
                                <div className="bg-white/70 rounded-lg p-4">
                                    {kundliData && (
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D1",
                                                ascendant: kundliData.planets.Ascendant?.rasi.rasi_num || 1,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.planets).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: data.house,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Hora Chart */}
                            <div>
                                <h3 className="text-lg font-semibold text-orange-600 mb-4">Hora Chart (D2) - Wealth and Fortune</h3>
                                <div className="bg-white/70 rounded-lg p-4">
                                    {kundliData && (
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D2",
                                                ascendant: kundliData.planets.Ascendant?.rasi.rasi_num || 1,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.planets).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: Math.floor(data.divisional.hora.degree / 30) + 1,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Shashthamsa Chart */}
                            <div>
                                <h3 className="text-lg font-semibold text-orange-600 mb-4">Shashthamsa Chart (D6) - Health and Diseases</h3>
                                <div className="bg-white/70 rounded-lg p-4">
                                    {kundliData && (
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D6",
                                                ascendant: kundliData.planets.Ascendant?.rasi.rasi_num || 1,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.planets).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: Math.floor(data.divisional.shashtamsa.degree / 30) + 1,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Ashthamsa Chart */}
                            <div>
                                <h3 className="text-lg font-semibold text-orange-600 mb-4">Ashthamsa Chart (D8) - Longevity and Death</h3>
                                <div className="bg-white/70 rounded-lg p-4">
                                    {kundliData && (
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D8",
                                                ascendant: kundliData.planets.Ascendant?.rasi.rasi_num || 1,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.planets).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: Math.floor(data.divisional.ashtamsa.degree / 30) + 1,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Navamsa Chart */}
                            <div>
                                <h3 className="text-lg font-semibold text-orange-600 mb-4">Navamsa Chart (D9) - Marriage and Spouse</h3>
                                <div className="bg-white/70 rounded-lg p-4">
                                    {kundliData && (
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D9",
                                                ascendant: kundliData.planets.Ascendant?.rasi.rasi_num || 1,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.planets).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: Math.floor(data.divisional.navamsa.degree / 30) + 1,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* YogPhala Section */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">YogPhala (Astrological Predictions)</h2>
                        <div className="space-y-4">
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-pink-600 mb-2">Ascendant Effects</h3>
                                <p className="text-gray-700">
                                    The native born in Aquarius ascendant will be intelligent, humanitarian,
                                    and have a strong sense of justice. They will be innovative and forward-thinking.
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-pink-600 mb-2">Planetary Effects</h3>
                                <p className="text-gray-700">
                                    Sun in Libra indicates diplomatic nature and artistic abilities.
                                    Moon in Taurus shows emotional stability and material comfort.
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-pink-600 mb-2">House Analysis</h3>
                                <p className="text-gray-700">
                                    Strong 7th house indicates good marriage prospects.
                                    10th house shows career success and recognition.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vimsottari Dasa Section */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Vimsottari Dasa</h2>
                        {storedKundli?.analysis?.dasha?.vimshottari ? (
                            <div className="space-y-4">
                                <div className="bg-white/70 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-yellow-600">Current Period</h3>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                            {storedKundli.analysis.dasha.vimshottari.status === 'accurate' ? 'Verified' : 'Active'}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 font-bold text-xl mb-1">
                                        {storedKundli.analysis.dasha.vimshottari.current}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {storedKundli.analysis.dasha.vimshottari.currentNp}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/70 rounded-lg p-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                                        <h3 className="text-sm font-semibold text-yellow-600 mb-1">Maha Dasha</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-gray-800">{storedKundli.analysis.dasha.vimshottari.mahadasha.planet}</span>
                                            <span className="text-sm text-gray-500">({storedKundli.analysis.dasha.vimshottari.mahadasha.planetNp})</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 flex flex-col gap-0.5">
                                            <span>Start: {new Date(storedKundli.analysis.dasha.vimshottari.mahadasha.start).toLocaleDateString()}</span>
                                            <span>End: {new Date(storedKundli.analysis.dasha.vimshottari.mahadasha.end).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 rounded-lg p-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                                        <h3 className="text-sm font-semibold text-orange-600 mb-1">Antar Dasa</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-bold text-gray-800">{storedKundli.analysis.dasha.vimshottari.antardasha.planet}</span>
                                            <span className="text-sm text-gray-500">({storedKundli.analysis.dasha.vimshottari.antardasha.planetNp})</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 flex flex-col gap-0.5">
                                            <span>Start: {new Date(storedKundli.analysis.dasha.vimshottari.antardasha.start).toLocaleDateString()}</span>
                                            <span>End: {new Date(storedKundli.analysis.dasha.vimshottari.antardasha.end).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/70 rounded-lg p-6 text-center">
                                <div className="text-yellow-400 text-4xl mb-3">⏳</div>
                                <p className="text-gray-600 font-medium">Dasha calculations are being generated...</p>
                                <p className="text-gray-400 text-sm mt-1">Please wait for the AI Analysis to complete, or data is missing.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <div className="text-center">
                        <p className="text-gray-600 text-sm">
                            This Vedic Kundli is generated using the original VedicJyotish system
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Reference: <a href="https://github.com/PtPrashantTripathi/VedicJyotish" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">VedicJyotish Repository</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
