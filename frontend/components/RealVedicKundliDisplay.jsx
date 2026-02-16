'use client';

import { useState, useEffect } from 'react';
import DynamicKundliChart from './DynamicKundliChart';

export default function RealVedicKundliDisplay({ kundliData, onClose, onBackToForm }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (kundliData) {
            console.log('🔮 Real VedicJyotish Kundli Data:', kundliData);
            setLoading(false);
        }
    }, [kundliData]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Calculating Kundli</h3>
                        <p className="text-gray-600">Using VedicJyotish system with Swiss Ephemeris...</p>
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
                {/* Header - Hidden */}
                {/* <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vedic Kundli</h1>
                        <p className="text-gray-600">Powered by VedicJyotish System with Swiss Ephemeris</p>
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
                </div> */}

                <div className="p-6 space-y-8">
                    {/* Birth Details Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Birth Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Name</h3>
                                <p className="text-gray-800 font-medium">{kundliData.name}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Date of Birth</h3>
                                <p className="text-gray-800 font-medium">
                                    {kundliData.birthData.birthDay}/{kundliData.birthData.birthMonth}/{kundliData.birthData.birthYear}
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Time of Birth</h3>
                                <p className="text-gray-800 font-medium">
                                    {kundliData.birthData.birthHour.toString().padStart(2, '0')}:{kundliData.birthData.birthMinute.toString().padStart(2, '0')}
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Place of Birth</h3>
                                <p className="text-gray-800 font-medium">{kundliData.birthData.city}</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Latitude</h3>
                                <p className="text-gray-800 font-medium">{kundliData.birthData.latitude}°</p>
                            </div>
                            <div className="bg-white/70 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-purple-600 mb-1">Longitude</h3>
                                <p className="text-gray-800 font-medium">{kundliData.birthData.longitude}°</p>
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
                        </div>
                    </div>

                    {/* Birth Chart (D1) */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Birth Chart (D1) - Ascendant Chart</h2>
                        <div className="flex justify-center">
                            <DynamicKundliChart
                                chartData={{
                                    type: "D1",
                                    ascendant: kundliData.ascendant,
                                    houses: kundliData.houses.map(h => h.number),
                                    planets: Object.entries(kundliData.planets).map(([name, data]) => ({
                                        name: data.name.hindi,
                                        house: data.house,
                                        color: data.color
                                    }))
                                }}
                            />
                        </div>
                    </div>

                    {/* Divisional Charts */}
                    {kundliData.divisionalCharts && (
                        <div className="space-y-6">
                            {/* D2 Chart */}
                            {kundliData.divisionalCharts.D2 && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Hora Chart (D2)</h2>
                                    <div className="flex justify-center">
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D2",
                                                ascendant: kundliData.ascendant,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.divisionalCharts.D2).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: data.house,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* D6 Chart */}
                            {kundliData.divisionalCharts.D6 && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Shashtamsa Chart (D6)</h2>
                                    <div className="flex justify-center">
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D6",
                                                ascendant: kundliData.ascendant,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.divisionalCharts.D6).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: data.house,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* D8 Chart */}
                            {kundliData.divisionalCharts.D8 && (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Ashtamsa Chart (D8)</h2>
                                    <div className="flex justify-center">
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D8",
                                                ascendant: kundliData.ascendant,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.divisionalCharts.D8).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: data.house,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* D9 Chart */}
                            {kundliData.divisionalCharts.D9 && (
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Navamsa Chart (D9)</h2>
                                    <div className="flex justify-center">
                                        <DynamicKundliChart
                                            chartData={{
                                                type: "D9",
                                                ascendant: kundliData.ascendant,
                                                houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                                planets: Object.entries(kundliData.divisionalCharts.D9).map(([name, data]) => ({
                                                    name: data.name.hindi,
                                                    house: data.house,
                                                    color: data.color
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Planetary Positions */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Planetary Positions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(kundliData.planets).map(([planetName, planetData]) => (
                                <div key={planetName} className="bg-white/70 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-indigo-600 mb-1">
                                        {planetData.name.hindi} ({planetData.name.english})
                                    </h3>
                                    <p className="text-gray-800 font-medium">
                                        House {planetData.house} • Rasi {planetData.rasi}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Degree: {planetData.degree?.toFixed(2)}°
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
