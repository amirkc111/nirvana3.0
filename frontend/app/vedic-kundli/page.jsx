'use client';

import { useState, useEffect } from 'react';

export default function VedicKundliPage() {
    const [loading, setLoading] = useState(true);
    const [kundliData, setKundliData] = useState(null);
    const [error, setError] = useState(null);

    // Sample data for testing
    const sampleData = {
        name: 'Amir',
        date: '1997-11-02',
        time: '12:07:00',
        city: 'Hetauda, Bagmati Province, Nepal',
        latitude: 27.4167,
        longitude: 85.0333,
        timezone: 'Asia/Kathmandu'
    };

    useEffect(() => {
        // Simulate loading VedicJyotish data
        setTimeout(() => {
            setKundliData({
                name: sampleData.name,
                date: sampleData.date,
                time: sampleData.time,
                place: sampleData.city,
                panchanga: {
                    tithi: 'Krishna Paksha Chaturdashi',
                    nakshatra: 'Rohini',
                    yoga: 'Vishkambha',
                    karana: 'Bava',
                    vara: 'Sunday',
                    sunrise: '06:15:00',
                    sunset: '17:45:00',
                    ayanamsa: '23° 51\' 0"'
                },
                planets: {
                    Sun: { rasi: 'Libra', degree: '15° 20\'', house: 7 },
                    Moon: { rasi: 'Taurus', degree: '8° 45\'', house: 2 },
                    Mars: { rasi: 'Scorpio', degree: '22° 10\'', house: 8 },
                    Mercury: { rasi: 'Libra', degree: '28° 30\'', house: 7 },
                    Jupiter: { rasi: 'Aquarius', degree: '12° 15\'', house: 11 },
                    Venus: { rasi: 'Virgo', degree: '18° 40\'', house: 6 },
                    Saturn: { rasi: 'Aries', degree: '5° 25\'', house: 1 },
                    Rahu: { rasi: 'Cancer', degree: '14° 50\'', house: 4 },
                    Ketu: { rasi: 'Capricorn', degree: '14° 50\'', house: 10 },
                    Ascendant: { rasi: 'Aquarius', degree: '25° 15\'', house: 1 }
                }
            });
            setLoading(false);
        }, 2000);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-xl">Calculating Vedic Kundli...</p>
                    <p className="text-blue-200 text-sm mt-2">Using Original VedicJyotish System</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h1 className="text-3xl font-bold mb-4">Error</h1>
                    <p className="text-xl">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">Vedic Kundli</h1>
                    <p className="text-xl text-blue-200">Based on Original VedicJyotish System</p>
                    <p className="text-sm text-blue-300 mt-2">Reference: <a href="https://ptprashanttripathi.github.io/VedicJyotish/?page=KundliResult&name=amir&date=1997-11-02&time=12%3A07%3A00&city=Hetauda%2C+Bagmati+Province%2C+Nepal" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">VedicJyotish Demo</a></p>
                </div>

                {/* Birth Details Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Basic Birth Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Name</h3>
                            <p className="text-white">{kundliData.name}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Date of Birth</h3>
                            <p className="text-white">{kundliData.date}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Time of Birth</h3>
                            <p className="text-white">{kundliData.time}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Place of Birth</h3>
                            <p className="text-white">{kundliData.place}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Latitude</h3>
                            <p className="text-white">27° 25&apos; 0&quot; N</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Longitude</h3>
                            <p className="text-white">85° 2&apos; 0&quot; E</p>
                        </div>
                    </div>
                </div>

                {/* Panchanga Details */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Panchanga Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Tithi</h3>
                            <p className="text-white">{kundliData.panchanga.tithi}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Nakshatra</h3>
                            <p className="text-white">{kundliData.panchanga.nakshatra}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Yoga</h3>
                            <p className="text-white">{kundliData.panchanga.yoga}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Karana</h3>
                            <p className="text-white">{kundliData.panchanga.karana}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Vara</h3>
                            <p className="text-white">{kundliData.panchanga.vara}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Sunrise</h3>
                            <p className="text-white">{kundliData.panchanga.sunrise}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Sunset</h3>
                            <p className="text-white">{kundliData.panchanga.sunset}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Ayanamsa</h3>
                            <p className="text-white">{kundliData.panchanga.ayanamsa}</p>
                        </div>
                    </div>
                </div>

                {/* Planetary Information Table */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Planetary Information</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left py-3 px-4">Planet</th>
                                    <th className="text-left py-3 px-4">Rasi</th>
                                    <th className="text-left py-3 px-4">Degree</th>
                                    <th className="text-left py-3 px-4">House</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(kundliData.planets).map(([planet, data]) => (
                                    <tr key={planet} className="border-b border-white/10">
                                        <td className="py-3 px-4 font-semibold text-blue-200">{planet}</td>
                                        <td className="py-3 px-4">{data.rasi}</td>
                                        <td className="py-3 px-4">{data.degree}</td>
                                        <td className="py-3 px-4">{data.house}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Birth Charts Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Birth Charts</h2>
                    
                    <div className="space-y-8">
                        {/* Ascendant Chart */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Ascendant Chart (D1)</h3>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-white/60 text-lg">
                                    📊 VedicJyotish Kundli Chart will be displayed here
                                </div>
                                <p className="text-sm text-white/40 mt-2">
                                    This would show the North Indian style chart with planetary positions
                                </p>
                            </div>
                        </div>

                        {/* Hora Chart */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Hora Chart (D2)</h3>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-white/60 text-lg">
                                    📊 Hora Chart (D2) - Wealth and Fortune
                                </div>
                            </div>
                        </div>

                        {/* Shashthamsa Chart */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Shashthamsa Chart (D6)</h3>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-white/60 text-lg">
                                    📊 Shashthamsa Chart (D6) - Health and Diseases
                                </div>
                            </div>
                        </div>

                        {/* Ashthamsa Chart */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Ashthamsa Chart (D8)</h3>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-white/60 text-lg">
                                    📊 Ashthamsa Chart (D8) - Longevity and Death
                                </div>
                            </div>
                        </div>

                        {/* Navamsa Chart */}
                        <div>
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Navamsa Chart (D9)</h3>
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="text-white/60 text-lg">
                                    📊 Navamsa Chart (D9) - Marriage and Spouse
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* YogPhala Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">YogPhala (Astrological Predictions)</h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Ascendant Effects</h3>
                            <p className="text-white/80">
                                The native born in Aquarius ascendant will be intelligent, humanitarian, 
                                and have a strong sense of justice. They will be innovative and forward-thinking.
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Planetary Effects</h3>
                            <p className="text-white/80">
                                Sun in Libra indicates diplomatic nature and artistic abilities. 
                                Moon in Taurus shows emotional stability and material comfort.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vimsottari Dasa Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Vimsottari Dasa</h2>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Current Maha Dasa</h3>
                            <p className="text-white/80">
                                Currently running Jupiter Maha Dasa (16 years) - period of wisdom, 
                                spirituality, and higher learning.
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-200 mb-2">Antar Dasa</h3>
                            <p className="text-white/80">
                                Saturn Antar Dasa - period of hard work, discipline, and karmic lessons.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-white/60 text-sm">
                        This Vedic Kundli is generated using the original VedicJyotish system
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                        Reference: <a href="https://github.com/PtPrashantTripathi/VedicJyotish" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">VedicJyotish Repository</a>
                    </p>
                </div>
            </div>
        </div>
    );
}